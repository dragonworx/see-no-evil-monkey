/**
 * --- Reusable Log Function ---
 * A single, asynchronous function to handle all POST requests to the local server.
 * This prevents duplicating fetch code.
 */
async function logToServer(payload) {
  try {
    const response = await fetch("http://localhost:8888/log", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();
    console.log("Server response:", data);
  } catch (error) {
    // This will catch errors if the server is not running.
    console.error("Error logging to server:", error.message);
  }
}


/**
 * --- LISTENER 1: Log on Page Load ---
 * This listens for the message from content.js (sent above) when a new
 * page finishes loading.
 */
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  // Check that this is the message we expect
  if (message.action === "logData") {
    console.log("Logging from CONTENT SCRIPT (Page Load):", message.data.url);
    logToServer(message.data); // Use our reusable function

    // Return true to indicate that this will respond asynchronously.
    // This is required even if we don't send a response,
    // to keep the message port open until the async logToServer call completes.
    return true;
  }
});


/**
 * --- LISTENER 2: Log on Tab Activation ---
 * This listens for the user clicking on a different tab in any window.
 * This requires the "tabs" permission in the manifest.
 */
chrome.tabs.onActivated.addListener(async (activeInfo) => {
  // activeInfo just gives us { tabId, windowId }
  const tabId = activeInfo.tabId;

  try {
    // We must call tabs.get() to retrieve the tab's details, like its URL
    const tab = await chrome.tabs.get(tabId);

    // We only want to log real webpages, not internal "chrome://" pages or blank new tabs
    if (tab && tab.url && (tab.url.startsWith("http:") || tab.url.startsWith("https:")) ) {

      const logPayload = {
        type: "tabActivatedLog",
        url: tab.url,
        title: tab.title,
        timestamp: new Date().toISOString()
      };

      console.log("Logging from TABS API (Tab Switch):", logPayload.url);
      logToServer(logPayload); // Use our same reusable function

    } else {
      console.log("Ignoring tab switch to non-webpage:", tab.url || 'N/A');
    }
  } catch (error) {
    // This often fails harmlessly for protected system pages (like chrome://extensions)
    // where we aren't allowed to get the tab details. We can safely ignore this.
    console.warn(`Could not get tab info: ${error.message}`);
  }
});