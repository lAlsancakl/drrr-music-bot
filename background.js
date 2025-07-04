chrome.tabs.onActivated.addListener(activeInfo => {
    chrome.tabs.get(activeInfo.tabId, current_tab_info => {
      if (/^https:\/\/drrr\.com/.test(current_tab_info.url)) {
        chrome.scripting.executeScript({
          target: { tabId: activeInfo.tabId },
          files: ['foreground.js']
        });
  
        chrome.scripting.insertCSS({
          target: { tabId: activeInfo.tabId },
          files: ['style.css']
        });
      }
    });
  });