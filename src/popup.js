/* Control callback of popup.html. */

/* Gets the work hour set by user and call startADay in background page. */
function callbackClickGo() {
  workHours= parseFloat(document.getElementById('text-work-hours').value);
  console.log('Set work hour today is ' + workHours + ' hours');
  chrome.runtime.getBackgroundPage(
      function(backgroundWindow) {
        backgroundWindow.startADay(workHours);
      }
  );
}

/* Sets callback onload after start-button is loaded.*/
function setUp() {
  document.getElementById('start-button').onclick = callbackClickGo;
}

window.onload = setUp;
