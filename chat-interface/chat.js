var USERNAME = ""; // gets set when user signs in
var CHATTING = false; // switches to true when user signs in
var MOOD = "neutral";

// Holds DOM elements that don’t change, to avoid repeatedly querying the DOM
var dom = {};

document.addEventListener("DOMContentLoaded", function() {
  // Create references to static elements
  dom.msgs = document.querySelector("#sent-msgs");
  dom.input = document.querySelector("#msg-input");
  dom.send = document.querySelector("#send-btn");
  dom.signin = document.querySelector("#signin-btn");
  dom.name = document.querySelector("#name-input");
  dom.popup = document.querySelector("#popup");
  dom.popupContent = document.querySelector("#popup-content");
  dom.emojibtn = document.querySelector("#emoji-btn");

  dom.send.addEventListener("click", send);
  dom.signin.addEventListener("click", signin);
  dom.emojibtn.addEventListener("click", function() { popupEmojis() });
  dom.input.addEventListener("keydown", function(evt) {
    if (evt.key === "Enter") { send(); }
  });
  dom.name.addEventListener("keydown", function(evt) {
    if (evt.key === "Enter") { signin(); }
  });
  dom.name.focus();
});

function signin() {
  USERNAME = dom.name.value;
  CHATTING = true;
  dom.popup.style.setProperty("display", "none");
  dom.popupContent.innerHTML = "";
  dom.input.focus();
}

function send() {
  createMsgDiv(USERNAME, dom.input.value);
}

function createMsgDiv(user, content) {
  var userDiv = document.createElement("div");
  userDiv.setAttribute("class", "msg-user");
  userDiv.textContent = user;

  var contentDiv = document.createElement("div");
  contentDiv.setAttribute("class", "msg-content");
  contentDiv.textContent = content;

  var msgDiv = document.createElement("div");
  msgDiv.setAttribute("class", "msg");
  if (user === USERNAME) { msgDiv.classList.add("own-msg"); }
  msgDiv.appendChild(userDiv);
  msgDiv.appendChild(contentDiv);

  dom.msgs.appendChild(msgDiv);
  dom.msgs.scrollTop = dom.msgs.scrollHeight;
  dom.input.value = "";
  dom.input.focus();
}

function popupEmojis(emojis = emojiBank["happiness"]) {
  emojis = emojiBank[MOOD];
  if (emojis === null) {
    for (m in emojiBank) {
      if (m !== "neutral"){
        emojiBank[m].forEach(emoji => drawEmojiBtn(emoji));
      }
    }
  }
  else {
    emojis.forEach(emoji => drawEmojiBtn(emoji));
  }
  dom.popup.style.setProperty("display", "flex");
}

function drawEmojiBtn(emoji) {
  var emojiBtn = document.createElement("button");
  emojiBtn.textContent = emoji;
  emojiBtn.addEventListener("click", function() {
    dom.input.value += emoji;
    closePopup();
  });
  dom.popupContent.appendChild(emojiBtn);
}

function closePopup() {
  dom.popup.style.setProperty("display", "none");
  dom.popupContent.innerHTML = "";
  dom.input.focus();
}
