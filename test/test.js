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
    const answerContent = `answer rich <img alt="math1" src="/test/math.svg"> Text<br>Lorem ipsum<br><br><br>Vivamus venenatis<br><br><br>Phasellus tempus<br><br>Morbi<br><img alt="math2" src="/test/math.svg">+<img alt="math3" src="/test/math.svg"> = y + x<img alt="math4" src="/test/math.svg"><br><br><br>new paragraph<img alt="math5" src="/test/math.svg"><br><img alt="math6" src="/test/math.svg"><br><img alt="math7" src="/test/math.svg"><br>`

    const createAndgetContainer = function(ctx) {
      setAnswer(answerContent, ctx && ctx.test.title)
      return $answerContainer.find('#answer-' + currentTestIndex + ' .answerRichText')
    }

    it('Surrounding range from first three rows contains correct text', function() {
      const answer = createAndgetContainer(this).get(0)
      const range = document.createRange()
      range.setStart(answer, 0)
      range.setEnd(answer, 3)

      const $annotatedElement = annotationRendering.surroundWithAnnotationSpan(range, 'answerAnnotation')
      assert.equal($annotatedElement.contents().length, 3)
      assert.equal($annotatedElement.text(), 'answer rich  Text')
    })

    it('First annotation should contain correct text', function() {
        annotationRendering.renderGivenAnnotations(createAndgetContainer(this), [annotations[0]])
        expect(getAnnotationContent($answerContainer)).to.include.members(['answe'])
    })

    it('Multiple annotations should be in correct place', function() {
      const imageAnnotations = [
        {message: 'great1', startIndex: 11, length: 7},
        {message: 'great2', startIndex: 19, length: 10},
        {message: 'great3', startIndex: 68, length: 1}
      ]
      annotationRendering.renderGivenAnnotations(createAndgetContainer(this), imageAnnotations)
      expect(getAnnotationContent($answerContainer)).to.include.members(['  Text', 'orem ipsum', '+'])
    })

    it('Selecting text after image should work', function() {
      const imageAnnotations = [
        {message: 'great1', startIndex: 11, length: 7},
        {message: 'great2', startIndex: 20, length: 9}
      ]
      annotationRendering.renderGivenAnnotations(createAndgetContainer(this), imageAnnotations)
      expect(getAnnotationContent($answerContainer)).to.include.members(['  Text', 'rem ipsum'])
    })

    it(`Selecting single image shouldn't throw an error`, function() {
      const imageAnnotation = [
        {message: 'great1', startIndex: 67, length: 1}
      ]
      const annFn = () => annotationRendering.renderGivenAnnotations(createAndgetContainer(this), imageAnnotation)
      expect(annFn).to.not.throw()
    })

    it(`Selecting image after another image shouldn't throw errors`, function() {
      const imageAnnotations = [
        {message: 'great1', startIndex: 11, length: 7},
        {message: 'great1', startIndex: 67, length: 1}
      ]
      const annFn = () => annotationRendering.renderGivenAnnotations(createAndgetContainer(this), imageAnnotations)
      expect(annFn).to.not.throw()
    })

    it('New annotation overlapping other annotations should be merged', function() {
      const newAnn = {message: 'great3', startIndex: 4, length: 10}
      const mergedAnnotation = annotationRendering.mergeAnnotation(annotations, newAnn)
      expect(mergedAnnotation).to.deep.include({startIndex: 0, length: 14, message: newAnn.message})
    })

    it(`Selecting correct image`, function() {
      const $container = createAndgetContainer(this)
      const range = document.createRange()
      range.setStart($container.get(0), 28)
      range.setEnd($container.get(0), 29)
      const selection = window.getSelection()
      selection.removeAllRanges()
      selection.addRange(range)
      $container.mouseup()
      $container.find('button').mousedown()
      const expectedSelectedImg = $container.find('img:eq(5)').get(0)
      const imgInsideSpan = $container.find('.answerAnnotation:last img').get(0)
      expect(expectedSelectedImg).to.equal(imgInsideSpan)
    })
  })

  mocha.run()

})
