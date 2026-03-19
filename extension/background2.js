//stores timer's tab id
let timerTabId = null;

//listen for timer to register
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "registerTimer") {
    //remember timer's tab
    timerTabId = sender.tab.id;
    console.log("Timer registered in tab: ", timerTabId);
  }
});

//listen for new tabs being created
chrome.tabs.onCreated.addListener((tab) => {
  if (
    tab.active &&
    tab.url &&
    (tab.url.startsWith("http://") || tab.url.startsWith("https://"))
  ) {
    evaluateAndSendForTab(tab);
  }
});

//listen for when the user switches to a different tab
chrome.tabs.onActivated.addListener((activeInfo) => {
  //get the tab that was just activated
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    // Check if tab.url exists and is a valid http/https URL
    if (
      !tab.url ||
      (!tab.url.startsWith("http://") && !tab.url.startsWith("https://"))
    ) {
      // Not a normal web page, skip processing
      return;
    }
    //extract the domain from the tab's URL
    const url = new URL(tab.url);
    const domain = url.hostname;

    //get the whitelist and blacklist from storage
    chrome.storage.sync.get(["whitelist", "blacklist"], (result) => {
      const whitelist = result.whitelist || [];
      const blacklist = result.blacklist || [];

      //check if the domain is blacklisted
      const isBlacklisted = blacklist.some((item) => {
        return domain.includes(item);
      });

      //check if domain is whitelisted
      const isWhitelisted = whitelist.some((item) => {
        return domain.includes(item);
      });

      //variable determining if the timer should pause
      let shouldPauseTimer = false;

      if (blacklist.length > 0 && isBlacklisted) {
        shouldPauseTimer = true;
      } else if (whitelist.length > 0 && isWhitelisted) {
        shouldPauseTimer = false;
      } else {
        shouldPauseTimer = true;
      }

      //send message to timer
      if (timerTabId) {
        chrome.tabs.sendMessage(timerTabId, {
          action: "updateTimerStatus",
          shouldPause: shouldPauseTimer,
          currentDomain: domain,
        });
      }
    });
  });
});
