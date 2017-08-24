require([
  "mocha",
  "chai",
  "./dist/annotations-rendering",
  "./dist/annotations-editing",
  "jquery"
], (mocha, chai, annotationRendering, annotationEditing, $) => {

  chai.config.truncateThreshold = 0
  mocha.setup("bdd")
  const expect = chai.expect
  const assert = chai.assert
  const $answerContainer = $('.testAnswerContainer')
  annotationEditing.setupAnnotationDisplaying($answerContainer)

  let currentTestIndex = 0

  function setAnswer(content, title) {
    const foo = `<div class="answer-text-container">
    <div class="originalAnswer" style="display: none">${content}</div>
    <div class="answerText answerRichText is_pregrading">${content}</div>
    </div>`
    currentTestIndex++
    const $newContainer = $('<div>').attr('id','answer-'+currentTestIndex).addClass('answer-wrapper').html(foo)
    $newContainer.prepend(`<h2>${title}</h2>`)
    $answerContainer.append($newContainer)
    annotationEditing.setupAnnotationEditing($newContainer.find('.answerText'), '', () => {}, $obj => $obj)
  }

  function getAnnotationContent($answer) {
    return $answer.find('#answer-' + currentTestIndex + ' .answerAnnotation')
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
    const createAndgetContainer = function(ctx, answerContent) {
      setAnswer(answerContent, ctx && ctx.test.title)
      return $answerContainer.find('#answer-' + currentTestIndex + ' .answerRichText')
    }

    it('Surrounding range from first three rows contains correct text', function() {
      const answer = createAndgetContainer(this, `answer rich <img alt="math1" src="/test/math.svg"> Text<br>Lorem ipsum<br><br><br>`).get(0)
      const range = document.createRange()
      range.setStart(answer, 0)
      range.setEnd(answer, 3)

      const $annotatedElement = annotationRendering.surroundWithAnnotationSpan(range, 'answerAnnotation')
      assert.equal($annotatedElement.contents().length, 3)
      assert.equal($annotatedElement.text(), 'answer rich  Text')
    })

    it('First annotation should contain correct text', function() {
        annotationRendering.renderGivenAnnotations(createAndgetContainer(this, `answer rich <img alt="math1" src="/test/math.svg"> Text<br>Lorem ipsum<br><br><br>`), [annotations[0]])
        expect(getAnnotationContent($answerContainer)).to.include.members(['answe'])
    })

    it('Multiple annotations should be in correct place', function() {
      const imageAnnotations = [
        {message: 'great1', startIndex: 11, length: 7},
        {message: 'great2', startIndex: 19, length: 10},
        {message: 'great3', startIndex: 30, length: 1}
      ]
      annotationRendering.renderGivenAnnotations(createAndgetContainer(this, `answer rich <img alt="math1" src="/test/math.svg"> Text<br>Lorem ipsum<br><img alt="math2" src="/test/math.svg">+<img alt="math3" src="/test/math.svg">`), imageAnnotations)
      expect(getAnnotationContent($answerContainer)).to.include.members(['  Text', 'orem ipsum', '+'])
    })

    it('Selecting text after image should work', function() {
      const imageAnnotations = [
        {message: 'great1', startIndex: 11, length: 7},
        {message: 'great2', startIndex: 20, length: 9}
      ]
      annotationRendering.renderGivenAnnotations(createAndgetContainer(this, `answer rich <img alt="math1" src="/test/math.svg"> Text<br>Lorem ipsum<br>`), imageAnnotations)
      expect(getAnnotationContent($answerContainer)).to.include.members(['  Text', 'rem ipsum'])
    })

    it(`Selecting single image shouldn't throw an error`, function() {
      const imageAnnotation = [
        {message: 'great1', startIndex: 2, length: 1}
      ]
      const annFn = () => annotationRendering.renderGivenAnnotations(createAndgetContainer(this, `bi<br><img alt="math2" src="/test/math.svg">+<img alt="math3" src="/test/math.svg">`), imageAnnotation)
      expect(annFn).to.not.throw()
    })

    it(`Selecting image after another image shouldn't throw errors`, function() {
      const imageAnnotations = [
        {message: 'great1', startIndex: 11, length: 7},
        {message: 'great1', startIndex: 23, length: 1}
      ]
      const annFn = () => annotationRendering.renderGivenAnnotations(createAndgetContainer(this, `answer rich <img alt="math1" src="/test/math.svg"> Text<br>Morbi<br><img alt="math2" src="/test/math.svg">+<img alt="math3" src="/test/math.svg">`), imageAnnotations)
      expect(annFn).to.not.throw()
    })

    it('New annotation overlapping other annotations should be merged', function() {
      const newAnn = {message: 'great3', startIndex: 4, length: 10}
      const mergedAnnotation = annotationRendering.mergeAnnotation(annotations, newAnn)
      expect(mergedAnnotation).to.deep.include({startIndex: 0, length: 14, message: newAnn.message})
    })

    it(`Selecting correct image`, function() {
      const $container = createAndgetContainer(this, `X<img alt="math5" src="/test/math.svg"><br><img alt="math6" src="/test/math.svg"><br><img alt="math7" src="/test/math.svg"><br>`)
      const container = $container.get(0)
      createAnnotation($container, container, container, 3, 4)
      const expectedSelectedImg = $container.find('img:eq(1)').get(0)
      const imgInsideSpan = $container.find('.answerAnnotation:last img').get(0)
      expect(expectedSelectedImg).to.equal(imgInsideSpan)

      createAnnotation($container, container, container, 1, 2)
      expect($container.find('.answerAnnotation:last img').length).to.equal(2)
    })

    xit(`Selecting image when it is first in answer`, function() {
      const $container = createAndgetContainer(this, `<img alt="math1" src="/test/math.svg">`)
      const container = $container.get(0)
      createAnnotation($container, container, container, 0, 1)
      expect($container.find('.answerAnnotation:last img').length).to.equal(1)
    })

    xit(`Selecting first and second image `, function() {
      const $container = createAndgetContainer(this, `<img alt="math1" src="/test/math.svg"><img alt="math2" src="/test/math.svg"><img alt="math3" src="/test/math.svg">`)
      const container = $container.get(0)
      createAnnotation($container, container, container, 0, 2)
      expect($container.find('.answerAnnotation:last img').length).to.equal(2)
    })

    xit(`Merges correctly`, function() {
      const $container = createAndgetContainer(this, `ABCD<br><img alt="math1" src="/test/math.svg"><img alt="math2" src="/test/math.svg"><br>XYZ`)
      const container = $container.get(0)
      createAnnotation($container, container, container, 2, 4)
      createAnnotation($container, container.childNodes[0], container.querySelector('.answerAnnotation'), 3, 3)
      expect($container.find('.answerAnnotation:last').text()).to.equal('D')
    })
  })

  mocha.run()

})

function createAnnotation($container, startContainer, endContainer, startOffset, endOffset) {
  const range = document.createRange()
  range.setStart(startContainer, startOffset)
  range.setEnd(endContainer, endOffset)
  const selection = window.getSelection()
  selection.removeAllRanges()
  selection.addRange(range)
  $container.mouseup()
  $container.find('button').mousedown()
}
