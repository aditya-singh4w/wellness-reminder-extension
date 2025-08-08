document.addEventListener("DOMContentLoaded", () => {
  const ids = ["water", "focus", "posture", "interval"];

  // Load and display current saved settings
  chrome.storage.sync.get(ids, (settings) => {
    ids.forEach(id => {
      if (settings[id] !== undefined) {
        document.getElementById(id).value = settings[id];
      }
    });
  });

  // Save settings on button click
  document.getElementById("save").addEventListener("click", () => {
    const newSettings = {};
    ids.forEach(id => {
      const value = document.getElementById(id).value;
      newSettings[id] = id === "interval" ? parseInt(value, 10) : value;
    });

    chrome.storage.sync.set(newSettings, () => {
      chrome.runtime.sendMessage({
        type: "rescheduleAlarms",
        interval: newSettings.interval
      }, () => {
        alert("Settings saved!");
      });
    });
  });
});
