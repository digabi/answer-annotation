import $ from 'jquery'
import _ from 'lodash'

export function getImageStartIndex($image, $answerText) {
  const range = document.createRange()
  const referenceNode = $image.get(0)
  range.selectNode(referenceNode)
  return calculatePosition($answerText, range).startIndex
}

export function calculatePosition($answerText, range) {
  const answerNodes = allNodesUnder($answerText.get(0))
  const charactersBefore = charactersBeforeContainer(range.startContainer, range.startOffset)
  const charactersUntilEnd = charactersBeforeContainer(range.endContainer, range.endOffset)
  return {
    startIndex: charactersBefore,
    length: charactersUntilEnd - charactersBefore
  }

  function charactersBeforeContainer(rangeContainer, offset) {
    const containerIsTag = rangeContainer === $answerText.get(0)
    const container = containerIsTag ? rangeContainer.childNodes[offset] : rangeContainer
    const offsetInside = containerIsTag ? 0 : offset
    const nodesBeforeContainer = _.takeWhile(answerNodes, node => node !== container)
    return offsetInside + _.sum(nodesBeforeContainer.map(toNodeLength))
  }
}

export function toNodeLength(node) {
  return node.nodeType === Node.TEXT_NODE ? node.textContent.length : node.nodeName === 'IMG' ? 1 : 0
}

export function allNodesUnder(el, documentObject) {
  documentObject = documentObject || document
  let n = void 0
  const a = []
  const walk = documentObject.createTreeWalker(el, NodeFilter.SHOW_ALL, null, false)
  while ((n = walk.nextNode())) {
    a.push(n)
  }
  return a
}

export function renderAnnotationsForElement($answerText, annotations) {
  if (annotations) {
    $answerText.data('annotations', annotations)
    renderGivenAnnotations($answerText, annotations)
  } else {
    renderGivenAnnotations($answerText, $answerText.data('annotations') || [])
  }
}

export function renderGivenAnnotations($answerText, annotations) {
  const $annotationList = findAnnotationListElem($answerText)
  removeAllAnnotationPopups()
  clearExistingAnnotations($answerText, $annotationList)

  // Render text annotations first, since they expect to see an untouched DOM
  // without image wrapper elements.
  const [textAnnotations, imageAnnotations] = _.partition(annotations, annotation => !_.has(annotation, 'type'))
  const addAnnotations = annotationsForType => {
    annotationsForType.forEach(annotation => {
      const index = _.indexOf(annotations, annotation)
      const $annotationElement = renderAnnotation(annotation, index, $answerText)
      appendSidebarCommentIcon($annotationElement)
    })
  }
  addAnnotations(textAnnotations)
  $answerText.find('img').each((index, img) => {
    $(img).wrap('<span class="attachmentWrapper"/>')
  })
  addAnnotations(imageAnnotations)
  // Render annotation messages after, since they need to be in the same order
  // in the DOM as in the annotations array.
  annotations
    .filter(annotation => annotation.message && annotation.message.length > 0)
    .forEach(annotation => {
      appendAnnotationMessage($annotationList, annotation.message)
    })
}

function renderAnnotation(annotation, index, $answerText) {
  const message = annotation.message
  switch (annotation.type) {
    case 'line':
    case 'rect': {
      const $wrappedAttachment = findAttachment($answerText, annotation.attachmentIndex).parent()
      const $shape = renderShape(annotation)
      appendAnnotationIndex($shape, message, index)
      return $wrappedAttachment.append($shape)
    }
    default: {
      const annotationRange = createRangeFromMetadata($answerText, annotation)
      const $annotationSpan = surroundWithAnnotationSpan(annotationRange, 'answerAnnotation')
      appendAnnotationIndex($annotationSpan, message, index)
      return $annotationSpan
    }
  }
}

function findAttachment($answerText, attachmentIndex) {
  return $($answerText.find('img').get(attachmentIndex))
}

export function createRangeFromMetadata($answerText, annotation, documentObject) {
  documentObject = documentObject || document
  const nodes = allNodesUnder($answerText.get(0), documentObject)
  const topLevelNodes = $answerText.contents().toArray()
  const nodeTextLengths = _.map(nodes, toNodeLength)
  const accumLengths = _.reduce(
    nodeTextLengths,
    (acc, n) => {
      acc.push((acc.length > 0 ? acc[acc.length - 1] : 0) + n)
      return acc
    },
    []
  )

  const accumulators = _.zipWith(nodes, accumLengths, (node, length) => ({ node, length }))

  const offset = annotation.startIndex
  const startObject = findStartNodeObject(accumulators, offset)
  const container = $answerText.get(0)
  const startOffset = isContentTag(startObject)
    ? getTopLevelIndex(startObject.node)
    : nodeContentLength(startObject) - (startObject.length - offset)
  const endObject = findEndNodeObject(accumulators, offset + annotation.length)
  const endOffset = isContentTag(endObject)
    ? getTopLevelIndex(endObject.node) + 1
    : nodeContentLength(endObject) - (endObject.length - (annotation.length + offset))
  const range = documentObject.createRange()
  range.setStart(getNodeOrContainer(startObject), startOffset)
  range.setEnd(getNodeOrContainer(endObject), endOffset)

  return range

  function getTopLevelIndex(node) {
    return _.findIndex(topLevelNodes, el => el === node)
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
  return _.find(nodes, a => a.length > length)
}

function findEndNodeObject(nodes, length) {
  return _.find(nodes, a => a.length >= length)
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
  const $originalAnswerText = $answerText.prevAll('.originalAnswer')
  $answerText.html($originalAnswerText.html())
  $annotationList.empty()
}

export function surroundWithAnnotationSpan(range, spanClass) {
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
  const annotationElement = document.createElement('span')
  range.surroundContents(annotationElement)
  $(annotationElement).addClass(spanClass)
  return $(annotationElement)
}

export function renderShape(shape, $element) {
  // Note: Render as SVG if we start needing anything more complicated.
  const type = shape.type

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

function appendAnnotationIndex($element, message, index) {
  $element.attr('data-message', message).attr('data-index', index)
  if (message) {
    $element.append(
      $('<sup />')
        .addClass('annotationMessageIndex')
        .attr('data-message', message)
    )
  }
}

function appendAnnotationMessage($annotationList, message) {
  const msg = message || '-'
  const $msg = $('<tr>')
    .append($('<td>').addClass('index'))
    .append($('<td>').text(msg))
  $annotationList.append($msg)
}

function appendSidebarCommentIcon($annotation) {
  const sideBarCommentIcon = $('<i>').addClass('fa fa-comment')
  $annotation.after(sideBarCommentIcon)
}

function getAnnotations($answerText) {
  return $answerText.data('annotations') || []
}
export { getAnnotations as get }

export function getOverlappingMessages($answerText, start, length) {
  const currentAnnotations = getAnnotations($answerText)
  const parted = getOverlappingAnnotations(currentAnnotations, { startIndex: start, length })
  return _.compact(parted.overlapping.map(anno => anno.message))
}

export function mergeAnnotation($answerText, newAnnotation) {
  const annotations = getAnnotations($answerText)
  const parted = getOverlappingAnnotations(annotations, newAnnotation)

  if (parted.overlapping.length > 0) {
    parted.overlapping.push(newAnnotation)
    const mergedStart = _.minBy(parted.overlapping, range => range.startIndex)
    const mergedEnd = _.maxBy(parted.overlapping, range => range.startIndex + range.length)
    const mergedRange = {
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
    a =>
      isNaN(a.startIndex)
        ? getImageStartIndex(findAttachment($answerText, a.attachmentIndex), $answerText)
        : a.startIndex,
    a => a.y || a.y1,
    a => a.x || a.x1
  )
}

function getOverlappingAnnotations(annotations, newAnnotation) {
  const partitioned = _.partition(annotations, other => {
    const newEnd = newAnnotation.startIndex + newAnnotation.length
    const otherEnd = other.startIndex + other.length
    return (
      (newAnnotation.startIndex >= other.startIndex && newAnnotation.startIndex <= otherEnd) ||
      (newEnd >= other.startIndex && newEnd <= otherEnd) ||
      (newAnnotation.startIndex <= other.startIndex && newEnd >= otherEnd)
    )
  })
  return { overlapping: partitioned[0], nonOverlapping: partitioned[1] }
}

export function renderInitialAnnotationsForElement($answerText, pregradingAnnotations, censoringAnnotations) {
  const $pregrading = $answerText.clone().addClass('is_pregrading')
  $answerText.after('\n', $pregrading)
  renderAnnotationsForElement($pregrading, pregradingAnnotations)
  if (censoringAnnotations) {
    const $censoring = $answerText
      .clone()
      .addClass('is_censor')
      .addClass('no-mouse')
    $pregrading.after('\n', $censoring)
    renderAnnotationsForElement($censoring, censoringAnnotations)
  }
  $answerText.addClass('originalAnswer')
  $answerText.removeClass('answerText').removeClass('answerRichText')
}
