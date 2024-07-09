var element;
var contentEditableDivEl;

document.addEventListener("contextmenu", function (e) {
  element = e.target;
});

function insertTextAtCaret(text) {
  var sel, range;
  console.log(window.getSelection);
  if (window.getSelection) {
    sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
      range.deleteContents();
      range.insertNode(document.createTextNode(text));
    }
  } else if (document.selection && document.selection.createRange) {
    document.selection.createRange().text = text;
  }
}

function pasteHtmlAtCaret(html) {
  var sel, range;
  if (window.getSelection) {
    // IE9 and non-IE
    sel = window.getSelection();
    if (sel.getRangeAt && sel.rangeCount) {
      range = sel.getRangeAt(0);
      range.deleteContents();
      // Range.createContextualFragment() would be useful here but is
      // only relatively recently standardized and is not supported in
      // some browsers (IE9, for one)
      var el = document.createElement("div");
      el.innerHTML = html;
      var frag = document.createDocumentFragment(),
        node,
        lastNode;
      while ((node = el.firstChild)) {
        lastNode = frag.appendChild(node);
      }
      range.insertNode(frag);

      // Preserve the selection
      if (lastNode) {
        range = range.cloneRange();
        range.setStartAfter(lastNode);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
  } else if (document.selection && document.selection.type != "Control") {
    // IE < 9
    document.selection.createRange().pasteHTML(html);
  }
}

$(document).on("ready", function () {
  console.log("content script running...");
  chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
    // console.log("====clipboard data: ", message);
    if (message.type == "wikijs-paste" && message.target == "wikijs-content-script") {
      if ("selectionStart" in element) {
        console.log("=== current element: ", element);
        console.log("=== field.selectionStart:", element.selectionStart, " field.selectionEnd", element.selectionEnd);
        console.log("==== document selection:", document.selection);
        insertTextAtCaret(message.text);
      } else {
        contentEditableDivEl = document.querySelector("[contenteditable]");
        console.log("=== current element: ", element);
        console.log("==== contenteditable innerHtml:  ", contentEditableDivEl.innerHTML);
        pasteHtmlAtCaret(message.text);
      }
    }
    return;
  });
});
