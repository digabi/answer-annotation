(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'lodash', 'bacon', './annotations-rendering'], factory)
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'), require('lodash'), require('bacon'), require('./annotations-rendering'))
  } else {
    root.annotationsEditing = factory(root.jQuery, root._, root.bacon, root.annotationsRendering)
  }
}(this, function ($, _, Bacon, answerAnnotationsRendering) {
  'use strict'
  $.fn.asEventStream = Bacon.$.asEventStream
  var ESC = 27
  var ENTER = 13

  return {
    setupAnnotationEditing: setupAnnotationEditing,
    setupAnnotationDisplaying: setupAnnotationDisplaying
  }

  function setupAnnotationEditing($containerElement, gradingUriPrefix, saveAnnotation, localize) {
    setupAnnotationAddition($containerElement, gradingUriPrefix)
    setupAnnotationRemoval($containerElement, gradingUriPrefix)

    function setupAnnotationRemoval($answers, gradingUriPrefix) {
      $answers.on('mousedown', '.remove-annotation-area', function (event) {
        event.preventDefault()
        removeAnnotation($(event.target).closest('.answerAnnotation'), gradingUriPrefix)
      })

      function removeAnnotation($annotationElem, gradingUriPrefix) {
        // eslint-disable-line no-shadow
        var $answerText = $annotationElem.closest('.answerText')
        var removedAnnotationIndex = $answerText.find('.answerAnnotation').index($annotationElem)
        deleteIndex(gradingUriPrefix, $answerText, removedAnnotationIndex)
        answerAnnotationsRendering.renderAnnotationsForElement($answerText)
      }

      function deleteIndex(gradingUriPrefix, $answerText, idx) {
        // eslint-disable-line no-shadow
        var annotations = answerAnnotationsRendering.get($answerText)
        annotations.splice(idx, 1)
        saveAnnotation(gradingUriPrefix, getAnswerId($answerText), annotations)
      }
    }

    function setupAnnotationAddition($containerElement, gradingUriPrefix) {
      preventDragSelectionFromOverlappingCensorAnswerText($containerElement)
      $containerElement.asEventStream('mouseup').filter(hasTextSelectedInAnswerText).map(function () {
        $('.remove-annotation-popup').remove()
        return getBrowserTextSelection().getRangeAt(0)
      }).filter(function (range) {
        if (selectionHasNothingToUnderline(range)) {
          return false
        } else {
          var $container = $(range.commonAncestorContainer)
          return !$container.hasClass('add-annotation-popup') && ($container.hasClass('answerText') || $container.parents('div.answerText').toArray().length > 0)
        }
      }).flatMapLatest(annotationPopup).onValue(addAnnotation(gradingUriPrefix))

      $containerElement.asEventStream('mousedown').filter(function (e) {
        return !$(e.target).closest('.add-annotation-text').length && !$(e.target).closest('.annotation-message').length
      }).merge($containerElement.asEventStream("keyup").filter(function (e) {
        return e.keyCode === ESC
      })).onValue(function () {
        getBrowserTextSelection().removeAllRanges()
        // Render annotations for all answers that have popup open. This clears the popup and annotation that was merged for rendering before opening popup.
        $('.add-annotation-popup').each(function (index, popup) {
          answerAnnotationsRendering.renderAnnotationsForElement($(popup).closest(".answerText"))
        })
      })

      function selectionHasNothingToUnderline(range) {
        var contents = range.cloneContents()
        var hasImages = _.contains(_.toArray(contents.children).map(function (x) {
          return x.tagName
        }), 'IMG')
        return contents.textContent.length === 0 && !hasImages
      }

      function preventDragSelectionFromOverlappingCensorAnswerText($containerElem) {
        if (isCensor()) {
          $containerElem.on('mousedown mouseup', function (e) {
            $('.answerText.is_censor .answerAnnotation').toggleClass('no-mouse', e.type === 'mousedown')
          })
        }
      }

      function getPopupOffset(range) {
        var markerElement = document.createElement("span")
        markerElement.appendChild(document.createTextNode('\uFEFF'))
        range.insertNode(markerElement)
        var $markerElement = $(markerElement)
        var offset = $markerElement.position()
        $markerElement.remove()
        return offset
      }

      function annotationPopup(range) {
        var selectionStartOffset = getPopupOffset(range)

        var $answerText = $(range.startContainer).closest('.answerText')
        var annotationPos = calculatePosition($answerText, range)

        if (isCensor() && !$answerText.hasClass('is_censor')) {
          // render annotations to censor answer text element even if event cought via double click
          $answerText = $(range.startContainer).closest('.answer').find('.answerText.is_censor')
        }

        var messages = answerAnnotationsRendering.getOverlappingMessages($answerText, annotationPos.startIndex, annotationPos.length)
        var renderedMessages = messages.reduceRight(function (msg, str) {
          return str + ' / ' + msg
        }, '')

        getBrowserTextSelection().removeAllRanges()

        // Merge and render annotation to show what range it will contain if annotation gets added
        // Merged annotation not saved yet, so on cancel previous state is rendered
        var mergedAnnotations = answerAnnotationsRendering.mergeAnnotation(answerAnnotationsRendering.get($answerText), annotationPos)
        answerAnnotationsRendering.renderGivenAnnotations($answerText, mergedAnnotations)

        var $popup = localize($('<div class="add-annotation-popup"><input class="add-annotation-text" type="text" value="' + renderedMessages + '"/><i class="fa fa-comment"></i><button data-i18n="arpa.annotate"></button></div>'))
        $answerText.append($popup)
        $popup.css({
          "position": "absolute",
          "top": selectionStartOffset.top - $popup.outerHeight(),
          "left": selectionStartOffset.left
        })
        $popup.find('input').focus()

        return $popup.find('button').asEventStream('mousedown').merge($popup.asEventStream("keyup").filter(function (e) {
          return e.keyCode === ENTER
        })).map(function () {
          return {
            annotation: annotationPos,
            $answerText: $answerText
          }
        })
      }

      function addAnnotation(gradingUriPrefix) {
        // eslint-disable-line no-shadow
        return function (annotationData) {
          if (annotationData.annotation.length > 0) {
            add(gradingUriPrefix, annotationData.$answerText, annotationData.annotation.startIndex, annotationData.annotation.length, $('.add-annotation-text').val().trim())
            answerAnnotationsRendering.renderAnnotationsForElement(annotationData.$answerText)
          }
        }

        function add(gradingUriPrefix, $answerText, startIndex, length, message) {
          // eslint-disable-line no-shadow
          var newAnnotation = {startIndex: startIndex, length: length, message: message}
          var annotations = answerAnnotationsRendering.get($answerText) ? answerAnnotationsRendering.mergeAnnotation(answerAnnotationsRendering.get($answerText), newAnnotation) : [newAnnotation]
          $answerText.data('annotations', annotations)
          saveAnnotation(gradingUriPrefix, getAnswerId($answerText), annotations)
        }
      }

      function calculatePosition($answerText, range) {
        var answerNodes = answerAnnotationsRendering.allContentNodesUnder($answerText.get(0))
        var charactersBefore = charactersBeforeContainer(range.startContainer, range.startOffset)
        var charactersUntilEnd = charactersBeforeContainer(range.endContainer, range.endOffset)
        return {
          startIndex: charactersBefore,
          length: charactersUntilEnd - charactersBefore
        }

        function charactersBeforeContainer(rangeContainer, offset) {
          var containerIsTag = rangeContainer === $answerText.get(0)
          var container = containerIsTag ? rangeContainer.childNodes[offset] : rangeContainer
          var offsetInside = containerIsTag ? 0 : offset
          var nodesBeforeContainer = _.takeWhile(answerNodes, function (node) {
            return node !== container
          })
          return offsetInside + _.sum(nodesBeforeContainer.map(answerAnnotationsRendering.toNodeLength))
        }
      }
    }
  }

  function setupAnnotationDisplaying($answers) {
    var fadeOutDelayTimeout = void 0
    $answers.on('mouseenter', '.answerAnnotation', function (event) {
      var $annotation = $(event.target)
      if (addAnnotationPopupIsVisible() || hasTextSelectedInAnswerText()) {
        return
      }
      clearTimeout(fadeOutDelayTimeout)
      if (popupAlreadyShownForCurrentAnnotation(event)) {
        $annotation.find('.remove-annotation-popup').stop().show().css({'opacity': 1})
      } else {
        clearAllRemovePopups()
        renderRemovePopup(event)
      }
    })
    $answers.on('mouseleave', '.answerAnnotation', function (event) {
      fadeOutDelayTimeout = setTimeout(function () {
        removeRemovePopup(event)
      }, 400)
    })

    function popupAlreadyShownForCurrentAnnotation(event) {
      var mouseOverAnnotationElem = $(event.target).closest('.answerAnnotation')[0]
      var popupsCurrentAnnotationElem = $('.remove-annotation-popup:visible').closest('.answerAnnotation')[0]
      return event && mouseOverAnnotationElem && popupsCurrentAnnotationElem && mouseOverAnnotationElem.isEqualNode(popupsCurrentAnnotationElem)
    }

    function addAnnotationPopupIsVisible() {
      return $('.add-annotation-popup').is(':visible')
    }

    function clearAllRemovePopups() {
      $('.remove-annotation-popup').remove()
    }

    function renderRemovePopup(event) {
      var $annotation = $(event.currentTarget)
      var $popup = popupWithMessage($annotation, $annotation.attr('data-message'))
      $annotation.append($popup)
      var left = mouseOffsetX(event) - $popup.outerWidth() / 2
      $popup.css({left: left})
      $popup.fadeIn()
    }

    function removeRemovePopup(event) {
      var $annotation = $(event.target).closest('.answerAnnotation')
      var popup = $annotation.find('.remove-annotation-popup')
      popup.fadeOut(100, function () {
        popup.remove()
      })
    }

    function popupWithMessage($annotation, message) {
      var $messageContainer = $('<span class="remove-annotation-popup"><span class="annotation-message"></span></span>')
      $messageContainer.find('.annotation-message').text(message || '-')
      if (isAllowedToRemoveAnnotation($annotation)) {
        $messageContainer.append('<i class="fa fa-times-circle remove-annotation-area"></i>')
      }
      return $messageContainer
    }

    function isAllowedToRemoveAnnotation($annotation) {
      return isPregradingAndScoringEnabled() || isCensorAndOwnAnnotation()

      function isPregradingAndScoringEnabled() {
        var $body = $('body')
        return $body.hasClass('is_pregrading') && !$body.hasClass('preview')
      }

      function isCensorAndOwnAnnotation() {
        return isCensor() && $annotation.closest('.answerText').hasClass('is_censor')
      }
    }

    function mouseOffsetX(mousemove) {
      var annotation = mousemove.target
      var annotationLeftOffsetFromPageEdge = $(annotation).offsetParent().offset().left + annotation.offsetLeft
      return mousemove.pageX - annotationLeftOffsetFromPageEdge
    }
  }

  function isCensor() {
    return $('body').hasClass('is_censor')
  }

  function getAnswerId($answerText) {
    return $answerText.closest('.answer').attr('data-answer-id')
  }

  function getBrowserTextSelection() {
    if (typeof window.getSelection !== "undefined") {
      return window.getSelection()
    } else if (typeof document.selection !== "undefined" && document.selection.type === "Text") {
      return document.selection
    } else {
      return undefined
    }
  }

  function hasTextSelectedInAnswerText() {
    var selection = getBrowserTextSelection()
    return selection && selectionInAnswerText(selection) && (isRangeSelection(selection) || textSelectedInRange(selection))

    function selectionInAnswerText(sel) {
      if (sel.type === 'None') return false
      var $startContainer = $(sel.getRangeAt(0).startContainer)
      return sel.rangeCount && $startContainer.closest('.answerText').length === 1 && $startContainer.closest('.remove-annotation-popup').length === 0
    }

    function isRangeSelection(sel) {
      return _.get(sel, 'type', '') === 'Range'
    }

    function textSelectedInRange(sel) {
      return _.get(sel, 'rangeCount', 0) > 0 && sel.getRangeAt(0).toString().length > 0
    }
  }
}));
