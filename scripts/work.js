var element;
var contentEditableDivEl;

document.addEventListener("contextmenu", function (e) {
  element = e.target;
});

$(document).on("ready", function () {
  console.log("content script running...");
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    console.log("====clipboard data: ", message);
    if (message.type == "wikijs-paste" && message.target == "wikijs-content-script") {
      if ("selectionStart" in element) {
        console.log("=== current element: ", element);
        console.log("=== field.selectionStart:", element.selectionStart, " field.selectionEnd", element.selectionEnd);
        console.log("==== document selection:", document.selection);
        // initialValue = element.value;
        // element.value = initialValue + message.text;
      } else {
        contentEditableDivEl = document.querySelector("[contenteditable]");
        console.log("=== current element: ", element);
        console.log("==== contenteditable innerHtml:  ", contentEditableDivEl.innerHTML);

        element.innerHTML += message.text;
      }
    }
    return;
  });
});
