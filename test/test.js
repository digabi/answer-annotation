require([
  "mocha",
  "chai",
  "./lib/annotations-rendering",
  "./lib/annotations-editing",
  "jquery",
  "lodash"
], (mocha, chai, annotationRendering, annotationEditing, $, _) => {
  mocha.setup("bdd")
  const expect = chai.expect

  describe("Test selecting text", () => {
          const annotation = {
              message: 'great',
              startIndex: 0,
              length: 2
          }
          const annotations = [
            annotation
          ]
          annotationRendering.renderGivenAnnotations($('.test'), annotations)

      it('should render annotation', () => {
          expect($('.test').html()).to.equal('Tes')
      })
  })

  mocha.run()

  function addRangeAndTriggerPopup(answerTextSelector, start, end) {
    const $answerText = $(answerTextSelector)
    const nodes = $answerText.contents()
    const selection = window.getSelection()

    //TODO Once modularized use same logic as in production code by including also wrapped images
    const nodeTextLengths = _.map(nodes, n => n.textContent.length)
    const accumLengths = _.reduce(
      nodeTextLengths,
      (acc, n) => {
        acc.push((acc.length > 0 ? acc[acc.length - 1] : 0) + n)
        return acc
      },
      []
    )
    const accumulators = _.zipWith(nodes, accumLengths, (a, b) => ({
      node: a,
      length: b
    }))

    const offset = start
    const startObject = findNodeObject(accumulators, offset)
    const startNode = startObject.node
    const startOffset =
      startNode.textContent.length - (startObject.length - offset)

    // TODO: node should never be an img node but the container
    const endObject = findNodeObject(accumulators, offset + end)
    const endNode = endObject.node
    const endOffset =
      endNode.textContent.length - (endObject.length - (end + offset))

    const range = window.document.createRange()
    range.setStart(startNode, startOffset)
    range.setEnd(endNode, endOffset)
    selection.removeAllRanges()
    selection.addRange(range)
    $answerText.mouseup()
  }

  function findNodeObject(nodes, length) {
    return _.find(nodes, a => a.length >= length)
  }
})
