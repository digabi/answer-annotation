define([], () =>
  `<div id="answer-1" class="answer-wrapper"><h2>Surrounding range from first three rows contains correct text</h2>
<div data-answer-id="1" class="answer legacyAnswer selected hasComment ">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer">answer rich <img alt="math1" src="math.svg"> Text<br>Lorem ipsum<br><br><br></div>
    <div class="answerText answerRichText is_pregrading"><span class="answerAnnotation">answer rich <img alt="math1" src="math.svg"> Text</span><br>Lorem ipsum<br><br><br></div>
    <div class="answer-annotations">
      <div class="is_pregrading">
        <table class="annotation-messages"></table>
      </div>
    </div>
  </div>
</div></div><div id="answer-2" class="answer-wrapper"><h2>First annotation should contain correct text</h2>
<div data-answer-id="2" class="answer legacyAnswer selected hasComment ">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer">answer rich <img alt="math1" src="math.svg"> Text<br>Lorem ipsum<br><br><br></div>
    <div class="answerText answerRichText is_pregrading"><span class="answerAnnotation" data-message="great1" data-index="0">answe<sup class="annotationMessageIndex"></sup></span><i class="fa fa-comment"></i>r rich <img alt="math1" src="math.svg"> Text<br>Lorem ipsum<br><br><br></div>
    <div class="answer-annotations">
      <div class="is_pregrading">
        <table class="annotation-messages"><tr><td class="index"></td><td>great1</td></tr></table>
      </div>
    </div>
  </div>
</div></div><div id="answer-3" class="answer-wrapper"><h2>First annotation should contain correct text</h2>
<div data-answer-id="3" class="answer legacyAnswer selected hasComment ">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer">answer rich <img alt="math1" src="math.svg"> Text<br>Lorem ipsum<br><br><br></div>
    <div class="answerText answerRichText is_pregrading"><span class="answerAnnotation" data-message="great1" data-index="0">answe<sup class="annotationMessageIndex"></sup></span><i class="fa fa-comment"></i>r rich <img alt="math1" src="math.svg"> Text<br>Lorem ipsum<br><br><br></div>
    <div class="answer-annotations">
      <div class="is_pregrading">
        <table class="annotation-messages"><tr><td class="index"></td><td>great1</td></tr></table>
      </div>
    </div>
  </div>
</div></div><div id="answer-4" class="answer-wrapper"><h2>Multiple annotations should be in correct place</h2>
<div data-answer-id="4" class="answer legacyAnswer selected hasComment ">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer">answer rich <img alt="math1" src="math.svg"> Text<br>Lorem ipsum<br><img alt="math2" src="math.svg">+<img alt="math3" src="math.svg"></div>
    <div class="answerText answerRichText is_pregrading">answer rich<span class="answerAnnotation" data-message="great1" data-index="0"> <img alt="math1" src="math.svg"> Text<sup class="annotationMessageIndex"></sup></span><i class="fa fa-comment"></i><br>L<span class="answerAnnotation" data-message="great2" data-index="1">orem ipsum<sup class="annotationMessageIndex"></sup></span><i class="fa fa-comment"></i><br><img alt="math2" src="math.svg"><span class="answerAnnotation" data-message="great3" data-index="2">+<sup class="annotationMessageIndex"></sup></span><i class="fa fa-comment"></i><img alt="math3" src="math.svg"></div>
    <div class="answer-annotations">
      <div class="is_pregrading">
        <table class="annotation-messages"><tr><td class="index"></td><td>great1</td></tr><tr><td class="index"></td><td>great2</td></tr><tr><td class="index"></td><td>great3</td></tr></table>
      </div>
    </div>
  </div>
</div></div><div id="answer-5" class="answer-wrapper"><h2>Selecting text after image should work</h2>
<div data-answer-id="5" class="answer legacyAnswer selected hasComment ">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer">answer rich <img alt="math1" src="math.svg"> Text<br>Lorem ipsum<br></div>
    <div class="answerText answerRichText is_pregrading">answer rich<span class="answerAnnotation" data-message="great1" data-index="0"> <img alt="math1" src="math.svg"> Text<sup class="annotationMessageIndex"></sup></span><i class="fa fa-comment"></i><br>Lo<span class="answerAnnotation" data-message="great2" data-index="1">rem ipsum<sup class="annotationMessageIndex"></sup></span><i class="fa fa-comment"></i><br></div>
    <div class="answer-annotations">
      <div class="is_pregrading">
        <table class="annotation-messages"><tr><td class="index"></td><td>great1</td></tr><tr><td class="index"></td><td>great2</td></tr></table>
      </div>
    </div>
  </div>
</div></div><div id="answer-6" class="answer-wrapper"><h2>Selecting single image shouldn't throw an error</h2>
<div data-answer-id="6" class="answer legacyAnswer selected hasComment ">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer">bi<br><img alt="math2" src="math.svg">+<img alt="math3" src="math.svg"></div>
    <div class="answerText answerRichText is_pregrading">bi<br><span class="answerAnnotation" data-message="great1" data-index="0"><img alt="math2" src="math.svg"><sup class="annotationMessageIndex"></sup></span><i class="fa fa-comment"></i>+<img alt="math3" src="math.svg"></div>
    <div class="answer-annotations">
      <div class="is_pregrading">
        <table class="annotation-messages"><tr><td class="index"></td><td>great1</td></tr></table>
      </div>
    </div>
  </div>
</div></div><div id="answer-7" class="answer-wrapper"><h2>Selecting image after another image shouldn't throw errors</h2>
<div data-answer-id="7" class="answer legacyAnswer selected hasComment ">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer">answer rich <img alt="math1" src="math.svg"> Text<br>Morbi<br><img alt="math2" src="math.svg">+<img alt="math3" src="math.svg"></div>
    <div class="answerText answerRichText is_pregrading">answer rich<span class="answerAnnotation" data-message="great1" data-index="0"> <img alt="math1" src="math.svg"> Text<sup class="annotationMessageIndex"></sup></span><i class="fa fa-comment"></i><br>Morbi<br><span class="answerAnnotation" data-message="great1" data-index="1"><img alt="math2" src="math.svg"><sup class="annotationMessageIndex"></sup></span><i class="fa fa-comment"></i>+<img alt="math3" src="math.svg"></div>
    <div class="answer-annotations">
      <div class="is_pregrading">
        <table class="annotation-messages"><tr><td class="index"></td><td>great1</td></tr><tr><td class="index"></td><td>great1</td></tr></table>
      </div>
    </div>
  </div>
</div></div><div id="answer-8" class="answer-wrapper"><h2>Selecting correct image</h2>
<div data-answer-id="8" class="answer legacyAnswer selected hasComment ">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer">X<img alt="math5" src="math.svg"><br><img alt="math6" src="math.svg"><br><img alt="math7" src="math.svg"><br></div>
    <div class="answerText answerRichText is_pregrading">X<span class="answerAnnotation" data-message="" data-index="0"><img alt="math5" src="math.svg"><br><img alt="math6" src="math.svg"></span><i class="fa fa-comment"></i><br><img alt="math7" src="math.svg"><br></div>
    <div class="answer-annotations">
      <div class="is_pregrading">
        <table class="annotation-messages"></table>
      </div>
    </div>
  </div>
</div></div><div id="answer-9" class="answer-wrapper"><h2>Selecting image when it is first in answer</h2>
<div data-answer-id="9" class="answer legacyAnswer selected hasComment ">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer"><img alt="math1" src="math.svg"></div>
    <div class="answerText answerRichText is_pregrading"><span class="answerAnnotation" data-message="" data-index="0"><img alt="math1" src="math.svg"></span><i class="fa fa-comment"></i></div>
    <div class="answer-annotations">
      <div class="is_pregrading">
        <table class="annotation-messages"></table>
      </div>
    </div>
  </div>
</div></div><div id="answer-10" class="answer-wrapper"><h2>Selecting first and second image </h2>
<div data-answer-id="10" class="answer legacyAnswer selected hasComment ">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer"><img alt="math1" src="math.svg"><img alt="math2" src="math.svg"><img alt="math3" src="math.svg"></div>
    <div class="answerText answerRichText is_pregrading"><span class="answerAnnotation" data-message="" data-index="0"><img alt="math1" src="math.svg"><img alt="math2" src="math.svg"></span><i class="fa fa-comment"></i><img alt="math3" src="math.svg"></div>
    <div class="answer-annotations">
      <div class="is_pregrading">
        <table class="annotation-messages"></table>
      </div>
    </div>
  </div>
</div></div><div id="answer-11" class="answer-wrapper"><h2>Merges correctly</h2>
<div data-answer-id="11" class="answer legacyAnswer selected hasComment ">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer">ABCD<br><img alt="math1" src="math.svg"><img alt="math2" src="math.svg"><br>XYZ</div>
    <div class="answerText answerRichText is_pregrading">ABC<span class="answerAnnotation" data-message="" data-index="0">D<br><img alt="math1" src="math.svg"><img alt="math2" src="math.svg"></span><i class="fa fa-comment"></i><br>XYZ</div>
    <div class="answer-annotations">
      <div class="is_pregrading">
        <table class="annotation-messages"></table>
      </div>
    </div>
  </div>
</div></div><div id="answer-12" class="answer-wrapper"><h2>Annotates normal text</h2>
<div data-answer-id="12" class="answer legacyAnswer selected hasComment ">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer">ABCD XYZ</div>
    <div class="answerText answerRichText is_pregrading">AB<span class="answerAnnotation" data-message="" data-index="0">CD</span><i class="fa fa-comment"></i> XYZ</div>
    <div class="answer-annotations">
      <div class="is_pregrading">
        <table class="annotation-messages"></table>
      </div>
    </div>
  </div>
</div></div><div id="answer-13" class="answer-wrapper"><h2>Ignores autograded answers</h2>
<div data-answer-id="13" class="answer legacyAnswer selected hasComment autograded">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer">ABCD XYZ</div>
    <div class="answerText answerRichText is_pregrading">ABCD XYZ</div>
    <div class="answer-annotations">
      <div class="is_pregrading">
        <table class="annotation-messages"></table>
      </div>
    </div>
  </div>
</div></div><div id="answer-14" class="answer-wrapper"><h2>Saves comment</h2>
<div data-answer-id="14" class="answer legacyAnswer selected hasComment ">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer">ABCD XYZ</div>
    <div class="answerText answerRichText is_pregrading">AB<span class="answerAnnotation" data-message="comment text" data-index="0">CD<sup class="annotationMessageIndex"></sup></span><i class="fa fa-comment"></i> XYZ</div>
    <div class="answer-annotations">
      <div class="is_pregrading">
        <table class="annotation-messages"><tr><td class="index"></td><td>comment text</td></tr></table>
      </div>
    </div>
  </div>
</div></div><div id="answer-15" class="answer-wrapper"><h2>should render rect annotation on an image</h2>
<div data-answer-id="15" class="answer legacyAnswer selected hasComment ">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer">Lorem ipsum dolor sit amet. <br> <img src="sample_screenshot.jpg"><br> More text on another line<br>
 <img src="sample_screenshot.jpg"><br> Even more text on third line.</div>
    <div class="answerText answerRichText is_pregrading">Lorem ipsum dolor sit amet. <br> <span class="attachmentWrapper"><img src="sample_screenshot.jpg"><div class="answerAnnotation rect" data-message="msg" data-index="0" style="left: 25%; top: 25%; right: 25%; bottom: 25%;"><sup class="annotationMessageIndex"></sup></div></span><i class="fa fa-comment"></i><br> More text on another line<br>
 <img src="sample_screenshot.jpg"><br> Even more text on third line.</div>
    <div class="answer-annotations">
      <div class="is_pregrading">
        <table class="annotation-messages"><tr><td class="index"></td><td>msg</td></tr></table>
      </div>
    </div>
  </div>
</div></div><div id="answer-16" class="answer-wrapper"><h2>should render a horizontal line annotation on an image</h2>
<div data-answer-id="16" class="answer legacyAnswer selected hasComment ">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer">Lorem ipsum dolor sit amet. <br> <img src="sample_screenshot.jpg"><br> More text on another line<br>
 <img src="sample_screenshot.jpg"><br> Even more text on third line.</div>
    <div class="answerText answerRichText is_pregrading">Lorem ipsum dolor sit amet. <br> <span class="attachmentWrapper"><img src="sample_screenshot.jpg"><div class="answerAnnotation line" data-message="Horizontal line annotation" data-index="0" style="left: 25%; top: 50%; right: 25%; bottom: 50%;"><sup class="annotationMessageIndex"></sup></div></span><i class="fa fa-comment"></i><br> More text on another line<br>
 <img src="sample_screenshot.jpg"><br> Even more text on third line.</div>
    <div class="answer-annotations">
      <div class="is_pregrading">
        <table class="annotation-messages"><tr><td class="index"></td><td>Horizontal line annotation</td></tr></table>
      </div>
    </div>
  </div>
</div></div><div id="answer-17" class="answer-wrapper"><h2>should render a vertical line annotation on an image</h2>
<div data-answer-id="17" class="answer legacyAnswer selected hasComment ">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer">Lorem ipsum dolor sit amet. <br> <img src="sample_screenshot.jpg"><br> More text on another line<br>
 <img src="sample_screenshot.jpg"><br> Even more text on third line.</div>
    <div class="answerText answerRichText is_pregrading">Lorem ipsum dolor sit amet. <br> <span class="attachmentWrapper"><img src="sample_screenshot.jpg"><div class="answerAnnotation line" data-message="Vertical line annotation" data-index="0" style="left: 50%; top: 25%; right: 50%; bottom: 25%;"><sup class="annotationMessageIndex"></sup></div></span><i class="fa fa-comment"></i><br> More text on another line<br>
 <img src="sample_screenshot.jpg"><br> Even more text on third line.</div>
    <div class="answer-annotations">
      <div class="is_pregrading">
        <table class="annotation-messages"><tr><td class="index"></td><td>Vertical line annotation</td></tr></table>
      </div>
    </div>
  </div>
</div></div><div id="answer-18" class="answer-wrapper"><h2>should sort cross references correctly for mixed annotations</h2>
<div data-answer-id="18" class="answer legacyAnswer selected hasComment ">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer">Lorem ipsum dolor sit amet. <br> <img src="sample_screenshot.jpg"><br> More text on another line<br>
 <img src="sample_screenshot.jpg"><br> Even more text on third line.</div>
    <div class="answerText answerRichText is_pregrading">Lorem <span class="answerAnnotation" data-message="msg 1" data-index="0">ipsum<sup class="annotationMessageIndex"></sup></span><i class="fa fa-comment"></i> dolor sit amet. <br> <span class="attachmentWrapper"><img src="sample_screenshot.jpg"><div class="answerAnnotation rect" data-message="msg 2" data-index="1" style="left: 0%; top: 47.489%; right: 76.2563%; bottom: 5.02208%;"><sup class="annotationMessageIndex"></sup></div></span><i class="fa fa-comment"></i><br><span class="answerAnnotation" data-message="msg 3" data-index="2"> More<sup class="annotationMessageIndex"></sup></span><i class="fa fa-comment"></i> text on another line<br>
 <span class="attachmentWrapper"><img src="sample_screenshot.jpg"><div class="answerAnnotation line" data-message="msg 4" data-index="3" style="left: 50%; top: 25%; right: 50%; bottom: 25%;"><sup class="annotationMessageIndex"></sup></div></span><i class="fa fa-comment"></i><br><span class="answerAnnotation" data-message="msg 5" data-index="4"> Even<sup class="annotationMessageIndex"></sup></span><i class="fa fa-comment"></i> more text on third line.</div>
    <div class="answer-annotations">
      <div class="is_pregrading">
        <table class="annotation-messages"><tr><td class="index"></td><td>msg 1</td></tr><tr><td class="index"></td><td>msg 2</td></tr><tr><td class="index"></td><td>msg 3</td></tr><tr><td class="index"></td><td>msg 4</td></tr><tr><td class="index"></td><td>msg 5</td></tr></table>
      </div>
    </div>
  </div>
</div></div><div id="answer-19" class="answer-wrapper"><h2>undefined</h2>
<div data-answer-id="19" class="answer legacyAnswer selected hasComment ">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer">answer rich <img alt="math1" src="math.svg"> Text<br>Lorem ipsum<br><br><br></div>
    <div class="answerText answerRichText is_pregrading"><span class="answerAnnotation" data-index="0">answer rich </span><i class="fa fa-comment"></i><img alt="math1" src="math.svg"> Text<br>Lorem ipsum<br><br><br></div>
    <div class="answer-annotations">
      <div class="is_pregrading">
        <table class="annotation-messages"></table>
      </div>
    </div>
  </div>
</div></div><div id="answer-20" class="answer-wrapper"><h2>"before all" hook: everything doesn't break down on Firefox (manual test)</h2>
<div data-answer-id="20" class="answer legacyAnswer selected hasComment" style="display: flex; flex-direction: column">
  <div class="answer-text-container" style="position: relative; width: 100%">
    <div class="originalAnswer">Osaan tehtävistä liittyy aineistoa, jota on hyödynnettävä tehtävänannon mukaan. Lue tehtävät, silmäile aineistot läpi ja valitse tehtävistä yksi. <img src="sample_screenshot.jpg"> Tehtävät arvostellaan pistein 0–60. Kirjoita ehyt ja kielellisesti huoliteltu teksti. Sopiva pituus on 4–5 sivua. Tekstin tulee olla selvästi ja siististi kirjoitettu, mutta sitä ei tarvitse kirjoittaa puhtaaksi kuulakynällä tai musteella. Valmiit otsikot on lihavoitu. Muussa tapauksessa anna kirjoituksellesi oma otsikko. Merkitse kirjoitustehtävän numero otsikon eteen. Jos valitset aineistotehtävän, tekstisi pitää olla siten ehyt, että lukija voi ymmärtää tekstisi, vaikka ei tunnekaan aineistoa. Aineistotehtävissä tulee viitata aineistoon.</div>
    <div class="answerText answerRichText is_pregrading" style="position: relative; color: transparent; top: -2px">Osaan tehtävistä liittyy aineistoa, jota on hyödynnettävä tehtävänannon mukaan. Lue tehtävät, silmäile aineistot läpi ja valitse tehtävistä yksi. <span class="attachmentWrapper"><img src="sample_screenshot.jpg"><div class="answerAnnotation rect" data-message="msg" data-index="1" style="left: 25%; top: 25%; right: 25%; bottom: 25%;"><sup class="annotationMessageIndex"></sup></div></span><i class="fa fa-comment"></i> Tehtävät arvostellaan pistein 0–60. Kirjoita ehyt ja kielellisesti huoliteltu teksti. Sopiva pituus on 4–5 sivua. Tekstin tulee olla selvästi ja sii<span class="answerAnnotation" data-message="Huuhaata!" data-index="0">stisti kirjoitettu, mutta sitä ei tarvitse kirjoittaa puh<sup class="annotationMessageIndex"></sup></span><i class="fa fa-comment"></i>taaksi kuulakynällä tai musteella. Valmiit otsikot on lihavoitu. Muussa tapauksessa anna kirjoituksellesi oma otsikko. Merkitse kirjoitustehtävän numero otsikon eteen. Jos valitset aineistotehtävän, tekstisi pitää olla siten ehyt, että lukija voi ymmärtää tekstisi, vaikka ei tunnekaan aineistoa. Aineistotehtävissä tulee viitata aineistoon.</div>
    <div class="answerText answerRichText is_censor no-mouse" style="position: absolute; top: 0; left: 0">Osaan tehtävistä liittyy a<span class="answerAnnotation" data-message="Huuhaata2!" data-index="0">ineistoa, jota on hyödynnettävä tehtävänannon mukaan. Lue<sup class="annotationMessageIndex"></sup></span><i class="fa fa-comment"></i> tehtävät, silmäile aineistot läpi ja valitse tehtävistä yksi. <span class="attachmentWrapper"><img src="sample_screenshot.jpg"><div class="answerAnnotation rect" data-message="msg2" data-index="1" style="left: 20%; top: 20%; right: 60%; bottom: 60%;"><sup class="annotationMessageIndex"></sup></div></span><i class="fa fa-comment"></i> Tehtävät arvostellaan pistein 0–60. Kirjoita ehyt ja kielellisesti huoliteltu teksti. Sopiva pituus on 4–5 sivua. Tekstin tulee olla selvästi ja siististi kirjoitettu, mutta sitä ei tarvitse kirjoittaa puhtaaksi kuulakynällä tai musteella. Valmiit otsikot on lihavoitu. Muussa tapauksessa anna kirjoituksellesi oma otsikko. Merkitse kirjoitustehtävän numero otsikon eteen. Jos valitset aineistotehtävän, tekstisi pitää olla siten ehyt, että lukija voi ymmärtää tekstisi, vaikka ei tunnekaan aineistoa. Aineistotehtävissä tulee viitata aineistoon.</div>
  </div>
  <div class="answer-annotations">
    <div class="is_pregrading">
      <table class="annotation-messages"><tr><td class="index"></td><td>Huuhaata!</td></tr><tr><td class="index"></td><td>msg</td></tr></table>
    </div>
    <div class="is_censor">
      <table class="annotation-messages"><tr><td class="index"></td><td>Huuhaata2!</td></tr><tr><td class="index"></td><td>msg2</td></tr></table>
    </div>
  </div>
</div></div>`)
