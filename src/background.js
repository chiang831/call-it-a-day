/* A chrome extension to limit work time. */
var playList = ["facebook", "youtube"];
var workList = ["google"];

/* TODO: let user set a desired value when this app is clicked.*/
var INIT_TIME_LEFT_SECS = 10;
var timeLeftSecs = INIT_TIME_LEFT_SECS;
var ALARM_NAME = 'Call it a day';

function getCurrentTabUrl(windowId, callback) {
  var queryInfo = {
    active: true,
    windowId: windowId
  };

  chrome.tabs.query(queryInfo, function(tabs) {
    var tab = tabs[0];
    var url = tab.url;

    if (typeof url == 'string') {
      callback(url);
    } else {
      console.error('url ' + url + ' should be a string');
    }
  });
}

function inList(list, url) {
  for (var idx = 0; idx < list.length; idx++) {
    if ( url.indexOf(list[idx]) > -1 )
      return true;
  }
  return false;
}

function stopAlarm(alarm) {
  timeLeftSecs = (alarm.scheduledTime - Date.now()) / 1000.0;
  chrome.alarms.clear(
      ALARM_NAME,
      function callback(wasCleared) {
        if (wasCleared) {
          console.log('Timer stopped');
        } else {
          console.error('Timer is not stopped');
        }
      }
  );
}

function checkAlarmAndStop() {
  chrome.alarms.get(
      ALARM_NAME,
      function callback(alarm) {
        if (alarm) {
          console.log('There is an alarm');
          stopAlarm(alarm);
        } else {
          console.log('No timer, just keep playing.');
        }
      }
  );
}

function playFlow() {
  checkAlarmAndStop();
}

function setAlarm() {
  var scheduledTime = Date.now() + timeLeftSecs * 1000;
  var alarmInfo = {'when': scheduledTime};
  console.log(
      'Set an alarm for ' + timeLeftSecs + ' seconds');
  chrome.alarms.create(ALARM_NAME, alarmInfo);
  console.log('Alarm set!');
}

function warningReallyShouldGoHome() {
  /* TODO decide what to do here. Post a dialog to user ?*/
  console.log('You really should go');
}

function checkAlarmAndSet() {
  chrome.alarms.get(
      ALARM_NAME,
      function callback(alarm) {
        if (alarm) {
          console.log('There is an alarm');
          console.log('No need to set');
        } else {
          console.log('No timer, start one.');
          setAlarm();
        }
      }
  );
}

function workFlow() {
  if ( timeLeftSecs > 0 ) {
    checkAlarmAndSet();
  } else {
    warningReallyShouldGoHome();
  }
}

function isWork(url) {
  if (inList(workList, url)) {
    console.log('This url is in work list');
    return true;
  } else if (inList(playList, url)) {
    console.log('This url is in play list');
    return false;
  } else {
    /* TODO: apply classifier to handle this. */
    console.log('Need user set play/work');
    console.log('Assume play');
    return false;
  }
}

function startUrl(url) {
  console.log('Looking at url ' + url);
  if ( isWork(url) ) {
    workFlow();
  } else {
    playFlow();
  }
}

function warningGoHome() {
  hour = INIT_TIME_LEFT_SECS / 3600.0;
  hour = hour.toPrecision(3);
  alert('You have worked for ' + hour + 'hours! ' +
        'Time to go home!');
  console.log('You have worked for ' + hour + 'hours! ' +
              'Time to go home!');
}

function handleTab(tab){
  /* Only cares active tab. */
  if ( !tab.active ) {
    return;
  }
  if (tab.url) {
    console.log('tab url is ' + tab.url);
    startUrl(tab.url);
  } else {
    console.error('url not available');
  }
}

/*
   This is called when
   1. An url in a tab is entered.
   2. Reload a tab.
   3. A new tab is created.
   4. A new tabe is created and the url is entered.

*/
chrome.tabs.onUpdated.addListener(
    function(tabId, changeInfo, tab) {
      console.log('A page is updated!');
      if ( changeInfo.status == 'complete' ) {
        console.log('This page is loaded');
        handleTab(tab);
      }
    }
);

/*
   This is called when
   1. A tab is selected.
   2. A new tab is created.
   3. A new tab is created and the url is entered.

   Case 3 sometimes does not work. So use onUpdated to handle
   case 3.
*/
chrome.tabs.onActivated.addListener(
    function(info) {
      console.log('A page is activated!');
      chrome.tabs.get(
          info.tabId,
          handleTab
      );
    }
);

/* Only set one callback here */
chrome.alarms.onAlarm.addListener(
    function callback(alarm) {
      console.log('Alarm!');
        if ( alarm.name == ALARM_NAME ) {
          timeLeftSecs = 0;
          warningGoHome();
        }
    }
);
