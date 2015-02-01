/* Control callback of popup.html. */

chrome.runtime.getBackgroundPage(
    function(backgroundWindow) {
      document.getElementById('start-button').onclick = backgroundWindow.startADay;
    }
);
