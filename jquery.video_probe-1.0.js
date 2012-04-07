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
      'NETWORK_EMPTY',
      'NETWORK_IDLE',
      'NETWORK_LOADING',
      'NETWORK_NO_SOURCE'
    ],
    readyStates = [
      'HAVE_NOTHING',
      'HAVE_METADATA',
      'HAVE_CURRENT_DATA',
      'HAVE_FUTURE_DATA',
      'HAVE_ENOUGH_DATA'
    ],
    readyLabels 
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
          .after('<style id="video_probe-styles">' +
                 '.video_probe-net { ' +
                 'font-size: 18px;' +
                 ' } ' +
                 '.video_probe-ready { ' +
                 'font-size: 18px;' +
                 ' } ' +
                 '.video_probe-events { ' +
                 'font-size: 18px;' +
                 ' }' +
                 '</style>');
      }
      $overlay = $('<div class="video_probe-net">net state</div>' +
                   '<div class="video_probe-ready">ready state</div>' +
                   '<ol class="video_probe-events"><li>event</li><li>event</li></ol>')
        .insertAfter($video),
      $net = $overlay.eq(0)
        .css({
          position: 'absolute',
          bottom: $video.height(),
          left: $video.offset().left,
          width: desiredWidth,
          'min-width': '100px'
        });
      $ready = $overlay.eq(1)
        .css({
          position: 'absolute',
          bottom: $video.height(),
          left: $net.offset().left + $net.width(),
          width: desiredWidth,
          'min-width': '100px'
        });
      $events = $overlay.eq(2)
        .css({
          position: 'absolute',
          bottom: $video.height(),
          left: $ready.offset().left + $ready.width(),
          width: desiredWidth,
          'min-width': '100px'
        });
        
      console.log($overlay);
      return {
        logEvent: function(event) {
          var
            $children = $events.children(),
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
            $children.first().remove();
          }
          $('<li>' + event.type + '</li>')
            .data('video_probe', { type: event.type, count: 0 })
            .appendTo($events);
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