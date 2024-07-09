const menuId = "paste richText to wikijs";
chrome.contextMenus.create({
  title: "paste to wikijs",
  id: menuId,
  contexts: ["editable"]
});

// A generic onclick callback function.
chrome.contextMenus.onClicked.addListener(genericOnClick);

// A generic onclick callback function.
function genericOnClick(info) {
  switch (info.menuItemId) {
    case menuId:
      // console.log("wikijs paste context menu item clicked.");
      getClipboardData();
      break;
    default:
      // Standard context menu item function
      console.log("Standard context menu item clicked.");
  }
}

const offscreenHtmlPath = "offscreen.html";
const offscreenUrl = chrome.runtime.getURL(offscreenHtmlPath);

async function getClipboardData() {
  // console.log("enter function");
  const existingContexts = await chrome.runtime.getContexts({
    contextTypes: ["OFFSCREEN_DOCUMENT"],
    documentUrls: [offscreenUrl]
  });

  if (existingContexts.length <= 0) {
    await chrome.offscreen.createDocument({
      url: offscreenHtmlPath,
      reasons: [chrome.offscreen.Reason.CLIPBOARD],
      justification: "Write text to the clipboard."
    });
  }

  const clipboardData = await chrome.runtime.sendMessage({
    type: "copy-data-from-clipboard",
    target: "offscreen-doc"
  });

  chrome.tabs.query(
    {
      active: true,
      currentWindow: true
    },
    function (tabs) {
      // send message to the current tab
      chrome.tabs.sendMessage(tabs[0].id, {
        type: "wikijs-paste",
        target: "wikijs-content-script",
        text: clipboardData
      });
    }
  );
}
