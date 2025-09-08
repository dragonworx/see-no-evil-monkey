// This runs as soon as the page DOM is ready on any matching website.
console.log("🙈");

// Create a log object.
const logPayload = {
  date: new Date().toLocaleDateString(),
  time: new Date().toLocaleTimeString(),
  type: 1,
  url: window.location.href,
  title: document.title,
  timestamp: new Date().toLocaleDateString()
};

// Send this data to the background script for logging.
// This is a "fire and forget" message; we don't wait for a response.
chrome.runtime.sendMessage({
  action: "logData",
  data: logPayload
});
