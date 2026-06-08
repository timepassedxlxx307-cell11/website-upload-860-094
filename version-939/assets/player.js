(function () {
  function preparePlayer(wrapper) {
    var video = wrapper.querySelector('video');
    var button = wrapper.querySelector('.play-overlay');

    if (!video || !button) {
      return;
    }

    var streamUrl = video.getAttribute('data-stream-url');
    var started = false;
    var hls = null;

    function attachStream() {
      if (!streamUrl) {
        return;
      }

      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = streamUrl;
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true,
          backBufferLength: 90
        });
        hls.loadSource(streamUrl);
        hls.attachMedia(video);
        return;
      }

      video.src = streamUrl;
    }

    function startPlay() {
      if (!started) {
        started = true;
        attachStream();
      }

      button.classList.add('is-hidden');
      video.controls = true;

      var playResult = video.play();
      if (playResult && typeof playResult.catch === 'function') {
        playResult.catch(function () {
          video.controls = true;
        });
      }
    }

    button.addEventListener('click', startPlay);
    video.addEventListener('click', function () {
      if (!started) {
        startPlay();
      }
    });

    window.addEventListener('pagehide', function () {
      if (hls && typeof hls.destroy === 'function') {
        hls.destroy();
      }
    });
  }

  document.querySelectorAll('[data-player]').forEach(preparePlayer);
})();
