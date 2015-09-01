var imagesLoaded = require('imagesLoaded')
var morse = new (require('morsecode'))()
var soundManager = require('./soundmanager2.js').soundManager
var Q = require('q')
var R = require('ramda')

$(function () {

  function typeIn (el) {
    var t = $(el).is('.morse') ? 80 : 200
    var d = Q.defer()
    var message = $(el).text().split('')
    $(el).show()
    $(el).text('');
    (function addLetter () {
      $(el).append(message.shift())
        console.log($(el))
      if (message.length > 0) setTimeout(addLetter, t)
      else {
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
        volume : 50,
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


  soundManager.setup({
    url : '/audio/swf/',
    onready : function () {
      $('#slider').cycle({
        fx: "scrollHorz",
        slides: "div.section",
        next: ".next",
        timeout: 0,
        log: false,
        swipe: true
      });
      $('.morse').each(function () {
        $(this).text(morse.translate($(this).text()))
      })
      $('.cover').fadeOut('slow')
    }
  })


  $('#slider').imagesLoaded( function() {
    $('.preloader .loader').hide();
    $('.preloader .loaded').show();
  });

  $(this).find('h1.bottom').wrapInner("<div class='pad'></div>")

  $(document.documentElement).keyup(function (e) {
      if (e.keyCode == 39) {        
         $('#slider').cycle('next');
      }

      if (e.keyCode == 37) {
          $('#slider').cycle('prev');
      }
  });

  $( ".slide_next" ).click(function() {
       		$('#slider').cycle('next');
		});
		$( ".slide_prev" ).click(function() {
       		$('#slider').cycle('prev');
		});

    let lastSlide = false
    $( '#slider' ).on( 'cycle-update-view', (event, optionHash, outgoingSlideEl, incomingSlideEl, forwardFlag) => {
      if ( lastSlide !== optionHash.currSlide) {
        $('#slider .cycle-slide-active.s-' + optionHash.currSlide ).doit()
        lastSlide = optionHash.currSlide
      }
      console.log(optionHash)
    } );

    function launchIntoFullscreen(element) {
		  if(element.requestFullscreen) {
		    element.requestFullscreen();
		  } else if(element.mozRequestFullScreen) {
		    element.mozRequestFullScreen();
		  } else if(element.webkitRequestFullscreen) {
		    element.webkitRequestFullscreen();
		  } else if(element.msRequestFullscreen) {
		    element.msRequestFullscreen();
		  }
		}
		function exitFullscreen() {
		  if(document.exitFullscreen) {
		    document.exitFullscreen();
		  } else if(document.mozCancelFullScreen) {
		    document.mozCancelFullScreen();
		  } else if(document.webkitExitFullscreen) {
		    document.webkitExitFullscreen();
		  }
		}

		$( ".slide_full" ).click(function() {

	    if ( $( this ).hasClass( "active" ) ) {

				$(this).removeClass('active');
				exitFullscreen(document.documentElement);

	    } else {
				
				$(this).addClass('active');
				launchIntoFullscreen(document.documentElement);

	    }

		});
  
  

})

