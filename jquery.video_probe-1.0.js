/**
 * 2012, David LaPalomento
 */
(function(window, $, undefined) {
  var
    events = [
      'loadstart',
      'progress',
      'suspend',
      'abort',
      'error',
      'emptied',
      'stalled',
      'loadedmetadata',
      'loadeddata',
      'canplay',
      'canplaythrough',
      'playing',
      'waiting',
      'seeking',
      'seeked',
      'ended',
      'durationchange',
      'timeupdate',
      'play',
      'pause',
      'ratechange',
      'volumechange'
    ],
    networkStates = [
      'empty',
      'idle',
      'loading',
      'no-source'
    ],
    readyStates = [
      'nothing',
      'metadata',
      'current',
      'future',
      'enough'
    ],
    consoleLogger,
    overlayLogger,
    video_probe = function() {
      var
        $video = this,
        logger = overlayLogger($video);
      $.each(events, function(i, e) {
        $video.bind(e, function(event) {
          logger.logEvent(event);
          logger.logNetState($video);
          logger.logReadyState($video);
        });
      });
    };

  (function() {
    var logger = {
      logEvent: function(event) {
        console.log(event.type);
      },
      logNetState: function($video) {
        console.log(networkStates[$video[0].networkState]);
      },
      logReadyState: function($video) {
        console.log(readyStates[$video[0].readyState]);
      }
    };
    consoleLogger = function(_) {
      return logger;
    };
  })();

  (function() {
    overlayLogger = function($video) {
      var
        maxEvents = 5,
        desiredWidth = ($video.width() * 0.15) + 'px',
        $styles = $('#video_probe-styles'),
        $overlay,
        $net,
        $ready,
        $events;
      if ($styles.size() < 1) {
        $(document.body)
          .append('<style id="video_probe-styles">' +
                  '.video_probe { ' +
                  'font-size: 16px;' +
                  'position: absolute;' +
                  'min-width: 100px;' +
                  'list-style-type: none;' +
                  'color: white;' +
                  'text-shadow: black 2px 2px 2px;' +
                  'margin: 0;' +
                  'padding: 3px;' +
                  'font-family: Lucida Sans Unicode, Lucida Grande, sans-serif;' +
                  ' } ' +
                  '.video_probe-events { ' +
                  'list-style-type: none;' + 
                  'min-width: 135px;' +
                  '-webkit-mask-image: -webkit-linear-gradient(top, rgba(0,0,0,0) 0px, rgba(0,0,0,1) 25px);' +
                  ' } ' +
                 '</style>');
      }
      $overlay = $('<div class="video_probe video_probe-net" />' +
                   '<div class="video_probe video_probe-ready" />' +
                   '<ol class="video_probe video_probe-events"><li>init<li></ol>')
        .insertAfter($video),
      $net = $overlay.eq(0)
        .css({
          bottom: $video.height(),
          left: $video.offset().left,
          width: desiredWidth
        });
      $ready = $overlay.eq(1)
        .css({
          bottom: $video.height(),
          left: $net.offset().left + $net.width(),
          width: desiredWidth
        });
      $events = $overlay.eq(2)
        .css({
          bottom: $video.height(),
          left: $ready.offset().left + $ready.width(),
          width: desiredWidth
        });
        
      console.log($overlay);
      return {
        logEvent: function(event) {
          var
            $children = $events.children(':not(.video_probe-leaving)'),
            $lastEvent = $children.last(),
            count = $children.size(),
            data = $lastEvent.data('video_probe') || {};
          if (data.type === event.type) {
            // repeated event
            data.count++;
            $lastEvent.text('(' + data.count + ') ' + event.type);
            return;
          }
          if (count > maxEvents) {
            $children.first()
              .addClass('video_probe-leaving')
              .slideUp('fast', function() {
                $(this).remove();
              });
          }
          $('<li>' + event.type + '</li>')
            .hide()
            .data('video_probe', { type: event.type, count: 1 })
            .appendTo($events)
            .slideDown('fast');
        },
        logNetState: function($video) {
          $net.text(networkStates[$video[0].networkState]);
        },
        logReadyState: function($video) {
          $ready.text(readyStates[$video[0].readyState]);
        }
      };
    };
  })();
  
  $.extend($.fn, {
    video_probe: video_probe
  });
})(window, window.jQuery);