const defaultSettings = {
  water: "Time to drink water!",
  focus: "Stay focused on your task!",
  posture: "Fix your posture!",
  interval: 60
};

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.sync.set(defaultSettings);
  scheduleAlarms(defaultSettings.interval);
});

chrome.alarms.onAlarm.addListener((alarm) => {
  chrome.storage.sync.get(["water", "focus", "posture"], (settings) => {
    const message = settings[alarm.name];
    if (message) {
      chrome.notifications.create({
        type: "basic",
        iconUrl: "icon.png",
        title: "Reminder",
        message
      });
    }
  });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === "rescheduleAlarms") {
    scheduleAlarms(message.interval);
    sendResponse({ status: "ok" });
  }
});

function scheduleAlarms(interval) {
  chrome.alarms.clearAll(() => {
    ["water", "focus", "posture"].forEach(name => {
      chrome.alarms.create(name, { periodInMinutes: interval });
    });
  });
}
