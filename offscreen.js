// Copyright 2023 Google LLC
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this file except in compliance with the License.
// You may obtain a copy of the License at
//
//     https://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

// Once the message has been posted from the service worker, checks are made to
// confirm the message type and target before proceeding. This is so that the
// module can easily be adapted into existing workflows where secondary uses for
// the document (or alternate offscreen documents) might be implemented.

// Registering this listener when the script is first executed ensures that the
// offscreen document will be able to receive messages when the promise returned
// by `offscreen.createDocument()` resolves.
chrome.runtime.onMessage.addListener(handleMessages);

// This function performs basic filtering and error checking on messages before
// dispatching the
// message to a more specific message handler.
function handleMessages(message, sender, sendResponse) {
  // Return early if this message isn't meant for the offscreen document.
  if (message.target !== "offscreen-doc") {
    return;
  }
  // Dispatch the message to an appropriate handler.
  switch (message.type) {
    case "copy-data-from-clipboard":
      const result = handleClipboardRead();
      sendResponse(result);
      break;
    default:
      console.warn(`Unexpected message type received: '${message.type}'.`);
  }
}

// We use a <textarea> element for two main reasons:
//  1. preserve the formatting of multiline text,
//  2. select the node's content using this element's `.select()` method.
const textEl = document.querySelector("#text");
function getDataFromTextarea() {
  var result = null;
  // var textarea = document.getElementById("ta");
  textEl.value = "";
  textEl.select();

  if (document.execCommand("paste")) {
    result = textEl.value;
  } else {
    console.log("failed to get clipboard content");
  }
  textEl.value = "";
  return result;
}

// We use a <div contenteditable="true"> element to get innerHtml
// const divEl = document.querySelector("#editableDiv");
function getDataFromEditableDiv() {
  var divEl = document.createElement("div");
  document.body.appendChild(divEl);
  divEl.contentEditable = true;
  var result = null;
  divEl.innerHTML = "";
  // focus the helper div's content
  var range = document.createRange();
  range.selectNode(divEl);
  window.getSelection().removeAllRanges();
  window.getSelection().addRange(range);
  divEl.focus();

  // trigger the paste action
  document.execCommand("Paste");

  result = divEl.innerHTML;

  document.body.removeChild(divEl)
  return result;
}

function handleClipboardRead() {
  // const result = getDataFromTextarea()
  const result = getDataFromEditableDiv();
  // await handleClipboardWriteElement(result);
  return result;
}

// Use the offscreen document's `document` interface to write a new value to the
// system clipboard.
//
// At the time this demo was created (Jan 2023) the `navigator.clipboard` API
// requires that the window is focused, but offscreen documents cannot be
// focused. As such, we have to fall back to `document.execCommand()`.
async function handleClipboardWriteText(data) {
  try {
    // Error if we received the wrong kind of data.
    if (typeof data !== "string") {
      throw new TypeError(`Value provided must be a 'string', got '${typeof data}'.`);
    }
    // `document.execCommand('copy')` works against the user's selection in a web
    // page. As such, we must insert the string we want to copy to the web page
    // and to select that content in the page before calling `execCommand()`.
    textEl.value = data;
    textEl.select();
    document.execCommand("copy");
  } finally {
    // Job's done! Close the offscreen document.
    // window.close();
  }
}

async function handleClipboardWriteElement(data) {
  try {
    // Error if we received the wrong kind of data.
    if (typeof data !== "string") {
      throw new TypeError(`Value provided must be a 'string', got '${typeof data}'.`);
    }
    // `document.execCommand('copy')` works against the user's selection in a web
    // page. As such, we must insert the string we want to copy to the web page
    // and to select that content in the page before calling `execCommand()`.
    var divEl = document.createElement("div");
    document.body.appendChild(divEl);
    divEl.contentEditable = true;
    var range = document.createRange();
    divEl.innerHTML = data;
    range.selectNode(divEl);
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    divEl.focus();
    document.execCommand("copy");
    document.body.removeChild(divEl)
  } finally {
    // Job's done! Close the offscreen document.
    // window.close();
  }
}
