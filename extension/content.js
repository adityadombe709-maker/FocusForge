//telling background script i am the timer
chrome.runtime.sendMessage({
  action: "registerTimer",
});

//listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "updateTimerStatus") {
    //method to send data from content script to react component
    window.postMessage({
      type: "FROM_EXTENSION",
      shouldPause: request.shouldPause,
      currentDomain: request.currentDomain,
    });
  }
});
