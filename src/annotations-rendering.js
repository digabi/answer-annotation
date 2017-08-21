(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['jquery', 'lodash'], factory)
  } else if (typeof exports === 'object') {
    module.exports = factory(require('jquery'), require('lodash'))
  } else {
    root.annotationsRendering = factory(root.jQuery, root._)
  }
} (this, function($, _) {
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
    return node.nodeType === Node.TEXT_NODE ? node.textContent.length : (node.nodeName === 'IMG' ? 1 : 0)
  }

  function allNodesUnder(el) {
    let n
    const a = []
    const walk = document.createTreeWalker(el, NodeFilter.SHOW_ALL, null, false)
    while ((n = walk.nextNode())) a.push(n)
    return a
  }

  function renderAnnotationsForElement($answerText) {
    renderGivenAnnotations($answerText, getAnnotations($answerText))
  }

  function renderGivenAnnotations($answerText, annotations) {
    const $annotationList = findAnnotationListElem($answerText)
    removeAllAnnotationPopups()
    clearExistingAnnotations($answerText, $annotationList)

    annotations.forEach(annotation => {

      const annotationRange = createRangeFromMetadata($answerText, annotation)

      const $annotationElement = surroundWithAnnotationSpan(annotationRange, 'answerAnnotation')
      $annotationElement.attr('data-message', annotation.message)

      if (annotation.message && annotation.message.length > 0) {
        appendAnnotationIndexSpan($annotationElement)
        appendAnnotationMessage($annotationList, annotation.message)
      }
      appendSidebarCommentIcon($annotationElement)
    })
  }

  function createRangeFromMetadata($answerText, annotation) {
    const nodes = allNodesUnder($answerText.get(0))
    const nodeTextLengths = _.map(nodes, toNodeLength)
    const accumLengths = _.reduce(nodeTextLengths, (acc, n) => {
      acc.push((acc.length > 0 ? acc[acc.length - 1] : 0) + n)
      return acc
    }, [])

    const accumulators = _.zipWith(nodes, accumLengths, (node, length) => ({node, length})).map((node, index) => ({
      node: node.node,
      length: node.length,
      index: index + 1
    }))

    const offset = annotation.startIndex
    const startObject = findNodeObject(accumulators, offset)
    const container = $answerText.get(0)
    const startOffset = isImg(startObject) ? startObject.index : nodeContentLength(startObject) - (startObject.length - offset)

    const endObject = findNodeObject(accumulators, offset + annotation.length)
    const endOffset = isImg(endObject) ? endObject.index : nodeContentLength(endObject) - (endObject.length - (annotation.length + offset))
    const range = document.createRange()
    range.setStart(getNode(startObject), startOffset)
    range.setEnd(getNode(endObject), endOffset)

    return range

    function getNode(nodeObject) {
      return isImg(nodeObject) ? container : nodeObject.node
    }
  }

  function isImg({node}) {
    return node.nodeName === 'IMG' || node.nodeName === 'BR'
  }

  function nodeContentLength(nodeObj) {
    return nodeObj.node.textContent.length
  }

  function findNodeObject(nodes, length) {
    return _.find(nodes, a => isImg(a) ? a.length > length : a.length >= length)
  }

  function findAnnotationListElem($answerText) {
    return $answerText.closest('.answer')
      .find('.answer-annotations')
      .find($answerText.hasClass('is_censor') ? '.is_censor' : '.is_pregrading')
      .find('.annotation-messages')
  }

  function removeAllAnnotationPopups() {
    $('.remove-annotation-popup').remove()
    $('.add-annotation-popup').remove()
  }

  function clearExistingAnnotations($answerText, $annotationList) {
    const $originalAnswerText = $answerText.closest('.answer-text-container').find('.originalAnswer')
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
    const annotationElement = document.createElement("span")
    range.surroundContents(annotationElement)
    $(annotationElement).addClass(spanClass)
    return $(annotationElement)
  }

  function appendAnnotationIndexSpan($annotationElement) {
    const annotationIndexElement = document.createElement("sup")
    $(annotationIndexElement).addClass('annotationMessageIndex unselectable')
    $annotationElement.append(annotationIndexElement)
  }

  function appendAnnotationMessage($annotationList, message) {
    const msg = message || '-'
    const $msg = $('<tr>').append($('<td>').addClass('index')).append($('<td>').text(msg))
    $annotationList.append($msg)
  }

  function appendSidebarCommentIcon($annotation) {
    const sideBarCommentIcon = $('<i>').addClass('fa fa-comment')
    $annotation.after(sideBarCommentIcon)
  }

  function getAnnotations($answerText) {
    return $answerText.data('annotations') || []
  }

  function getOverlappingMessages($answerText, start, length) {
    const currentAnnotations = getAnnotations($answerText)
    const parted = getOverlappingAnnotations(currentAnnotations, {startIndex: start, length: length})
    return _.compact(parted.overlapping.map(anno => anno.message))
  }

  function mergeAnnotation(annotations, newAnnotation) {
    const parted = getOverlappingAnnotations(annotations, newAnnotation)

    if (parted.overlapping.length > 0) {
      parted.overlapping.push(newAnnotation)
      const mergedStart = _.min(parted.overlapping, range => range.startIndex)
      const mergedEnd = _.max(parted.overlapping, range => range.startIndex + range.length)
      const mergedRange = {
        startIndex: mergedStart.startIndex,
        length: mergedEnd.startIndex + mergedEnd.length - mergedStart.startIndex,
        message: newAnnotation.message
      }
      parted.nonOverlapping.push(mergedRange)
    } else {
      parted.nonOverlapping.push(newAnnotation)
    }
    return _.sortBy(parted.nonOverlapping, a => a.startIndex)
  }

  function getOverlappingAnnotations(annotations, newAnnotation) {
    const partitioned = _.partition(annotations, other => {
      const newEnd = newAnnotation.startIndex + newAnnotation.length
      const otherEnd = other.startIndex + other.length
      return (newAnnotation.startIndex >= other.startIndex && newAnnotation.startIndex <= otherEnd) ||
        (newEnd >= other.startIndex && newEnd <= otherEnd) ||
        (newAnnotation.startIndex <= other.startIndex && newEnd >= otherEnd)
    })
    return { overlapping: partitioned[0], nonOverlapping: partitioned[1] }
  }

  function renderAbittiAnnotations(answers, getAbittiAnnotations, readOnly) {
    if (readOnly === true) {
      $('body').addClass('preview')
    }
    _.forEach($(answers), elem => {
      const $elem = $(elem)
      const annotations = getAbittiAnnotations($elem)
      $elem.data('annotations', annotations)
      renderAnnotationsForElement($elem)
    })
  }
}))
