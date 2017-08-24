(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'lodash'], factory)
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'), require('lodash'))
  } else {
    root.annotationsRendering = factory(root.jQuery, root._)
  }
}(this, function ($, _) {
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
    createRangeFromMetadata: createRangeFromMetadata
  }

  function toNodeLength(node) {
    return node.nodeType === Node.TEXT_NODE ? node.textContent.length : node.nodeName === 'IMG' ? 1 : 0
  }

  function allNodesUnder(el, documentObject) {
    documentObject = documentObject || document
    var n = void 0
    var a = []
    var walk = documentObject.createTreeWalker(el, NodeFilter.SHOW_ALL, null, false)
    while (n = walk.nextNode()) {
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

    annotations.forEach(function (annotation) {

      var annotationRange = createRangeFromMetadata($answerText, annotation)

      var $annotationElement = surroundWithAnnotationSpan(annotationRange, 'answerAnnotation')
      $annotationElement.attr('data-message', annotation.message)

      if (annotation.message && annotation.message.length > 0) {
        appendAnnotationIndexSpan($annotationElement)
        appendAnnotationMessage($annotationList, annotation.message)
      }
      appendSidebarCommentIcon($annotationElement)
    })
  }

  function createRangeFromMetadata($answerText, annotation, documentObject) {
    documentObject = documentObject || document
    var nodes = allNodesUnder($answerText.get(0), documentObject)
    var topLevelNodes = $answerText.contents().toArray()
    var nodeTextLengths = _.map(nodes, toNodeLength)
    var accumLengths = _.reduce(nodeTextLengths, function (acc, n) {
      acc.push((acc.length > 0 ? acc[acc.length - 1] : 0) + n)
      return acc
    }, [])

    var accumulators = _.zipWith(nodes, accumLengths, function (node, length) {
      return {node: node, length: length}
    })

    var offset = annotation.startIndex
    var startObject = findStartNodeObject(accumulators, offset)
    var container = $answerText.get(0)
    var startOffset = isContentTag(startObject) ? getTopLevelIndex(startObject.node): nodeContentLength(startObject) - (startObject.length - offset)
    var endObject = findEndNodeObject(accumulators, offset + annotation.length)
    var endOffset = isContentTag(endObject) ? getTopLevelIndex(endObject.node) + 1: nodeContentLength(endObject) - (endObject.length - (annotation.length + offset))
    var range = documentObject.createRange()
    range.setStart(getNodeOrContainer(startObject), startOffset)
    range.setEnd(getNodeOrContainer(endObject), endOffset)

    return range

    function getTopLevelIndex(node) {
      return _.findIndex(topLevelNodes, function (el) {
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
    return _.find(nodes, function (a) {
      return a.length > length
    })
  }

  function findEndNodeObject(nodes, length) {
    return _.find(nodes, function (a) {
      return a.length >= length
    })
  }

  function findAnnotationListElem($answerText) {
    return $answerText.closest('.answer').find('.answer-annotations').find($answerText.hasClass('is_censor') ? '.is_censor' : '.is_pregrading').find('.annotation-messages')
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
    if (!$(range.startContainer).parent().is('div')) {
      range.setStartBefore($(range.startContainer).parent()[0])
    }
    if (!$(range.endContainer).parent().is('div')) {
      range.setEndAfter($(range.endContainer).parent()[0])
    }
    var annotationElement = document.createElement("span")
    range.surroundContents(annotationElement)
    $(annotationElement).addClass(spanClass)
    return $(annotationElement)
  }

  function appendAnnotationIndexSpan($annotationElement) {
    var annotationIndexElement = document.createElement("sup")
    $(annotationIndexElement).addClass('annotationMessageIndex unselectable')
    $annotationElement.append(annotationIndexElement)
  }

  function appendAnnotationMessage($annotationList, message) {
    var msg = message || '-'
    var $msg = $('<tr>').append($('<td>').addClass('index')).append($('<td>').text(msg))
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
    var parted = getOverlappingAnnotations(currentAnnotations, {startIndex: start, length: length})
    return _.compact(parted.overlapping.map(function (anno) {
      return anno.message
    }))
  }

  function mergeAnnotation(annotations, newAnnotation) {
    var parted = getOverlappingAnnotations(annotations, newAnnotation)

    if (parted.overlapping.length > 0) {
      parted.overlapping.push(newAnnotation)
      var mergedStart = _.min(parted.overlapping, function (range) {
        return range.startIndex
      })
      var mergedEnd = _.max(parted.overlapping, function (range) {
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
    return _.sortBy(parted.nonOverlapping, function (a) {
      return a.startIndex
    })
  }

  function getOverlappingAnnotations(annotations, newAnnotation) {
    var partitioned = _.partition(annotations, function (other) {
      var newEnd = newAnnotation.startIndex + newAnnotation.length
      var otherEnd = other.startIndex + other.length
      return newAnnotation.startIndex >= other.startIndex && newAnnotation.startIndex <= otherEnd || newEnd >= other.startIndex && newEnd <= otherEnd || newAnnotation.startIndex <= other.startIndex && newEnd >= otherEnd
    })
    return {overlapping: partitioned[0], nonOverlapping: partitioned[1]}
  }

  function renderAbittiAnnotations(answers, getAbittiAnnotations, readOnly) {
    if (readOnly === true) {
      $('body').addClass('preview')
    }
    _.forEach($(answers), function (elem) {
      var $elem = $(elem)
      var annotations = getAbittiAnnotations($elem)
      $elem.data('annotations', annotations)
      renderAnnotationsForElement($elem)
    })
  }
}))
