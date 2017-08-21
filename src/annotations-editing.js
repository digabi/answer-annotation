(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'lodash', 'baconjs', './annotations-rendering'], factory)
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'), require('lodash'), require('bacon'), require('./annotations-rendering'))
  } else {
    root.annotationsEditing = factory(root.jQuery, root._, root.bacon, root.annotationsRendering)
  }
} (this, function($, _, Bacon, answerAnnotationsRendering) {
  'use strict'

  const ESC = 27
  const ENTER = 13

  return {
    setupAnnotationEditing,
    setupAnnotationDisplaying
  }

  function setupAnnotationEditing($containerElement,
                                  gradingUriPrefix,
                                  saveAnnotation,
                                  localize) {
    setupAnnotationAddition($containerElement, gradingUriPrefix)
    setupAnnotationRemoval($containerElement, gradingUriPrefix)

    function setupAnnotationRemoval($answers, gradingUriPrefix) {
      $answers.on('mousedown', '.remove-annotation-area', event => {
        event.preventDefault()
        removeAnnotation($(event.target).closest('.answerAnnotation'), gradingUriPrefix)
      })

      function removeAnnotation($annotationElem, gradingUriPrefix) { // eslint-disable-line no-shadow
        const $answerText = $annotationElem.closest('.answerText')
        const removedAnnotationIndex = $answerText.find('.answerAnnotation').index($annotationElem)
        deleteIndex(gradingUriPrefix, $answerText, removedAnnotationIndex)
        answerAnnotationsRendering.renderAnnotationsForElement($answerText)
      }

      function deleteIndex(gradingUriPrefix, $answerText, idx) { // eslint-disable-line no-shadow
        const annotations = answerAnnotationsRendering.get($answerText)
        annotations.splice(idx, 1)
        saveAnnotation(gradingUriPrefix, getAnswerId($answerText), annotations)
      }
    }

    function setupAnnotationAddition($containerElement, gradingUriPrefix) {
      preventDragSelectionFromOverlappingCensorAnswerText($containerElement)
      $containerElement.asEventStream('mouseup')
        .filter(hasTextSelectedInAnswerText)
        .map(() => {
          $('.remove-annotation-popup').remove()
          return getBrowserTextSelection().getRangeAt(0)
        })
        .filter(range => {
          if (selectionHasNothingToUnderline(range)) {
            return false
          } else {
            const $container = $(range.commonAncestorContainer)
            return !$container.hasClass('add-annotation-popup') &&
              ($container.hasClass('answerText') || $container.parents('div.answerText').toArray().length > 0)
          }
        })
        .flatMapLatest(annotationPopup)
        .onValue(addAnnotation(gradingUriPrefix))

      $containerElement.asEventStream('mousedown')
        .filter(e => !$(e.target).closest('.add-annotation-text').length && !$(e.target).closest('.annotation-message').length)
        .merge($containerElement.asEventStream("keyup").filter(e => e.keyCode === ESC))
        .onValue(() => {
          getBrowserTextSelection().removeAllRanges()
          // Render annotations for all answers that have popup open. This clears the popup and annotation that was merged for rendering before opening popup.
          $('.add-annotation-popup').each((index, popup) => {
            answerAnnotationsRendering.renderAnnotationsForElement($(popup).closest(".answerText"))
          })
        })

      function selectionHasNothingToUnderline(range) {
        const contents = range.cloneContents()
        const hasImages = _.contains(_.toArray(contents.children).map(x => x.tagName), 'IMG')
        return contents.textContent.length === 0 && !hasImages
      }

      function preventDragSelectionFromOverlappingCensorAnswerText($containerElem) {
        if (isCensor()) {
          $containerElem.on('mousedown mouseup', e => {
            $('.answerText.is_censor .answerAnnotation').toggleClass('no-mouse', e.type === 'mousedown')
          })
        }
      }

      function getPopupOffset(range) {
        const markerElement = document.createElement("span")
        markerElement.appendChild(document.createTextNode("\ufeff"))
        range.insertNode(markerElement)
        const $markerElement = $(markerElement)
        const offset = $markerElement.position()
        $markerElement.remove()
        return offset
      }

      function annotationPopup(range) {
        const selectionStartOffset = getPopupOffset(range)

        let $answerText = $(range.startContainer).closest('.answerText')
        const annotationPos = calculatePosition($answerText, range)

        if (isCensor() && !$answerText.hasClass('is_censor')) {
          // render annotations to censor answer text element even if event cought via double click
          $answerText = $(range.startContainer).closest('.answer').find('.answerText.is_censor')
        }

        const messages = answerAnnotationsRendering.getOverlappingMessages($answerText, annotationPos.startIndex, annotationPos.length)
        const renderedMessages = messages.reduceRight((msg, str) => `${str} / ${msg}`, '')

        getBrowserTextSelection().removeAllRanges()

        // Merge and render annotation to show what range it will contain if annotation gets added
        // Merged annotation not saved yet, so on cancel previous state is rendered
        const mergedAnnotations = answerAnnotationsRendering.mergeAnnotation(answerAnnotationsRendering.get($answerText), annotationPos)
        answerAnnotationsRendering.renderGivenAnnotations($answerText, mergedAnnotations)

        const $popup = localize($(`<div class="add-annotation-popup"><input class="add-annotation-text" type="text" value="${renderedMessages}"/><i class="fa fa-comment"></i><button data-i18n="arpa.annotate"></button></div>`))
        $answerText.append($popup)
        $popup.css({
          "position": "absolute",
          "top": selectionStartOffset.top - $popup.outerHeight(),
          "left": selectionStartOffset.left
        })
        $popup.find('input').focus()

        return $popup.find('button').asEventStream('mousedown')
          .merge($popup.asEventStream("keyup").filter(e => e.keyCode === ENTER))
          .map(() => ({
            annotation: annotationPos,
            $answerText
          }))
      }

      function addAnnotation(gradingUriPrefix) { // eslint-disable-line no-shadow
        return annotationData => {
          if (annotationData.annotation.length > 0) {
            add(gradingUriPrefix, annotationData.$answerText, annotationData.annotation.startIndex, annotationData.annotation.length, $('.add-annotation-text').val().trim())
            answerAnnotationsRendering.renderAnnotationsForElement(annotationData.$answerText)
          }
        }

        function add(gradingUriPrefix, $answerText, startIndex, length, message) { // eslint-disable-line no-shadow
          const newAnnotation = {startIndex, length, message}
          const annotations = answerAnnotationsRendering.get($answerText) ?
            answerAnnotationsRendering.mergeAnnotation(answerAnnotationsRendering.get($answerText), newAnnotation) :
            [newAnnotation]
          $answerText.data('annotations', annotations)
          saveAnnotation(gradingUriPrefix, getAnswerId($answerText), annotations)
        }
      }

      function calculatePosition($answerText, range) {
        const answerNodes = answerAnnotationsRendering.allNodesUnder($answerText.get(0))
        const charactersBefore = charactersBeforeContainer(range.startContainer, range.startOffset)
        const charactersUntilEnd = charactersBeforeContainer(range.endContainer, range.endOffset)
        return {
          startIndex: charactersBefore,
          length: charactersUntilEnd - charactersBefore
        }

        function charactersBeforeContainer(rangeContainer, offset) {
          const containerIsImg = rangeContainer === $answerText.get(0)
          const container = containerIsImg ? rangeContainer.childNodes[offset] : rangeContainer
          const offsetInside = containerIsImg ? 0 : offset
          const nodesBeforeContainer = _.takeWhile(answerNodes, node => node !== container)
          return offsetInside + _.sum(nodesBeforeContainer.map(answerAnnotationsRendering.toNodeLength))
        }
      }
    }
  }

  function setupAnnotationDisplaying($answers) {
    let fadeOutDelayTimeout
    $answers.on('mouseenter', '.answerAnnotation', event => {
      const $annotation = $(event.target)
      if(addAnnotationPopupIsVisible() || hasTextSelectedInAnswerText()) { return }
      clearTimeout(fadeOutDelayTimeout)
      if(popupAlreadyShownForCurrentAnnotation(event)) {
        $annotation.find('.remove-annotation-popup').stop().show().css({'opacity': 1})
      } else {
        clearAllRemovePopups()
        renderRemovePopup(event)
      }
    })
    $answers.on('mouseleave', '.answerAnnotation', event => {
      fadeOutDelayTimeout = setTimeout(() => {
        removeRemovePopup(event)
      }, 400)
    })

    function popupAlreadyShownForCurrentAnnotation(event) {
      const mouseOverAnnotationElem = $(event.target).closest('.answerAnnotation')[0]
      const popupsCurrentAnnotationElem = $('.remove-annotation-popup:visible').closest('.answerAnnotation')[0]
      return event && mouseOverAnnotationElem && popupsCurrentAnnotationElem && mouseOverAnnotationElem.isEqualNode(popupsCurrentAnnotationElem)
    }

    function addAnnotationPopupIsVisible() {
      return $('.add-annotation-popup').is(':visible')
    }

    function clearAllRemovePopups() {
      $('.remove-annotation-popup').remove()
    }

    function renderRemovePopup(event) {
      const $annotation = $(event.currentTarget)
      const $popup = popupWithMessage($annotation, $annotation.attr('data-message'))
      $annotation.append($popup)
      const left = mouseOffsetX(event) - ($popup.outerWidth() / 2)
      $popup.css({left})
      $popup.fadeIn()
    }

    function removeRemovePopup(event) {
      const $annotation = $(event.target).closest('.answerAnnotation')
      const popup = $annotation.find('.remove-annotation-popup')
      popup.fadeOut(100, () => {
        popup.remove()
      })
    }

    function popupWithMessage($annotation, message) {
      const $messageContainer = $('<span class="remove-annotation-popup"><span class="annotation-message"></span></span>')
      $messageContainer.find('.annotation-message').text(message || '-')
      if(isAllowedToRemoveAnnotation($annotation)) { $messageContainer.append('<i class="fa fa-times-circle remove-annotation-area"></i>') }
      return $messageContainer
    }

    function isAllowedToRemoveAnnotation($annotation) {
      return isPregradingAndScoringEnabled() || isCensorAndOwnAnnotation()

      function isPregradingAndScoringEnabled() {
        const $body = $('body')
        return $body.hasClass('is_pregrading') && !$body.hasClass('preview')
      }

      function isCensorAndOwnAnnotation() { return isCensor() && $annotation.closest('.answerText').hasClass('is_censor') }
    }

    function mouseOffsetX(mousemove) {
      const annotation = mousemove.target
      const annotationLeftOffsetFromPageEdge = $(annotation).offsetParent().offset().left + annotation.offsetLeft
      return mousemove.pageX - annotationLeftOffsetFromPageEdge
    }
  }


  function isCensor() { return $('body').hasClass('is_censor') }

  function getAnswerId($answerText) { return $answerText.closest('.answer').attr('data-answer-id') }

  function getBrowserTextSelection() {
    if(typeof window.getSelection !== "undefined") {
      return window.getSelection()
    } else if(typeof document.selection !== "undefined" && document.selection.type === "Text") {
      return document.selection
    } else {
      return undefined
    }
  }

  function hasTextSelectedInAnswerText() {
    const selection = getBrowserTextSelection()
    return selection && selectionInAnswerText(selection) && (isRangeSelection(selection) || textSelectedInRange(selection))

    function selectionInAnswerText(sel) {
      if (sel.type === 'None') return false
      const $startContainer = $(sel.getRangeAt(0).startContainer)
      return sel.rangeCount &&
        $startContainer.closest('.answerText').length === 1 &&
        $startContainer.closest('.remove-annotation-popup').length === 0
    }

    function isRangeSelection(sel) { return _.get(sel, 'type', '') === 'Range' }

    function textSelectedInRange(sel) { return _.get(sel, 'rangeCount', 0) > 0 && sel.getRangeAt(0).toString().length > 0 }
  }
}))
