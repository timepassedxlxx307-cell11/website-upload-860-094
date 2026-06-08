(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
      return;
    }
    callback();
  }

  function readConfig() {
    var node = document.getElementById("movie-player-config");
    if (!node) {
      return null;
    }
    try {
      return JSON.parse(node.textContent || "{}");
    } catch (error) {
      return null;
    }
  }

  function setupPlayer() {
    var config = readConfig();
    var video = document.getElementById("movie-player");
    var overlay = document.querySelector("[data-player-overlay]");
    var status = document.querySelector("[data-player-status]");
    if (!config || !config.src || !video) {
      return;
    }
    var hlsInstance = null;
    var loaded = false;

    function showMessage(text) {
      if (status) {
        status.textContent = text;
      }
    }

    function loadSource() {
      if (loaded) {
        return Promise.resolve();
      }
      loaded = true;
      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = config.src;
        return Promise.resolve();
      }
      if (window.Hls && window.Hls.isSupported()) {
        hlsInstance = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hlsInstance.loadSource(config.src);
        hlsInstance.attachMedia(video);
        return Promise.resolve();
      }
      video.src = config.src;
      return Promise.resolve();
    }

    function play() {
      loadSource().then(function () {
        if (overlay) {
          overlay.classList.add("is-hidden");
        }
        var playPromise = video.play();
        if (playPromise && typeof playPromise.catch === "function") {
          playPromise.catch(function () {
            if (overlay) {
              overlay.classList.remove("is-hidden");
            }
          });
        }
      });
    }

    if (overlay) {
      overlay.addEventListener("click", play);
    }
    video.addEventListener("click", function () {
      if (!loaded || video.paused) {
        play();
      }
    });
    video.addEventListener("play", function () {
      if (overlay) {
        overlay.classList.add("is-hidden");
      }
    });
    video.addEventListener("error", function () {
      showMessage("播放加载失败，请稍后重试");
      if (overlay) {
        overlay.classList.remove("is-hidden");
      }
    });
    window.addEventListener("pagehide", function () {
      if (hlsInstance) {
        hlsInstance.destroy();
      }
    });
  }

  ready(setupPlayer);
})();
