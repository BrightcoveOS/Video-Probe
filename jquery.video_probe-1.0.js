/**
 * Copyright 2012, Brightcove
 * Author: David LaPalomento
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
      return this.each(function(_, video) {
        var
          $video = $(video),
          logger = overlayLogger($video);
        $video = logger.$video || $video;
        $.each(events, function(i, e) {
          $video.bind(e, function(event) {
            logger.logEvent(event);
            logger.logNetState($video);
            logger.logReadyState($video);
          });
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
        $overlay,
        $net,
        $ready,
        $events,
        $container;
      if ($('#video_probe-styles').size() < 1) {
        $(document.body)
          .append('<style id="video_probe-styles">' +
                  '.video_probe-container { ' +
                  'position: relative;' +
                  ' } ' +
                  '.video_probe-status { ' +
                  'border: 3px solid #555;' +
                  'border-radius: 5px;' + 
                  'background-color: white;' + 
                  'position: absolute;' +
                  'top: 3px;' +
                  'left: 3px;' +
                  'font-size: 16px;' +
                  'color: #333;' +
                  'font-family: Lucida Sans Unicode, Lucida Grande, sans-serif;' +
                  'padding: 3px;' +
                  'width: 150px;' +
                  'opacity:0.7;' +
                  ' } ' +
                  '.video_probe-status label { ' +
                  'display:block;' + 
                  ' } ' +
                  '.video_probe-events { ' +
                  'border-top: 2px solid #555;' +
                  'padding: 3px 0 0 0;' +
                  'margin: 3px 0;' +
                  'list-style-type: none;' + 
                  '-webkit-mask-image: -webkit-linear-gradient(bottom, rgba(0,0,0,0) 0px, rgba(0,0,0,1) 25px);' +
                  ' } ' +
                 '</style>');
      }
      // bug makes jQuery.wrap unusable with video on ios
      $container = $('<div class="video_probe-container" />');
      $container.html($video[0].outerHTML);
      $video[0].parentNode.replaceChild($container[0], $video[0]);
      $video = $container.children().eq(0);
      $overlay = $('<div class="video_probe-status">' +
                    '<label>net: <span></span></label>' +
                    '<label>ready: <span></span></label>' +
                    '<ol class="video_probe video_probe-events"><li>init<li></ol>' +
                    '</div>')
        .insertAfter($video);
      $net = $overlay.children().eq(0);
      $ready = $overlay.children().eq(1);
      $events = $overlay.children().eq(2);
        
      return {
        $video: $video,
        logEvent: function(event) {
          var
            $children = $events.children(':not(.video_probe-leaving)'),
            $newestEvent = $children.first(),
            count = $children.size(),
            data = $newestEvent.data('video_probe') || {};
          if (data.type === event.type) {
            // repeated event
            data.count++;
            $newestEvent.text('(' + data.count + ') ' + event.type);
            return;
          }
          if (count > maxEvents) {
            $children.last()
              .addClass('video_probe-leaving')
              .slideDown('fast', function() {
                $(this).remove();
              });
          }
          $('<li>' + event.type + '</li>')
            .hide()
            .data('video_probe', { type: event.type, count: 1 })
            .prependTo($events)
            .slideDown('fast');
        },
        logNetState: function($video) {
          $net.children().text(networkStates[$video[0].networkState]);
        },
        logReadyState: function($video) {
          $ready.children().text(readyStates[$video[0].readyState]);
        }
      };
    };
  })();
  
  $.extend($.fn, {
    video_probe: video_probe
  });
})(window, window.jQuery);