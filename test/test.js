require([
  "mocha",
  "chai",
  "./dist/annotations-rendering",
  "./dist/annotations-editing",
  "jquery",
  "lodash",
], (mocha, chai, annotationRendering, annotationEditing, $, _) => {

  chai.config.truncateThreshold = 0
  mocha.setup("bdd")
  const expect = chai.expect
  const assert = chai.assert
  const $answerContainer = $('.testAnswerContainer')
  const richTextTemplate = (classes, content) => `<div class="${classes}">${content}</div>`

  function setAnswer(content, cssClasses) {
    const answerHtml = richTextTemplate(cssClasses, content)
    $answerContainer.html(answerHtml)
  }

  function getAnnotationContent($answer) {
    return $answer.find('.answerAnnotation')
                    .toArray().map(e => e.textContent)
  }

  describe("When selecting richText", () => {
    const annotations = [
      {
        message: 'great1',
        startIndex: 0,
        length: 5
      },
      {
        message: 'great2',
        startIndex: 7,
        length: 1
      }
    ]
    const answerContent = `answer rich <img alt="alt_image_text"> Text<br>Lorem ipsum<br><br><br>Vivamus venenatis<br><br><br>Phasellus tempus<br><br>Morbi<br><img alt="x">+<img alt="y"> = y + x`

    beforeEach(() => setAnswer(answerContent, 'textAnswer richTextAnswer is_pregrading'))

    it('Surrounding range from first three rows contains correct text', () => {
      const answer = $answerContainer.find('.textAnswer').get(0)
      const range = document.createRange()
      range.setStart(answer, 0)
      range.setEnd(answer, 3)

      const $annotatedElement = annotationRendering.surroundWithAnnotationSpan(range, 'answerAnnotation')
      assert.equal($annotatedElement.contents().length, 3)
      assert.equal($annotatedElement.text(), 'answer rich  Text')
    })

    it('All answer nodes can be extracted', () => {
      const answer = $answerContainer.find('.textAnswer').get(0)
      annotationRendering.renderGivenAnnotations($answerContainer.find('.textAnswer'), annotations)
      const foundNodes = annotationRendering.allNodesUnder(answer)
      const extraElementCount = annotations.length * 2 // span includes text & superscript

      assert.equal(foundNodes.length, answer.childNodes.length + extraElementCount)
    })

    it('First annotation should contain correct text', () => {
        annotationRendering.renderGivenAnnotations($answerContainer.find('.textAnswer'), [annotations[0]])
        expect(getAnnotationContent($answerContainer)).to.include.members(['answe'])
    })

    it('Multiple annotations should be in correct place', () => {
      const imageAnnotations = [
        {message: 'great1', startIndex: 11, length: 7},
        {message: 'great2', startIndex: 19, length: 10},
        {message: 'great3', startIndex: 68, length: 1}
      ]
      annotationRendering.renderGivenAnnotations($answerContainer.find('.textAnswer'), imageAnnotations)
      expect(getAnnotationContent($answerContainer)).to.include.members(['  Text', 'orem ipsum', '+'])
    })

    it(`Selecting single image shouldn't throw an error`, () => {
      const imageAnnotation = [
        {message: 'great1', startIndex: 67, length: 1}
      ]
      const annFn = () => annotationRendering.renderGivenAnnotations($answerContainer.find('.textAnswer'), imageAnnotation)
      expect(annFn).to.not.throw()
    })

    it(`Selecting image after another image shouldn't throw errors`, () => {
      const imageAnnotations = [
        {message: 'great1', startIndex: 11, length: 7},
        {message: 'great1', startIndex: 67, length: 1}
      ]
      const annFn = () => annotationRendering.renderGivenAnnotations($answerContainer.find('.textAnswer'), imageAnnotations)
      expect(annFn).to.not.throw()
    })

    it('New annotation overlapping other annotations should be merged', () => {
      const newAnn = {message: 'great3', startIndex: 4, length: 10}
      const mergedAnnotation = annotationRendering.mergeAnnotation(annotations, newAnn)
      expect(mergedAnnotation).to.deep.include({startIndex: 0, length: 14, message: newAnn.message})
    })

  })

  mocha.run()

})
