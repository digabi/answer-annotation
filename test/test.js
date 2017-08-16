require([
  "mocha",
  "chai",
  "./lib/annotations-rendering",
  "./lib/annotations-editing",
  "jquery",
  "lodash",
], (mocha, chai, annotationRendering, annotationEditing, $, _) => {

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
        startIndex: 1,
        length: 5
      }
    ]
    const answerContent = `answer rich <img alt="alt_image_text"> Text<br>Lorem ipsum<br><br><br>Vivamus venenatis<br><br><br>Phasellus tempus<br><br>Morbi<br><img alt="x">+<img alt="y"> = y + x`

    before(() => setAnswer(answerContent, 'textAnswer richTextAnswer is_pregrading'))

    it('first annotation should contain correct text', () => {
        const firstAnnotation = annotations[0]
        annotationRendering.renderGivenAnnotations($answerContainer.find('.textAnswer'), [firstAnnotation])
        expect(getAnnotationContent($answerContainer)).to.include.members(['answe'])
    })
  })

  mocha.run()

})
