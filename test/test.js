// eslint-disable-next-line no-extra-semi
;(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([
      'mocha',
      'chai',
      '../dist-umd/annotations-rendering',
      '../dist-umd/annotations-editing',
      'jquery',
      'lodash'
    ], factory)
  } else if (typeof exports === 'object') {
    module.exports = factory(
      require('mocha'),
      require('chai'),
      require('./dist-umd/annotations-rendering'),
      require('./dist-umd/annotations-editing'),
      require('jquery'),
      require('lodash')
    )
  } else {
    factory(root.mocha, root.chai, root.annotationsRendering, root.annotationsEditing, root.jQuery, root._)
  }
})(this, function (mocha, chai, annotationsRendering, annotationsEditing, $, _) {
  'use strict'

  function isCensor() {
    return $('body').hasClass('is_censor')
  }

  chai.config.truncateThreshold = 0
  chai.config.includeStack = true
  chai.config.showDiff = true
  mocha.setup('bdd')
  const expect = chai.expect
  const assert = chai.assert
  const $answerContainer = $('.testAnswerContainer')
  annotationsEditing.setupAnnotationDisplaying($answerContainer, isCensor())

  let currentTestIndex = 0
  let saves = []

  describe('When selecting richText', () => {
    it('Surrounding range from first three rows contains correct text', function () {
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

    it('First annotation should contain correct text', function () {
      const $container = createAndgetContainer(
        this,
        `answer rich <img alt="math1" src="math.svg"> Text<br>Lorem ipsum<br><br><br>`
      )
      annotationsRendering.renderAnnotationsForElement($container, [
        {
          message: 'great1',
          startIndex: 0,
          length: 5
        }
      ])
      expect(getAnnotationContent($container)).to.include.members(['answe'])
    })

    it('First annotation should contain correct text', function () {
      const $container = createAndgetContainer(
        this,
        `answer rich <img alt="math1" src="math.svg"> Text<br>Lorem ipsum<br><br><br>`
      )
      annotationsRendering.renderAnnotationsForElement($container, [
        {
          message: 'great1',
          startIndex: 0,
          length: 5
        }
      ])
      expect(getAnnotationContent($container)).to.include.members(['answe'])
    })

    it('Multiple annotations should be in correct place', function () {
      const imageAnnotations = [
        { message: 'great1', startIndex: 11, length: 7 },
        { message: 'great2', startIndex: 19, length: 10 },
        { message: 'great3', startIndex: 30, length: 1 }
      ]
      const $container = createAndgetContainer(
        this,
        `answer rich <img alt="math1" src="math.svg"> Text<br>Lorem ipsum<br><img alt="math2" src="math.svg">+<img alt="math3" src="math.svg">`
      )
      annotationsRendering.renderAnnotationsForElement($container, imageAnnotations)
      expect(getAnnotationContent($container)).to.include.members(['  Text', 'orem ipsum', '+'])
    })

    it('Selecting text after image should work', function () {
      const imageAnnotations = [
        { message: 'great1', startIndex: 11, length: 7 },
        { message: 'great2', startIndex: 20, length: 9 }
      ]
      const $container = createAndgetContainer(
        this,
        `answer rich <img alt="math1" src="math.svg"> Text<br>Lorem ipsum<br>`
      )
      annotationsRendering.renderAnnotationsForElement($container, imageAnnotations)
      expect(getAnnotationContent($container)).to.include.members(['  Text', 'rem ipsum'])
    })

    it(`Selecting single image shouldn't throw an error`, function () {
      const imageAnnotation = [{ message: 'great1', startIndex: 2, length: 1 }]
      const annFn = () =>
        annotationsRendering.renderAnnotationsForElement(
          createAndgetContainer(this, `bi<br><img alt="math2" src="math.svg">+<img alt="math3" src="math.svg">`),
          imageAnnotation
        )
      expect(annFn).to.not.throw()
    })

    it(`Selecting image after another image shouldn't throw errors`, function () {
      const imageAnnotations = [
        { message: 'great1', startIndex: 11, length: 7 },
        { message: 'great1', startIndex: 23, length: 1 }
      ]
      const annFn = () =>
        annotationsRendering.renderAnnotationsForElement(
          createAndgetContainer(
            this,
            `answer rich <img alt="math1" src="math.svg"> Text<br>Morbi<br><img alt="math2" src="math.svg">+<img alt="math3" src="math.svg">`
          ),
          imageAnnotations
        )
      expect(annFn).to.not.throw()
    })

    it('New annotation overlapping other annotations should be merged', function () {
      const newAnn = { message: 'great3', startIndex: 4, length: 10 }
      var $elem = $('<div>').data('annotations', [
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
      ])
      const mergedAnnotation = annotationsRendering.mergeAnnotation($elem, newAnn)
      expect(mergedAnnotation).to.deep.include({
        startIndex: 0,
        length: 14,
        message: newAnn.message
      })
    })

    it(`Selecting correct image`, function () {
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
      expect($container.find('.answerAnnotation:last img').length).to.equal(1)
      expect(saves).to.eql([
        {
          answerId: String(currentTestIndex),
          annotations: [{ startIndex: 2, length: 1, message: '' }]
        }
      ])
    })

    it(`Selecting image when it is first in answer`, function () {
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

    it(`Selecting first and second image `, function () {
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

    it(`Merges correctly`, function () {
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

    it(`Annotates normal text`, function () {
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

    it(`Ignores autograded answers`, function () {
      const $container = createAndgetContainer(this, `ABCD XYZ`, true)
      const container = $container.get(0)
      createAnnotation($container, container.childNodes[0], container.childNodes[0], 2, 4)
      expect($container.find('.answerAnnotation').text()).to.equal('')
      expect(saves).to.eql([])
    })

    it(`Saves comment`, function () {
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

  describe('When annotating image', function () {
    let $wrapper
    beforeEach(function (done) {
      $wrapper = createAndgetWrapper(
        this,
        `Lorem ipsum dolor sit amet. <br> <img src="sample_screenshot_large.jpg"><br> More text on another line<br>
 <img src="sample_screenshot.jpg"></br> Even more text on third line.`,
        false
      )
      setTimeout(done, 100)
    })

    it('should render rect annotation on an image', function () {
      updateLastTitle(this)
      const annotation = {
        type: 'rect',
        attachmentIndex: 0,
        x: 0.25,
        y: 0.25,
        height: 0.5,
        width: 0.5,
        message: 'msg'
      }

      annotationsRendering.renderAnnotationsForElement($wrapper.find('.answerRichText'), [annotation])
      expect(getAnnotationStyle($wrapper)).to.eql([
        {
          left: '25%',
          top: '25%',
          right: '25%',
          bottom: '25%'
        }
      ])
    })

    it('should render a horizontal line annotation on an image', function () {
      updateLastTitle(this)
      const annotation = {
        type: 'line',
        attachmentIndex: 0,
        x1: 0.25,
        y1: 0.5,
        x2: 0.75,
        y2: 0.5,
        message: 'Horizontal line annotation'
      }
      annotationsRendering.renderAnnotationsForElement($wrapper.find('.answerRichText'), [annotation])
      expect(getAnnotationStyle($wrapper)).to.eql([
        {
          left: '25%',
          top: '50%',
          right: '25%',
          bottom: '50%'
        }
      ])
    })

    it('should render a vertical line annotation on an image', function () {
      updateLastTitle(this)
      const annotation = {
        type: 'line',
        attachmentIndex: 0,
        x1: 0.5,
        y1: 0.25,
        x2: 0.5,
        y2: 0.75,
        message: 'Vertical line annotation'
      }
      annotationsRendering.renderAnnotationsForElement($wrapper.find('.answerRichText'), [annotation])
      expect(getAnnotationStyle($wrapper)).to.eql([
        {
          left: '50%',
          top: '25%',
          right: '50%',
          bottom: '25%'
        }
      ])
    })

    it('should sort cross references correctly for mixed annotations', function () {
      updateLastTitle(this)
      const annotations = [
        {
          length: 5,
          message: 'msg 1',
          startIndex: 6
        },
        {
          type: 'line',
          attachmentIndex: 1,
          x1: 0.5,
          y1: 0.25,
          x2: 0.5,
          y2: 0.75,
          message: 'msg 4'
        }
      ]
      const $container = $wrapper.find('.answerRichText')
      const container = $container.get(0)
      annotationsRendering.renderAnnotationsForElement($container, annotations)
      const firstNode = container.childNodes[8]
      createAnnotation($container, firstNode, firstNode, 0, 5, 'msg 3')
      const secondNode = container.childNodes[17]
      createAnnotation($container, secondNode, secondNode, 0, 5, 'msg 5')

      createImageAnnotation($container, 0, { x1: 0, y1: 174.7890625, x2: 94.5, y2: 349.578125 }, 'msg 2')

      // Firefox reports some values rounded differently from Chrome.
      const mapLeafs = (f, x) =>
        x instanceof Array
          ? _.map(x, x => mapLeafs(f, x))
          : x instanceof Object
          ? _.mapValues(x, x => mapLeafs(f, x))
          : f(x)

      expect(mapLeafs(x => (_.isNumber(x) ? _.round(x, 2) : x), _.last(saves))).to.eql({
        answerId: '18',
        annotations: [
          { length: 5, message: 'msg 1', startIndex: 6 },
          { type: 'rect', attachmentIndex: 0, x: 0, y: 0.31, width: 0.13, height: 0.31, message: 'msg 2' },
          { startIndex: 30, length: 5, message: 'msg 3' },
          { type: 'line', attachmentIndex: 1, x1: 0.5, y1: 0.25, x2: 0.5, y2: 0.75, message: 'msg 4' },
          { startIndex: 59, length: 5, message: 'msg 5' }
        ]
      })

      expect(mapLeafs(x => x.replace(/\.[0-9]*/, ''), getAnnotationStyle($wrapper))).to.eql([
        { left: '0%', top: '31%', right: '87%', bottom: '37%' },
        { left: '50%', top: '25%', right: '50%', bottom: '25%' }
      ])
      expect(tableToMatrix($wrapper.find('.annotation-messages').get(0))).to.eql([
        ['', 'msg 1'],
        ['', 'msg 2'],
        ['', 'msg 3'],
        ['', 'msg 4'],
        ['', 'msg 5']
      ])
    })
  })

  describe('When entering comment', () => {
    it('user input is escaped properly', () => {
      const $container = createAndgetContainer(
        this,
        `answer rich <img alt="math1" src="math.svg"> Text<br>Lorem ipsum<br><br><br>`
      )
      const container = $container.get(0)

      const code = '"/><script>window.bug = "injected"</script><input value="'

      createAnnotation($container, container, container, 0, 1, code)

      openAnnotationDialog($container, container, container, 0, 2)

      expect(window.bug).to.eql(undefined)
      expect($container.find('.add-annotation-text').val()).to.eql(code + ' / ')
    })
  })

  describe('With a second layer of annotations', function () {
    let $newContainer
    before("everything doesn't break down on Firefox (manual test)", function () {
      $('.testAnswerContainer').removeClass('is_pregrading').addClass('is_censor')

      currentTestIndex++

      const content = `Osaan tehtävistä liittyy aineistoa, jota on hyödynnettävä tehtävänannon mukaan. Lue tehtävät, silmäile aineistot läpi ja valitse tehtävistä yksi. <img src="sample_screenshot.jpg"> Tehtävät arvostellaan pistein 0–60. Kirjoita ehyt ja kielellisesti huoliteltu teksti. Sopiva pituus on 4–5 sivua. Tekstin tulee olla selvästi ja siististi kirjoitettu, mutta sitä ei tarvitse kirjoittaa puhtaaksi kuulakynällä tai musteella. Valmiit otsikot on lihavoitu. Muussa tapauksessa anna kirjoituksellesi oma otsikko. Merkitse kirjoitustehtävän numero otsikon eteen. Jos valitset aineistotehtävän, tekstisi pitää olla siten ehyt, että lukija voi ymmärtää tekstisi, vaikka ei tunnekaan aineistoa. Aineistotehtävissä tulee viitata aineistoon.<img src="sample_screenshot_large.jpg">`

      $newContainer = $('<div>')
        .attr('id', 'answer-' + currentTestIndex)
        .addClass('answer-wrapper').html(`
<div data-answer-id="${currentTestIndex}" class="answer legacyAnswer selected hasComment" style="display: flex; flex-direction: column">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer">${content}</div>
    <div class="answerText answerRichText is_pregrading" style="position: relative; color: transparent; top: -2px">${content}</div>
    <div class="answerText answerRichText is_censor no-mouse" style="position: absolute; top: 0; left: 0">${content}</div>
  </div>
  <div class="answer-annotations">
    <div class="is_pregrading">
      <table class="annotation-messages"></table>
    </div>
    <div class="is_censor">
      <table class="annotation-messages"></table>
    </div>
  </div>
</div>`)
      $newContainer.prepend(`<h2>${this.test.title}</h2>`)
      $answerContainer.append($newContainer)

      annotationsRendering.renderAnnotationsForElement($newContainer.find('.answerText.is_pregrading'), [
        { startIndex: 296, length: 57, message: 'Huuhaata!' },
        {
          type: 'rect',
          attachmentIndex: 0,
          x: 0.25,
          y: 0.25,
          height: 0.5,
          width: 0.5,
          message: 'msg'
        }
      ])
      annotationsRendering.renderAnnotationsForElement($newContainer.find('.answerText.is_censor'), [
        { startIndex: 26, length: 57, message: 'Huuhaata2!' },
        {
          type: 'rect',
          attachmentIndex: 0,
          x: 0.2,
          y: 0.2,
          height: 0.2,
          width: 0.2,
          message: 'msg2'
        }
      ])

      annotationsEditing.setupAnnotationEditing(
        $newContainer,
        (answerId, annotations) => {
          saves.push({ answerId, annotations })
        },
        $obj => $obj,
        isCensor()
      )
    })
    it('pregrading annotations can be toggled', () => {
      const $censor = $newContainer.find('.answerText.is_censor')
      const $pregrading = $newContainer.find('.answerText.is_pregrading')
      expect($censor.find('div.answerAnnotation:visible')).to.have.length(1)
      expect($censor.find('span.answerAnnotation:visible').css('border-bottom-width')).to.equal('2px')
      expect($pregrading.find('div.answerAnnotation:visible')).to.have.length(1)
      expect($pregrading.find('span.answerAnnotation:visible').css('border-bottom-width')).to.equal('1px')
      const $body = $('body')
      $body.addClass('hide_pregrading_annotations')
      expect($censor.find('div.answerAnnotation:visible')).to.have.length(1)
      expect($censor.find('span.answerAnnotation:visible').css('border-bottom-width')).to.equal('2px')
      expect($pregrading.find('div.answerAnnotation:visible')).to.have.length(0)
      expect($pregrading.find('span.answerAnnotation:visible').css('border-bottom-width')).to.equal('0px')
      $body.removeClass('hide_pregrading_annotations')
    })
  })

  mocha.run()

  function setAnswer(content, title, isAutograded) {
    currentTestIndex++
    const $newContainer = $('<div>')
      .attr('id', 'answer-' + currentTestIndex)
      .addClass('answer-wrapper').html(`
<div data-answer-id="${currentTestIndex}" class="answer legacyAnswer selected hasComment ${
      isAutograded ? 'autograded' : ''
    }">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer">${content}</div>
    <div class="answerText answerRichText is_pregrading">${content}</div>
    <div class="answer-annotations">
      <div class="is_pregrading">
        <table class="annotation-messages"></table>
      </div>
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
      $obj => $obj,
      isCensor()
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

  function createImageAnnotation($container, imageIndex = 1, dimensions, comment) {
    const $lastImg = $container.find('img').eq(imageIndex)
    const rect = $lastImg.get(0).getBoundingClientRect()
    $lastImg
      .trigger({ type: 'mousedown', clientX: rect.left + dimensions.x1, clientY: rect.top + dimensions.y1, button: 0 })
      .trigger({ type: 'mousemove', clientX: rect.left + dimensions.x2, clientY: rect.top + dimensions.y2, button: 0 })
      .trigger({ type: 'mouseup', clientX: rect.left + dimensions.x2, clientY: rect.top + dimensions.y2, button: 0 })
    if (comment) {
      $container.find('.add-annotation-text').val(comment).keyup()
    }
    $container.find('button').mousedown()
  }

  function openAnnotationDialog($container, startContainer, endContainer, startOffset, endOffset) {
    const range = document.createRange()
    range.setStart(startContainer, startOffset)
    range.setEnd(endContainer, endOffset)
    const selection = window.getSelection()
    selection.removeAllRanges()
    selection.addRange(range)
    $container.mouseup()
  }

  function createAnnotation($container, startContainer, endContainer, startOffset, endOffset, comment) {
    openAnnotationDialog($container, startContainer, endContainer, startOffset, endOffset)
    if (comment) {
      $container.find('.add-annotation-text').val(comment).keyup()
    }
    $container.find('button').mousedown()
  }

  function tableToMatrix(table) {
    return Array.from(table.rows).map(row => Array.from(row.cells).map(cell => cell.innerText.trim()))
  }
  function updateLastTitle(ctx) {
    $('h2:last').text(ctx.test.title)
  }
})
