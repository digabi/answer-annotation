// eslint-disable-next-line no-extra-semi
;(function(root, factory) {
  if (typeof define === 'function' && define.amd) {
    define(['mocha', 'chai', '../dist/annotations-rendering', '../dist/annotations-editing', 'jquery'], factory)
  } else if (typeof exports === 'object') {
    module.exports = factory(require('mocha'), require('chai'), require('./dist/annotations-rendering'), require('./dist/annotations-editing'), require('jquery'))
  } else {
    factory(root.mocha, root.chai, root.annotationsRendering, root.annotationsEditing, root.jQuery)
  }
})(this, function (mocha,
                   chai,
                   annotationsRendering,
                   annotationsEditing,
                   $) {
  'use strict'

  chai.config.truncateThreshold = 0
  chai.config.includeStack = true
  mocha.setup('bdd')
  const expect = chai.expect
  const assert = chai.assert
  const $answerContainer = $('.testAnswerContainer')
  annotationsEditing.setupAnnotationDisplaying($answerContainer)

  let currentTestIndex = 0
  let saves = []

  describe('When selecting richText', () => {
    it('Surrounding range from first three rows contains correct text', function() {
      const answer = createAndgetContainer(
        this,
        `answer rich <img alt="math1" src="math.svg"> Text<br>Lorem ipsum<br><br><br>`
      ).get(0)
      const range = document.createRange()
      range.setStart(answer, 0)
      range.setEnd(answer, 3)

      const $annotatedElement = annotationsRendering.surroundWithAnnotationSpan(range, 'answerAnnotation')
      assert.equal($annotatedElement.contents().length, 3)
      assert.equal($annotatedElement.text(), 'answer rich  Text')
    })

    it('First annotation should contain correct text', function() {
      const $container = createAndgetContainer(
        this,
        `answer rich <img alt="math1" src="math.svg"> Text<br>Lorem ipsum<br><br><br>`
      )
      annotationsRendering.renderGivenAnnotations(
        $container,
        [{
        message: 'great1',
        startIndex: 0,
        length: 5
      }]
      )
      expect(getAnnotationContent($container)).to.include.members(['answe'])
    })

    it('First annotation should contain correct text', function() {
      const $container = createAndgetContainer(
        this,
        `answer rich <img alt="math1" src="math.svg"> Text<br>Lorem ipsum<br><br><br>`
      )
      annotationsRendering.renderGivenAnnotations(
        $container,
        [{
        message: 'great1',
        startIndex: 0,
        length: 5
      }]
      )
      expect(getAnnotationContent($container)).to.include.members(['answe'])
    })

    it('Multiple annotations should be in correct place', function() {
      const imageAnnotations = [
        { message: 'great1', startIndex: 11, length: 7 },
        { message: 'great2', startIndex: 19, length: 10 },
        { message: 'great3', startIndex: 30, length: 1 }
      ]
      const $container = createAndgetContainer(
        this,
        `answer rich <img alt="math1" src="math.svg"> Text<br>Lorem ipsum<br><img alt="math2" src="math.svg">+<img alt="math3" src="math.svg">`
      )
      annotationsRendering.renderGivenAnnotations(
        $container,
        imageAnnotations
      )
      expect(getAnnotationContent($container)).to.include.members(['  Text', 'orem ipsum', '+'])
    })

    it('Selecting text after image should work', function() {
      const imageAnnotations = [
        { message: 'great1', startIndex: 11, length: 7 },
        { message: 'great2', startIndex: 20, length: 9 }
      ]
      const $container = createAndgetContainer(this, `answer rich <img alt="math1" src="math.svg"> Text<br>Lorem ipsum<br>`)
      annotationsRendering.renderGivenAnnotations(
        $container,
        imageAnnotations
      )
      expect(getAnnotationContent($container)).to.include.members(['  Text', 'rem ipsum'])
    })

    it(`Selecting single image shouldn't throw an error`, function() {
      const imageAnnotation = [{ message: 'great1', startIndex: 2, length: 1 }]
      const annFn = () =>
        annotationsRendering.renderGivenAnnotations(
          createAndgetContainer(
            this,
            `bi<br><img alt="math2" src="math.svg">+<img alt="math3" src="math.svg">`
          ),
          imageAnnotation
        )
      expect(annFn).to.not.throw()
    })

    it(`Selecting image after another image shouldn't throw errors`, function() {
      const imageAnnotations = [
        { message: 'great1', startIndex: 11, length: 7 },
        { message: 'great1', startIndex: 23, length: 1 }
      ]
      const annFn = () =>
        annotationsRendering.renderGivenAnnotations(
          createAndgetContainer(
            this,
            `answer rich <img alt="math1" src="math.svg"> Text<br>Morbi<br><img alt="math2" src="math.svg">+<img alt="math3" src="math.svg">`
          ),
          imageAnnotations
        )
      expect(annFn).to.not.throw()
    })

    it('New annotation overlapping other annotations should be merged', function() {
      const newAnn = { message: 'great3', startIndex: 4, length: 10 }
      const mergedAnnotation = annotationsRendering.mergeAnnotation([
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
    ], newAnn)
      expect(mergedAnnotation).to.deep.include({
        startIndex: 0,
        length: 14,
        message: newAnn.message
      })
    })

    it(`Selecting correct image`, function() {
      const $container = createAndgetContainer(
        this,
        `X<img alt="math5" src="math.svg"><br><img alt="math6" src="math.svg"><br><img alt="math7" src="math.svg"><br>`
      )
      const container = $container.get(0)
      createAnnotation($container, container, container, 3, 4)
      const expectedSelectedImg = $container.find('img:eq(1)').get(0)
      const imgInsideSpan = $container.find('.answerAnnotation:last img').get(0)
      expect(expectedSelectedImg).to.equal(imgInsideSpan)

      createAnnotation($container, container, container, 1, 2)
      expect($container.find('.answerAnnotation:last img').length).to.equal(2)
      expect(saves).to.eql([
        {
          answerId: String(currentTestIndex),
          annotations: [{ startIndex: 2, length: 1, message: '' }]
        },
        {
          answerId: String(currentTestIndex),
          annotations: [{ startIndex: 1, length: 2, message: '' }]
        }
      ])
    })

    it(`Selecting image when it is first in answer`, function() {
      const $container = createAndgetContainer(this, `<img alt="math1" src="math.svg">`)
      const container = $container.get(0)
      createAnnotation($container, container, container, 0, 1)
      expect($container.find('.answerAnnotation:last img').length).to.equal(1)
      expect(saves).to.eql([
        {
          answerId: String(currentTestIndex),
          annotations: [{ startIndex: 0, length: 1, message: '' }]
        }
      ])
    })

    it(`Selecting first and second image `, function() {
      const $container = createAndgetContainer(
        this,
        `<img alt="math1" src="math.svg"><img alt="math2" src="math.svg"><img alt="math3" src="math.svg">`
      )
      const container = $container.get(0)
      createAnnotation($container, container, container, 0, 2)
      expect($container.find('.answerAnnotation:last img').length).to.equal(2)
      expect(saves).to.eql([
        {
          answerId: String(currentTestIndex),
          annotations: [{ startIndex: 0, length: 2, message: '' }]
        }
      ])
    })

    it(`Merges correctly`, function() {
      const $container = createAndgetContainer(
        this,
        `ABCD<br><img alt="math1" src="math.svg"><img alt="math2" src="math.svg"><br>XYZ`
      )
      const container = $container.get(0)
      createAnnotation($container, container, container, 2, 4)
      createAnnotation($container, container.childNodes[0], container.querySelector('.answerAnnotation'), 3, 1)
      expect($container.find('.answerAnnotation:last').text()).to.equal('D')
      expect(saves).to.eql([
        {
          answerId: String(currentTestIndex),
          annotations: [{ startIndex: 4, length: 2, message: '' }]
        },
        {
          answerId: String(currentTestIndex),
          annotations: [{ startIndex: 3, length: 3, message: '' }]
        }
      ])
    })

    it(`Annotates normal text`, function() {
      const $container = createAndgetContainer(this, `ABCD XYZ`)
      const container = $container.get(0)
      createAnnotation($container, container.childNodes[0], container.childNodes[0], 2, 4)
      expect($container.find('.answerAnnotation').text()).to.equal('CD')
      expect(saves).to.eql([
        {
          answerId: String(currentTestIndex),
          annotations: [{ startIndex: 2, length: 2, message: '' }]
        }
      ])
    })

    it(`Ignores autograded answers`, function() {
      const $container = createAndgetContainer(this, `ABCD XYZ`, true)
      const container = $container.get(0)
      createAnnotation($container, container.childNodes[0], container.childNodes[0], 2, 4)
      expect($container.find('.answerAnnotation').text()).to.equal('')
      expect(saves).to.eql([])
    })

    it(`Saves comment`, function() {
      const $container = createAndgetContainer(this, `ABCD XYZ`)
      const container = $container.get(0)
      createAnnotation($container, container.childNodes[0], container.childNodes[0], 2, 4, 'comment text')
      expect($container.find('.answerAnnotation').text()).to.equal('CD')
      expect(saves).to.eql([
        {
          answerId: String(currentTestIndex),
          annotations: [{ startIndex: 2, length: 2, message: 'comment text' }]
        }
      ])
    })
  })

  describe('When annotating image', () => {

    it('should render rect annotation on an image', function() {
      const annotation = {
        type: 'rect',
        attachmentIndex: 0,
        x: 0.25,
        y: 0.25,
        height: 0.5,
        width: 0.5,
        message: 'msg'
      }

      const $wrapper = createAndgetWrapper(this, `Lorem ipsum dolor sit amet. </br> <img src="sample_screenshot.jpg"></br> More text on another line.`, false)
      annotationsRendering.renderGivenAnnotations($wrapper.find('.answerRichText'), [annotation])
      expect(getAnnotationStyle($wrapper)).to.eql([
        {
          left: '25%',
          top: '25%',
          right: '25%',
          bottom: '25%'
        }
      ])
    })

    it('should render a horizontal line annotation on an image', function() {
      const annotation = {
        type: 'line',
        attachmentIndex: 0,
        x1: 0.25,
        y1: 0.5,
        x2: 0.75,
        y2: 0.5,
        message: 'Horizontal line annotation'
      }
      const $wrapper = createAndgetWrapper(this, `Lorem ipsum dolor sit amet. </br> <img src="sample_screenshot.jpg"></br> More text on another line.`, false)
      annotationsRendering.renderGivenAnnotations($wrapper.find('.answerRichText'), [annotation])
      expect(getAnnotationStyle($wrapper)).to.eql([
        {
          left: '25%',
          top: '50%',
          right: '25%',
          bottom: '50%'
        }
      ])
    })

    it('should render a vertical line annotation on an image', function() {
      const annotation = {
        type: 'line',
        attachmentIndex: 0,
        x1: 0.5,
        y1: 0.25,
        x2: 0.5,
        y2: 0.75,
        message: 'Vertical line annotation'
      }
      const $wrapper = createAndgetWrapper(this, `Lorem ipsum dolor sit amet. </br> <img src="sample_screenshot.jpg"></br> More text on another line.`, false)
      annotationsRendering.renderGivenAnnotations($wrapper.find('.answerRichText'), [annotation])
      expect(getAnnotationStyle($wrapper)).to.eql([
        {
          left: '50%',
          top: '25%',
          right: '50%',
          bottom: '25%'
        }
      ])
    })

    it('should sort cross references correctly for mixed annotations', function() {
      const annotation = {
        type: 'line',
        attachmentIndex: 0,
        x1: 0.5,
        y1: 0.25,
        x2: 0.5,
        y2: 0.75,
        message: 'Vertical line annotation'
      }
      const $wrapper = createAndgetWrapper(this, `Lorem ipsum dolor sit amet. </br> <img src="sample_screenshot.jpg"></br> More text on another line.`, false)
      annotationsRendering.renderGivenAnnotations($wrapper.find('.answerRichText'), [annotation])
      expect(getAnnotationStyle($wrapper)).to.eql([
        {
          left: '50%',
          top: '25%',
          right: '50%',
          bottom: '25%'
        }
      ])
      expect(tableToMatrix($wrapper.find('.annotation-messages').get(0))).to.eql([
        [ '', 'Vertical line annotation' ]
      ])
    })
  })

  mocha.run()

  function setAnswer(content, title, isAutograded) {
    currentTestIndex++
    const $newContainer = $('<div>')
      .attr('id', 'answer-' + currentTestIndex)
      .addClass('answer-wrapper')
      .html(`
<div data-answer-id="${currentTestIndex}" class="answer selected hasComment ${ isAutograded ? 'autograded' : '' }">
  <div class="answer-text-container">
    <div class="originalAnswer" style="display: none">${content}</div>
    <div class="answerText answerRichText is_pregrading">${content}</div>
    <div class="answer-annotations">
    <div class="is_pregrading">
      <table class="annotation-messages"></table>
    </div>
  </div>
</div>`)
    $newContainer.prepend(`<h2>${title}</h2>`)
    $answerContainer.append($newContainer)
    annotationsEditing.setupAnnotationEditing(
      $newContainer.find('.answerText'),
      (answerId, annotations) => {
        saves.push({ answerId, annotations })
      },
      $obj => $obj
    )
  }

  function getAnnotationContent($container) {
    return $container
      .find('.answerAnnotation')
      .toArray()
      .map(e => e.textContent)
  }

  function getAnnotationStyle($wrapper) {
    return $wrapper
      .find('.rect, .line')
      .toArray()
      .map(e => _.pick(e.style, ['left', 'top', 'right', 'bottom']))
  }

  function createAndgetContainer(ctx, answerContent, isAutograded = false) {
    return createAndgetWrapper(ctx, answerContent, isAutograded).find('.answerRichText')
  }

  function createAndgetWrapper(ctx, answerContent, isAutograded = false) {
    saves = []
    setAnswer(answerContent, ctx && ctx.test.title, isAutograded)
    return $answerContainer.find('#answer-' + currentTestIndex)
  }

  function createAnnotation($container, startContainer, endContainer, startOffset, endOffset, comment) {
    const range = document.createRange()
    range.setStart(startContainer, startOffset)
    range.setEnd(endContainer, endOffset)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    $container.mouseup()
    if (comment) {
      $container
        .find('.add-annotation-text')
        .val(comment)
        .keyup()
    }
    $container.find('button').mousedown()
  }

  function tableToMatrix(table) {
    return Array.from(table.rows).map(row => Array.from(row.cells).map(cell => cell.innerText))
  }
})

