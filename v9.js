(function () {
  document.body.style.setProperty("height", "auto"); // needed for scrollTop to show correct value

  var embeds = document.querySelectorAll(`.btm-embed`);
  window._btmEmbedIds = [];
  Array.prototype.forEach.call(embeds, function (el, i) {
    // console.log(`campaign`, el.dataset.campaign)
    console.log(el.dataset, "DATASET");

    window.btmEmbedConfig = {};
    window.btmEmbedConfig.offsetTop = el.dataset.offsettop || 140;

    if (el.dataset.campaign) {
      var host = el.dataset.host || "https://www.dailybreak.com";
      var embedUrl = `${host}/embed/${el.dataset.campaign}/`;
      var thisUrl = window.location.href;

      // pass along querystring parameters, like utm codes
      var urlSplit = thisUrl.split("?");
      if (urlSplit.length == 2) {
        embedUrl += "?" + urlSplit[1];
      }

      var wrapper = document.createElement("div");

      var iframe = document.createElement("iframe");
      iframe.style.display = "block";
      iframe.style.width = "100%";
      // iframe.style.height = "8416px";  // initial height. When break loads this will get overridden.
      iframe.style.height = "100vh"; // initial height. When break loads this will get overridden.
      iframe.style.border = 0;
      iframe.src = embedUrl;
      iframe.id = `btmIframe${i}`;
      iframe.className = "btm-iframe";

      window._btmEmbedIds.push(iframe.id);

      wrapper.appendChild(iframe);

      el.replaceWith(wrapper);
    }
  });

  setInterval(
    function () {
      try {
        var iframes = document.querySelectorAll(`.btm-iframe`);
        Array.prototype.forEach.call(iframes, function (iframe, i) {
          if (document.getElementById(iframe.id)) {
            document.getElementById(iframe.id).contentWindow.postMessage(
              {
                type: "PARENT_CONFIG",
                value: {
                  height: window.innerHeight,
                },
              },
              "*"
            );
          }
        });
      } catch (e) {}
    }.bind(this),
    500
  );

  function callForAllIframes(fn) {
    if (!window.btmiframes) {
      window.btmiframes = document.querySelectorAll(`.btm-iframe`);
    }
    Array.prototype.forEach.call(window.btmiframes, function (iframe, i) {
      fn(iframe);
    });
  }

  function handleScroll(type) {
    callForAllIframes(function (iframe) {
      document
        .getElementById(iframe.id)
        .contentWindow.postMessage(
          { type: "PARENT_SCROLL", value: { scrolling: type === "start" } },
          "*"
        );
    });
  }

  function debounce(func, wait, immediate) {
    let timeout;
    return function () {
      const context = this,
        args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  }

  const debounceScrollStop = debounce(() => handleScroll("stop"), 100);

  window.addEventListener("message", function (message) {
    if (message.data.type === "RESIZE_INTERVAL") {
      var iframes = document.querySelectorAll(`.btm-iframe`);
      Array.prototype.forEach.call(iframes, function (iframe, i) {
        iframe.style.height = message.data.value + "px";
      });
    }
  });
  window.addEventListener("scroll", function () {
    handleScroll("start");
    debounceScrollStop();
  });
})();
