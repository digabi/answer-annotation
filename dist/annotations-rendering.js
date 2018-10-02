/* eslint-disable es5/no-es6-methods */
// eslint-disable-next-line no-extra-semi
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'lodash'], factory)
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'), require('lodash'))
  } else {
    root.annotationsRendering = factory(root.jQuery, root._)
  }
})(this, function($, _) {
  'use strict'

  return {
    renderAnnotationsForElement: renderAnnotationsForElement,
    renderGivenAnnotations: renderGivenAnnotations,
    surroundWithAnnotationSpan: surroundWithAnnotationSpan,
    get: getAnnotations,
    getOverlappingMessages: getOverlappingMessages,
    mergeAnnotation: mergeAnnotation,
    allNodesUnder: allNodesUnder,
    toNodeLength: toNodeLength,
    renderAbittiAnnotations: renderAbittiAnnotations,
    createRangeFromMetadata: createRangeFromMetadata,
    renderShape: renderShape,
    wrapAttachment: wrapAttachment,
    calculatePosition: calculatePosition,
    getImageStartIndex: getImageStartIndex
  }

  function getImageStartIndex($image, $answerText) {
    var range = document.createRange()
    var referenceNode = $image.get(0)
    range.selectNode(referenceNode)
    return calculatePosition($answerText, range).startIndex
  }

  function calculatePosition($answerText, range) {
    var answerNodes = allNodesUnder($answerText.get(0))
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
      var nodesBeforeContainer = _.takeWhile(answerNodes, function(node) {
        return node !== container
      })
      return offsetInside + _.sum(nodesBeforeContainer.map(toNodeLength))
    }
  }

  function toNodeLength(node) {
    return node.nodeType === Node.TEXT_NODE ? node.textContent.length : node.nodeName === 'IMG' ? 1 : 0
  }

  function allNodesUnder(el, documentObject) {
    documentObject = documentObject || document
    var n = void 0
    var a = []
    var walk = documentObject.createTreeWalker(el, NodeFilter.SHOW_ALL, null, false)
    while ((n = walk.nextNode())) {
      a.push(n)
    }
    return a
  }

  function renderAnnotationsForElement($answerText) {
    renderGivenAnnotations($answerText, getAnnotations($answerText))
  }

  function renderGivenAnnotations($answerText, annotations) {
    var $annotationList = findAnnotationListElem($answerText)
    removeAllAnnotationPopups()
    clearExistingAnnotations($answerText, $annotationList)

    // Render text annotations first, since they expect to see an untouched DOM
    // without image wrapper elements.
    _.partition(annotations, function(annotation) {
      return !_.has(annotation, 'type')
    }).forEach(function(annotations) {
      annotations.forEach(function(annotation) {
        var index = _.indexOf(annotations, annotation)
        var $annotationElement = renderAnnotation(annotation, index, $answerText)
        appendSidebarCommentIcon($annotationElement)
      })
    })

    // Render annotation messages after, since they need to be in the same order
    // in the DOM as in the annotations array.
    annotations
      .filter(function(annotation) {
        return annotation.message && annotation.message.length > 0
      })
      .forEach(function(annotation) {
        appendAnnotationMessage($annotationList, annotation.message)
      })
  }

  function renderAnnotation(annotation, index, $answerText) {
    var message = annotation.message
    switch (annotation.type) {
      case 'line':
      case 'rect': {
        var $wrappedAttachment = wrapAttachment(findAttachment($answerText, annotation.attachmentIndex))
        var $shape = appendAnnotationIndex(renderShape(annotation), message)
          .attr('data-message', message)
          .attr('data-index', index)
        return $wrappedAttachment.append($shape)
      }
      default: {
        var annotationRange = createRangeFromMetadata($answerText, annotation)
        return appendAnnotationIndex(surroundWithAnnotationSpan(annotationRange, 'answerAnnotation'), message)
          .attr('data-message', message)
          .attr('data-index', index)
      }
    }
  }

  function findAttachment($answerText, attachmentIndex) {
    return $($answerText.find('img').get(attachmentIndex))
  }

  function wrapAttachment($attachment) {
    return $attachment.parent().hasClass('attachmentWrapper')
      ? $attachment.parent()
      : $attachment.wrap('<span class="attachmentWrapper"/>').parent()
  }

  function createRangeFromMetadata($answerText, annotation, documentObject) {
    documentObject = documentObject || document
    var nodes = allNodesUnder($answerText.get(0), documentObject)
    var topLevelNodes = $answerText.contents().toArray()
    var nodeTextLengths = _.map(nodes, toNodeLength)
    var accumLengths = _.reduce(
      nodeTextLengths,
      function(acc, n) {
        acc.push((acc.length > 0 ? acc[acc.length - 1] : 0) + n)
        return acc
      },
      []
    )

    var accumulators = _.zipWith(nodes, accumLengths, function(node, length) {
      return { node: node, length: length }
    })

    var offset = annotation.startIndex
    var startObject = findStartNodeObject(accumulators, offset)
    var container = $answerText.get(0)
    var startOffset = isContentTag(startObject)
      ? getTopLevelIndex(startObject.node)
      : nodeContentLength(startObject) - (startObject.length - offset)
    var endObject = findEndNodeObject(accumulators, offset + annotation.length)
    var endOffset = isContentTag(endObject)
      ? getTopLevelIndex(endObject.node) + 1
      : nodeContentLength(endObject) - (endObject.length - (annotation.length + offset))
    var range = documentObject.createRange()
    range.setStart(getNodeOrContainer(startObject), startOffset)
    range.setEnd(getNodeOrContainer(endObject), endOffset)

    return range

    function getTopLevelIndex(node) {
      return _.findIndex(topLevelNodes, function(el) {
        return el === node
      })
    }
    function getNodeOrContainer(nodeObject) {
      return isContentTag(nodeObject) ? container : nodeObject.node
    }
  }

  function isContentTag(nodeObj) {
    return nodeObj.node.nodeName === 'IMG' || nodeObj.node.nodeName === 'BR'
  }

  function nodeContentLength(nodeObj) {
    return nodeObj.node.textContent.length
  }

  function findStartNodeObject(nodes, length) {
    return _.find(nodes, function(a) {
      return a.length > length
    })
  }

  function findEndNodeObject(nodes, length) {
    return _.find(nodes, function(a) {
      return a.length >= length
    })
  }

  function findAnnotationListElem($answerText) {
    return $answerText
      .closest('.answer')
      .find('.answer-annotations')
      .find($answerText.hasClass('is_censor') ? '.is_censor' : '.is_pregrading')
      .find('.annotation-messages')
  }

  function removeAllAnnotationPopups() {
    $('.remove-annotation-popup').remove()
    $('.add-annotation-popup').remove()
  }

  function clearExistingAnnotations($answerText, $annotationList) {
    var $originalAnswerText = $answerText.closest('.answer-text-container').find('.originalAnswer')
    $answerText.html($originalAnswerText.html())
    $annotationList.empty()
  }

  function surroundWithAnnotationSpan(range, spanClass) {
    if (
      !$(range.startContainer)
        .parent()
        .is('div')
    ) {
      range.setStartBefore($(range.startContainer).parent()[0])
    }
    if (
      !$(range.endContainer)
        .parent()
        .is('div')
    ) {
      range.setEndAfter($(range.endContainer).parent()[0])
    }
    var annotationElement = document.createElement('span')
    range.surroundContents(annotationElement)
    $(annotationElement).addClass(spanClass)
    return $(annotationElement)
  }

  function renderShape(shape, $element) {
    // Note: Render as SVG if we start needing anything more complicated.
    var type = shape.type

    return ($element || $('<div class="answerAnnotation" />'))
      .css(getShapeStyles(type, shape))
      .toggleClass('line', type === 'line')
      .toggleClass('rect', type === 'rect')
  }

  function getShapeStyles(type, shape) {
    switch (type) {
      case 'rect':
        return {
          left: pct(shape.x),
          top: pct(shape.y),
          right: pct(1 - (shape.x + shape.width)),
          bottom: pct(1 - (shape.y + shape.height))
        }
      case 'line':
        return {
          left: pct(shape.x1),
          top: pct(shape.y1),
          right: pct(1 - shape.x2),
          bottom: pct(1 - shape.y2)
        }
      default:
        throw new Error('Invalid shape: ' + type)
    }
  }

  function pct(n) {
    return n * 100 + '%'
  }

  function appendAnnotationIndex($element, message) {
    if (message) {
      var $annotationIndex = $('<sup />').addClass('annotationMessageIndex')
      return $element.append($annotationIndex)
    } else {
      return $element
    }
  }

  function appendAnnotationMessage($annotationList, message) {
    var msg = message || '-'
    var $msg = $('<tr>')
      .append($('<td>').addClass('index'))
      .append($('<td>').text(msg))
    $annotationList.append($msg)
  }

  function appendSidebarCommentIcon($annotation) {
    var sideBarCommentIcon = $('<i>').addClass('fa fa-comment')
    $annotation.after(sideBarCommentIcon)
  }

  function getAnnotations($answerText) {
    return $answerText.data('annotations') || []
  }

  function getOverlappingMessages($answerText, start, length) {
    var currentAnnotations = getAnnotations($answerText)
    var parted = getOverlappingAnnotations(currentAnnotations, { startIndex: start, length: length })
    return _.compact(
      parted.overlapping.map(function(anno) {
        return anno.message
      })
    )
  }

  function mergeAnnotation($answerText, newAnnotation) {
    var annotations = getAnnotations($answerText)
    var parted = getOverlappingAnnotations(annotations, newAnnotation)

    if (parted.overlapping.length > 0) {
      parted.overlapping.push(newAnnotation)
      var mergedStart = _.minBy(parted.overlapping, function(range) {
        return range.startIndex
      })
      var mergedEnd = _.maxBy(parted.overlapping, function(range) {
        return range.startIndex + range.length
      })
      var mergedRange = {
        startIndex: mergedStart.startIndex,
        length: mergedEnd.startIndex + mergedEnd.length - mergedStart.startIndex,
        message: newAnnotation.message
      }
      parted.nonOverlapping.push(mergedRange)
    } else {
      parted.nonOverlapping.push(newAnnotation)
    }
    return _.sortBy(
      parted.nonOverlapping,
      function(a) {
        return isNaN(a.startIndex)
          ? getImageStartIndex(findAttachment($answerText, a.attachmentIndex), $answerText)
          : a.startIndex
      },
      function(a) {
        return a.y || a.y1
      },
      function(a) {
        return a.x || a.x1
      }
    )
  }

  function getOverlappingAnnotations(annotations, newAnnotation) {
    var partitioned = _.partition(annotations, function(other) {
      var newEnd = newAnnotation.startIndex + newAnnotation.length
      var otherEnd = other.startIndex + other.length
      return (
        (newAnnotation.startIndex >= other.startIndex && newAnnotation.startIndex <= otherEnd) ||
        (newEnd >= other.startIndex && newEnd <= otherEnd) ||
        (newAnnotation.startIndex <= other.startIndex && newEnd >= otherEnd)
      )
    })
    return { overlapping: partitioned[0], nonOverlapping: partitioned[1] }
  }

  function renderAbittiAnnotations(answers, getAbittiAnnotations, readOnly) {
    if (readOnly === true) {
      $('body').addClass('preview')
    }
    _.forEach($(answers), function(elem) {
      var $elem = $(elem)
      var annotations = getAbittiAnnotations($elem)
      $elem.data('annotations', annotations)
      renderAnnotationsForElement($elem)
    })
  }
})
