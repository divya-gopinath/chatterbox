var USERNAME = "you";

// Holds DOM elements that don’t change, to avoid repeatedly querying the DOM
var dom = {};

document.addEventListener("DOMContentLoaded", function() {
  // Create references to static elements
  dom.msgs = document.querySelector("#sent-msgs");
  dom.input = document.querySelector("#msg-input");
  dom.send = document.querySelector("#send-btn");

  dom.send.addEventListener("click", send);
  dom.input.addEventListener("keydown", function(evt) {
    if (evt.key === "Enter") { send(); }
  });
  dom.input.focus();
});

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
