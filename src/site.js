const imagesLoaded = require('imagesLoaded')
const morse = new (require('morsecode'))()
const soundManager = require('./soundmanager2.js').soundManager
const Q = require('q')
const R = require('ramda')

// clean up morseCode
morse.theCode = R.mapObj(R.replace(/ /g, ''), morse.theCode)

$(function () {

  function getEl (el) {
    return $(el).find('.pad')[0] || el
  }

  let typeTout
  function typeIn (el) {
    $(el).show()
    clearTimeout(typeTout)

    let t = $(el).data('speed') || ($(el).is('.morse') ? 80 : 200)
    t = parseInt(t, 10)
    let d = Q.defer()
    let message = $(el).data('typed').split('')
    let theEl = getEl(el) 

    $(theEl).text('');
    (function addLetter () {
      $(theEl).append(message.shift())
      if (message.length > 0) { 
        typeTout = setTimeout(addLetter, t) 
      } else {
        d.resolve(el)
      }
    })()
    return d.promise
  }

  let currentSound = false
  function doAudio (h1) {
    let d = Q.defer()
    let sound

    if (currentSound) currentSound.stop()

    if ($(h1).data('sound')) {
      sound = $(h1).data('sound')
      sound.play()
      d.resolve(h1)

    } else if ($(h1).data('audio')) {
      let url = $(h1).data('audio')
      sound = soundManager.createSound({
        id : url, 
        url : url,
        autoPlay: true,
        volume : /morse/.test(url) ? 2 : 70,
        onplay : function () {
          d.resolve(h1)
        }
      })
      $(h1).data('sound', sound)
    } else {
      d.resolve(h1)
    }
    currentSound = sound
    return d.promise
  }

  function doSlider () {
    $('#slider').cycle({
      fx: "scrollHorz",
      slides: "div.section",
      next: ".next",
      timeout: 0,
      log: false,
      swipe: true
    });
  }

  $.fn.extend({
    doit : function() {
      return this.each(function(){

        $(this).width($(this).width())

        var h1s = $(this).find('h1.typed').hide().toArray()
        ;(function doH1 () {
          if (h1s.length > 0) {
            var h1 = h1s.shift()
            doAudio(h1)
            .then(typeIn)
            .then(doH1)
          }
        })()
      });
    }
  });


  $('#slider').imagesLoaded( function() {
    $('.preloader .loader').hide()
    $('.loaded').show()
    soundManager.setup({
      url : '/audio/swf/',
      onready : function () {
        $('.cover').fadeOut('slow')
        doSlider()
      }
    })
  });


  $(document.documentElement).keyup(function (e) {
    if (e.keyCode == 39) {        
     $('#slider').cycle('next')
    }
    if (e.keyCode == 37) {
      $('#slider').cycle('prev')
    }
  })

  $( ".slide_next" ).click(function() {
    $('#slider').cycle('next')
  })
  $( ".slide_prev" ).click(function() {
    $('#slider').cycle('prev')
  })

  // init
  $('.morse').each(function () {
    $(this).text(morse.translate($(this).text()))
  })
  $('h1.typed').each(function () {
    $(this).data('typed', $(this).text()).text('')
  })
  $(this).find('h1.bottom').wrapInner("<div class='pad'></div>")

  let lastSlide = false
  $( '#slider' ).on( 'cycle-update-view', (event, optionHash, outgoingSlideEl, incomingSlideEl, forwardFlag) => {
    if ( lastSlide !== optionHash.currSlide) {
      $('#slider .cycle-slide-active.s-' + optionHash.currSlide ).doit()
      lastSlide = optionHash.currSlide
    }
  })

  function launchIntoFullscreen(element) {
    if(element.requestFullscreen) {
      element.requestFullscreen()
    } else if(element.mozRequestFullScreen) {
      element.mozRequestFullScreen()
    } else if(element.webkitRequestFullscreen) {
      element.webkitRequestFullscreen()
    } else if(element.msRequestFullscreen) {
      element.msRequestFullscreen()
    }
  }
  function exitFullscreen() {
    if(document.exitFullscreen) {
      document.exitFullscreen()
    } else if(document.mozCancelFullScreen) {
      document.mozCancelFullScreen()
    } else if(document.webkitExitFullscreen) {
      document.webkitExitFullscreen()
    }
  }

  $( ".slide_full" ).click(function() {
    if ( $( this ).hasClass( "active" ) ) {
      $(this).removeClass('active')
      exitFullscreen(document.documentElement)
    } else {
      $(this).addClass('active')
      launchIntoFullscreen(document.documentElement)
    }
    doSlider()
  })

})

