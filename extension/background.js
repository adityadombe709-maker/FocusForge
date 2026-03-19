//store timer tab id
let timerTabId = null;

//timer alerts extension
chrome.runtime.onMessage.addListener((request, sender) => {
  if (request.action === "registerTimer" && sender.tab?.id) {
    timerTabId = sender.tab.id;
    console.log("Timer registered in tab: ", timerTabId);
  }
});

function evaluateAndSendForTab(tab) {
  if (!tab?.url) return;
  if (!tab.url.startsWith("http://") && !tab.url.startsWith("https://")) return;

  const domain = new URL(tab.url).hostname;

  const isTimerApp =
    (tab.url.includes("localhost") || tab.url.includes("127.0.0.1")) &&
    tab.url.includes("/dashboard");

  // Never pause while user is on the timer app tab.
  if (isTimerApp) {
    timerTabId = tab.id;
    if (timerTabId) {
      chrome.tabs.sendMessage(timerTabId, {
        action: "updateTimerStatus",
        shouldPause: false,
        currentDomain: domain,
      });
    }
    return;
  }

  chrome.storage.sync.get(["whitelist", "blacklist"], (result) => {
    const whitelist = result.whitelist || [];
    const blacklist = result.blacklist || [];

    const isBlacklisted = blacklist.some((item) => domain.includes(item));
    const isWhitelisted = whitelist.some((item) => domain.includes(item));

    let shouldPauseTimer = false;

    if (blacklist.length > 0 && isBlacklisted) {
      shouldPauseTimer = true;
    } else if (whitelist.length > 0 && !isWhitelisted) {
      shouldPauseTimer = true;
    }

    if (timerTabId) {
      chrome.tabs.sendMessage(timerTabId, {
        action: "updateTimerStatus",
        shouldPause: shouldPauseTimer,
        currentDomain: domain,
      });
    }
  });
}

//tab switched
chrome.tabs.onActivated.addListener((activeInfo) => {
  chrome.tabs.get(activeInfo.tabId, (tab) => {
    evaluateAndSendForTab(tab);
  });
});

//new tab typed URL / navigation in the same tab
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab.active) return;
  if (changeInfo.url || changeInfo.status === "complete") {
    evaluateAndSendForTab(tab);
  }
});

//evaluate current tab immediately if blacklist/whitelist changes
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") return;
  if (!changes.whitelist && !changes.blacklist) return;

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs.length > 0) {
      evaluateAndSendForTab(tabs[0]);
    }
  });
});
