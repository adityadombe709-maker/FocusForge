let hasRegisteredTimer = false;
let pingAttempts = 0;
const maxPingAttempts = 30;
let pingIntervalId = null;

function logContentEvent(event, details = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[FocusForge content] ${event} @ ${timestamp}`, details);
}

function stopPingHandshake() {
  if (pingIntervalId) {
    clearInterval(pingIntervalId);
    pingIntervalId = null;
  }
}

function startPingHandshake() {
  if (pingIntervalId) {
    return;
  }

  pingAttempts = 0;
  pingIntervalId = setInterval(() => {
    if (hasRegisteredTimer || pingAttempts >= maxPingAttempts) {
      stopPingHandshake();
      return;
    }

    pingAttempts += 1;
    window.postMessage({ type: "FOCUSFORGE_EXTENSION_PING" }, "*");
    logContentEvent("PING_TIMER_PAGE", { attempt: pingAttempts });
  }, 500);
}

function registerTimerTab() {
  if (hasRegisteredTimer) {
    return;
  }

  hasRegisteredTimer = true;
  stopPingHandshake();
  logContentEvent("REGISTER_TIMER_TAB");
  chrome.runtime.sendMessage({
    action: "registerTimer",
  });
}

// Register only when the FocusForge app explicitly signals readiness.
window.addEventListener("message", (event) => {
  if (event.source !== window) {
    return;
  }

  if (event.data?.type === "FOCUSFORGE_TIMER_READY") {
    logContentEvent("TIMER_READY_SIGNAL_RECEIVED");
    registerTimerTab();
  }
});

startPingHandshake();

//listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateTimerStatus") {
    logContentEvent("FORWARD_STATUS_TO_PAGE", {
      shouldPause: request.shouldPause,
      currentDomain: request.currentDomain,
    });
    //method to send data from content script to react component
    window.postMessage({
      type: "FROM_EXTENSION",
      shouldPause: request.shouldPause,
      currentDomain: request.currentDomain,
    });
  }
});
