//stores timer's tab id
let timerTabId = null;

function logBackgroundEvent(event, details = {}) {
  const timestamp = new Date().toISOString();
  console.log(`[FocusForge background] ${event} @ ${timestamp}`, details);
}

function normalizeDomain(value) {
  const trimmed = (value || "").toString().trim().toLowerCase();
  if (!trimmed) {
    return "";
  }

  let parsed;
  try {
    parsed = new URL(trimmed.includes("://") ? trimmed : `https://${trimmed}`);
  } catch {
    return "";
  }

  return parsed.hostname.replace(/^www\./, "");
}

function domainMatches(domain, rule) {
  if (!domain || !rule) {
    return false;
  }

  return domain === rule || domain.endsWith(`.${rule}`);
}

function isLikelyTimerTabUrl(rawUrl) {
  if (!rawUrl) {
    return false;
  }

  try {
    const parsed = new URL(rawUrl);
    const host = parsed.hostname;
    const isLocalHost = host === "localhost" || host === "127.0.0.1";
    if (!isLocalHost) {
      return false;
    }

    // Timer component is rendered on dashboard route.
    return parsed.pathname === "/dashboard";
  } catch {
    return false;
  }
}

function findTimerTab(callback) {
  chrome.tabs.query(
    {
      url: [
        "http://localhost/*",
        "http://127.0.0.1/*",
        "https://localhost/*",
        "https://127.0.0.1/*",
      ],
    },
    (tabs) => {
      if (!tabs || tabs.length === 0) {
        callback(null);
        return;
      }

      const timerTab = tabs.find((tab) => isLikelyTimerTabUrl(tab.url));
      callback(timerTab || null);
    },
  );
}

function dispatchStatusToTimerTab(tabId, shouldPause, currentDomain) {
  logBackgroundEvent("SEND_TIMER_STATUS", {
    timerTabId: tabId,
    shouldPause,
    currentDomain,
  });

  chrome.tabs.sendMessage(
    tabId,
    {
      action: "updateTimerStatus",
      shouldPause,
      currentDomain,
    },
    () => {
      if (chrome.runtime.lastError) {
        // Timer tab may have been closed or no content script is available.
        logBackgroundEvent("SEND_FAILED_CLEAR_TIMER_TAB", {
          timerTabId: tabId,
          error: chrome.runtime.lastError.message,
        });
        if (timerTabId === tabId) {
          timerTabId = null;
        }
      }
    },
  );
}

function sendTimerStatus(shouldPause, currentDomain) {
  if (!timerTabId) {
    findTimerTab((tab) => {
      if (!tab) {
        logBackgroundEvent("SKIP_SEND_NO_TIMER_TAB", {
          shouldPause,
          currentDomain,
        });
        return;
      }

      timerTabId = tab.id;
      logBackgroundEvent("TIMER_TAB_DISCOVERED", {
        timerTabId,
        timerTabUrl: tab.url,
      });
      dispatchStatusToTimerTab(timerTabId, shouldPause, currentDomain);
    });
    return;
  }

  dispatchStatusToTimerTab(timerTabId, shouldPause, currentDomain);
}

function evaluateAndSendForTab(tab) {
  if (!tab || !tab.url) {
    return;
  }

  if (!tab.url.startsWith("http://") && !tab.url.startsWith("https://")) {
    return;
  }

  let domain;
  try {
    domain = normalizeDomain(new URL(tab.url).hostname);
  } catch {
    return;
  }

  // The dashboard is the timer UI itself; never pause because of this tab.
  if (isLikelyTimerTabUrl(tab.url)) {
    if (!timerTabId && tab.id) {
      timerTabId = tab.id;
      logBackgroundEvent("TIMER_TAB_RESTORED_FROM_ACTIVE_TAB", {
        timerTabId,
        timerTabUrl: tab.url,
      });
    }
    sendTimerStatus(false, domain);
    return;
  }

  logBackgroundEvent("EVALUATE_ACTIVE_TAB", {
    activeTabId: tab.id,
    activeDomain: domain,
    timerTabId,
  });

  // Never pause while the user is on the timer app tab itself.
  if (timerTabId && tab.id === timerTabId) {
    sendTimerStatus(false, domain);
    return;
  }

  chrome.storage.sync.get(["whitelist", "blacklist"], (result) => {
    const whitelist = (result.whitelist || [])
      .map(normalizeDomain)
      .filter(Boolean);
    const blacklist = (result.blacklist || [])
      .map(normalizeDomain)
      .filter(Boolean);

    const isBlacklisted = blacklist.some((item) => domainMatches(domain, item));
    const isWhitelisted = whitelist.some((item) => domainMatches(domain, item));

    let shouldPauseTimer = false;

    if (blacklist.length > 0 && isBlacklisted) {
      shouldPauseTimer = true;
    } else if (whitelist.length > 0 && !isWhitelisted) {
      shouldPauseTimer = true;
    }

    logBackgroundEvent("DECISION", {
      domain,
      whitelist,
      blacklist,
      isWhitelisted,
      isBlacklisted,
      shouldPauseTimer,
    });

    sendTimerStatus(shouldPauseTimer, domain);
  });
}

//listen for timer to register
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === "registerTimer") {
    //remember timer's tab
    timerTabId = sender.tab.id;
    logBackgroundEvent("TIMER_REGISTERED", {
      timerTabId,
      senderUrl: sender.tab?.url,
    });

    // Evaluate the currently active tab immediately after registration.
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs && tabs.length > 0) {
        evaluateAndSendForTab(tabs[0]);
      }
    });
  }
});

//listen for when the user switches to a different tab
chrome.tabs.onActivated.addListener((activeInfo) => {
  //get the tab that was just activated
  chrome.tabs.get(activeInfo.tabId, evaluateAndSendForTab);
});

// Handle navigation changes in the currently active tab.
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
  if (!tab.active) {
    return;
  }

  if (changeInfo.status === "complete" || changeInfo.url) {
    evaluateAndSendForTab(tab);
  }
});

// Re-evaluate immediately when lists are changed from popup.
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName !== "sync") {
    return;
  }

  if (!changes.whitelist && !changes.blacklist) {
    return;
  }

  chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
    if (tabs && tabs.length > 0) {
      evaluateAndSendForTab(tabs[0]);
    }
  });
});
