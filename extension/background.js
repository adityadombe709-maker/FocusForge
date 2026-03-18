//stores timer's tab id
let timerTabId = null;

//restore timerTabId from storage when the service worker starts (MV3 workers can be terminated and restarted)
//only restore if registerTimer hasn't already set it (avoids overwriting a freshly registered tab)
chrome.storage.session.get(["timerTabId"], (result) => {
  if (result.timerTabId && timerTabId === null) {
    timerTabId = result.timerTabId;
    console.log("Restored timerTabId from storage:", timerTabId);
  }
});

//listen for timer to register
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "registerTimer") {
    //remember timer's tab and persist it so it survives service worker restarts
    timerTabId = sender.tab.id;
    chrome.storage.session.set({ timerTabId: timerTabId });
    console.log("Timer registered in tab: ", timerTabId);
  }
});

//clear timerTabId if the timer tab is closed
chrome.tabs.onRemoved.addListener((tabId) => {
  if (tabId === timerTabId) {
    timerTabId = null;
    chrome.storage.session.remove("timerTabId");
    console.log("Timer tab closed, cleared timerTabId");
  }
});

//listen for when the user switches to a different tab
chrome.tabs.onActivated.addListener((activeInfo) => {
  //get the tab that was just activated
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    // Check if tab.url exists and is a valid http/https URL
    if (!tab.url || (!tab.url.startsWith("http://") && !tab.url.startsWith("https://"))) {
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
      } else if (whitelist.length > 0 && !isWhitelisted) {
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
