var USERNAME = ""; // gets set when user signs in
var CHATTING = false; // switches to true when user signs in
var MOOD = "neutral";

// Holds DOM elements that don’t change, to avoid repeatedly querying the DOM
var dom = {};
var width;
var height;

var _key = "22160d79804c420385ce0e3bae138790";
var _url = "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect";

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
  dom.emojibtn.addEventListener("click", function() {
    popupEmojis()
  });
  dom.input.addEventListener("keydown", function(evt) {
    if (evt.key === "Enter") {
      send();
    }
  });
  dom.name.addEventListener("keydown", function(evt) {
    if (evt.key === "Enter") {
      signin();
    }
  });
  dom.name.focus();


  width = 320; // We will scale the photo width to this
  height = 0; // This will be computed based on the input stream

  var streaming = false;

  var video = null;
  var canvas = null;
  var photo = null;
  var startbutton = null;

  video = document.getElementById('video');
  canvas = document.getElementById('canvas');

  Webcam.set({
    width: 320,
    height: 240,
    image_format: 'jpeg',
    jpeg_quality: 90
  });
  Webcam.attach('#video');
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
  if (user === USERNAME) {
    msgDiv.classList.add("own-msg");
  }
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
      if (m !== "neutral") {
        emojiBank[m].forEach(emoji => drawEmojiBtn(emoji));
      }
    }
  } else {
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

function getEmotion() {

}

function get_face() {
  // take snapshot and get image data
  var canvas = document.getElementById('canvas'),
    context = canvas.getContext('2d');
  Webcam.snap(function(data_uri) {
    base_image = new Image();
    base_image.src = data_uri;
    base_image.onload = function() {
      context.drawImage(base_image, 0, 0, height, width);

      var data = canvas.toDataURL('image/jpeg');

      var params = {
        "returnFaceId": "true",
        "returnFaceAttributes": "emotion",
      };

      fetch(data).then(res => res.blob()).then(blobData => {
        $.post({
            returnFaceAttributes: "emotion",
            url: "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect" + "?" + $.param(params),
            contentType: "application/octet-stream",
            headers: {
              'Ocp-Apim-Subscription-Key': '22160d79804c420385ce0e3bae138790'
            },
            processData: false,
            data: blobData
          })
          .done(function(data) {
            $("#result").text(JSON.stringify(data));

          })
          .fail(function(err) {
            $("#result").text(JSON.stringify(err));
          })
      });
    }
  });
};
