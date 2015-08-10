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
      if (message.length > 0) setTimeout(addLetter, t)
      else {
        d.resolve(el)
      }
    })()
    return d.promise
  }


  $.fn.extend({
    doit : function() {
      return this.each(function(){
        $(this).width($(this).width())
        var h1s = $(this).find('h1').hide().toArray();
        (function doH1 () {
          if (h1s.length > 0) {
            var h1 = h1s.shift()
            if ($(h1).data('audio')) {
              var url = $(h1).data('audio')
              soundManager.createSound({
                id : url, 
                url : url,
                autoPlay: true,
                onplay : function () {
                  typeIn(h1).then(doH1)
                }
              })
            } else {
              typeIn(h1).then(doH1)
            }
          }
        })()
      });
    }
  });


  soundManager.setup({
    url : '/audio/swf/',
    onready : function () {
      $('#slider').cycle({
        fx: "none",
        slides: "div.section",
        next: ".next",
        timeout: 0,
        log: false,
        swipe: true
      });
      $('.morse').each(function () {
        $(this).text(morse.translate($(this).text()))
      })
      $('.cover').fadeOut('slow', function () { $('.section:eq(1)').doit() })
    }
  })


  $('#slider').imagesLoaded( function() {
    $('.preloader .loader').hide();
    $('.preloader .loaded').show();
  });


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

    $( '#slider' ).on( 'cycle-before', function(event, optionHash, outgoingSlideEl, incomingSlideEl, forwardFlag) {
			$(incomingSlideEl).doit()
		});

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

