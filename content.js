// This runs as soon as the page DOM is ready on any matching website.
console.log("Log Extension: Content script loaded on this page.");

// Create a log object.
const logPayload = {
  type: "pageLoadLog",
  url: window.location.href,
  title: document.title,
  timestamp: new Date().toISOString()
};

// Send this data to the background script for logging.
// This is a "fire and forget" message; we don't wait for a response.
chrome.runtime.sendMessage({
  action: "logData",
  data: logPayload
});
