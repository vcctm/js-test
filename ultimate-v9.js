(function () {
  document.body.style.setProperty("height", "auto"); // needed for scrollTop to show correct value

  var embeds = document.querySelectorAll(`.btm-embed`);
  window._btmEmbedIds = [];
  Array.prototype.forEach.call(embeds, function (el, i) {
    if (el.dataset.campaign) {
      var host = el.dataset.host || "https://www.dailybreak.com";
      var embedUrl = `${host}/embed/${el.dataset.campaign}/`;
      var thisUrl = window.location.href;

      var urlSplit = thisUrl.split("?");
      if (urlSplit.length == 2) {
        embedUrl += "?" + urlSplit[1];
      }

      var wrapper = document.createElement("div");

      var iframe = document.createElement("iframe");
      iframe.style.display = "block";
      iframe.style.width = "100%";
      iframe.style.height = "100vh";
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
        var navElement = document.querySelector("nav");
        var iframes = document.querySelectorAll(`.btm-iframe`);
        Array.prototype.forEach.call(iframes, function (iframe, i) {
          if (document.getElementById(iframe.id)) {
            document.getElementById(iframe.id).contentWindow.postMessage(
              {
                type: "PARENT_CONFIG",
                value: {
                  height: window.innerHeight,
                  navHeight: navElement ? navElement.offsetHeight : 0,
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

  function handleScroll(type) {
    callForAllIframes(function (iframe) {
      var navHeight = document.querySelector("nav").offsetHeight;
      var iframeOffset = iframe.getBoundingClientRect();
      var navbar = document.querySelector("nav");
      var navbarOffset = navbar.getBoundingClientRect();

      var intersectionRatio = Math.min(
        1,
        (navbarOffset.bottom - iframeOffset.top) / navbar.offsetHeight
      );

      var navHeight = navbar.offsetHeight * intersectionRatio;
      document.getElementById(iframe.id).contentWindow.postMessage(
        {
          type: "PARENT_SCROLL",
          value: {
            navHeight: navbarOffset.bottom > iframeOffset.top ? navHeight : 0,
            scrolling: type === "start",
          },
        },
        "*"
      );
    });
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
