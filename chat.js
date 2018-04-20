var USERNAME = ""; // gets set when user signs in
var CHATTING = false; // switches to true when user signs in
var MOOD = "neutral";
var EMOTIONS = ["contempt", "disgust", "fear", "happiness", "neutral", "sadness", "surprise"];
var NUM_FRAMES = 5;
var VOICE_RECORDING = false;

// Holds DOM elements that don’t change, to avoid repeatedly querying the DOM
var dom = {};
var width;
var height;
var emotionData = [];

// Create socket
var socket = null;

document.addEventListener("DOMContentLoaded", function() {
  // Create references to static elements
  dom.msgs = document.querySelector("#sent-msgs");
  dom.input = document.querySelector("#msg-input");
  dom.name = document.querySelector("#name-input");
  dom.popup = document.querySelector("#popup");
  dom.popupContent = document.querySelector(".popup-content");
  dom.selectEmoji = document.querySelector("#select-emoji-btn");
  dom.voiceToText = document.querySelector("#voice-to-text-btn");

  document.querySelector("#signin-btn").addEventListener("click", signin);
  dom.selectEmoji.addEventListener("click", popupEmojis);
  dom.voiceToText.addEventListener("click", voiceToText);
  document.querySelector("#send-btn").addEventListener("click", send);
  document.querySelector("#pic-btn").addEventListener("click", function() { get_face(1); })

  dom.input.addEventListener("keydown", function(evt) {
    if (evt.key === "Enter") { send(); }
  });
  dom.name.addEventListener("keydown", function(evt) {
    if (evt.key === "Enter") { signin(); }
  });
  dom.name.focus();

  width = 320; // We will scale the photo width to this
  height = 0; // This will be computed based on the input stream

  socket = io();
  socket.on("chat message", function(msg) {
    createMsgDiv(msg.user, msg.content);
  });
  socket.on("announcement", function(msg) {
    createAnnouncement(msg);
  });

  var streaming = false;
  var video = null;
  var canvas = null;
  var photo = null;
  var startbutton = null;

  video = document.getElementById('video');
  canvas = document.getElementById('canvas');
  canvas.style.display = "none";

  Webcam.set({
    width: 320,
    height: 240,
    image_format: 'jpeg',
    jpeg_quality: 90
  });
  Webcam.attach('#video');

});

window.addEventListener("unload", function (evt) {
  if (USERNAME !== "") {
    socket.emit("signout", USERNAME);
  }
});

function signin() {
  var name = dom.name.value;
  if (name !== "") {
    USERNAME = name;
    CHATTING = true;
    socket.emit("signin", name);
    closePopup();
  }
}

function send() {
  var value = dom.input.value;
  if (value !== "") {
    socket.emit("chat message", {user: USERNAME, content: dom.input.value});
  }
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

function createAnnouncement(msg) {
  var msgDiv = document.createElement("div");
  msgDiv.setAttribute("class", "announcement");
  msgDiv.textContent = msg;

  dom.msgs.appendChild(msgDiv);
  dom.msgs.scrollTop = dom.msgs.scrollHeight;
}

function popupEmojis() {
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
  dom.popupContent.setAttribute("id", "emoji-popup");
  dom.popup.style.setProperty("display", "flex");
}

function drawEmojiBtn(emoji) {
  var emojiBtn = document.createElement("button");
  emojiBtn.textContent = emoji;
  emojiBtn.setAttribute("class", "emoji-btn");
  emojiBtn.addEventListener("click", function() {
    dom.input.value += emoji;
    dom.selectEmoji.textContent = emoji;
    closePopup();
  });
  dom.popupContent.appendChild(emojiBtn);
}

function closePopup() {
  dom.popup.style.setProperty("display", "none");
  dom.popupContent.innerHTML = "";
  dom.input.focus();
}

function bestEmotion(emotions) {
    var bestEmotion = "neutral"
    var bestScore = 0;
    for (var i=0; i<emotions.length; i++) {
        var emotionsCurFrame = emotions[i];
        var emotionScores = [];
        for (var j=0; j<EMOTIONS.length; j++) {
          emotion = EMOTIONS[j];
            emotionScores.push(emotionsCurFrame[emotion]);
        }
        var scoreAndIndex = emotionScores.map((x, i) => [parseFloat(x), i]).reduce((r, a) => (a[0] > r[0] ? a : r));
        var currentScore = parseFloat(scoreAndIndex[0]);
        var currentEmotion = EMOTIONS[scoreAndIndex[1]];
        if(currentEmotion != "neutral" && currentScore > bestScore) {
            bestEmotion = currentEmotion;
            bestScore = currentScore;
        }
    }
    emotionData = [];
    if (bestEmotion !== MOOD) {
      dom.selectEmoji.textContent = emojiBank[bestEmotion][0];
    }
    MOOD = bestEmotion;
}

function get_face(counter) {
    // take snapshot and get image data
    var canvas = document.getElementById('canvas');
    context = canvas.getContext('2d');
    // repeat over multiple frames
    Webcam.snap(function(data_uri) {
              base_image = new Image();
              base_image.src = data_uri;
              base_image.onload = function() {
                  context.drawImage(base_image, 0, 0, 320, 240);
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
                        emotionData.push(data[0].faceAttributes.emotion);
                        if ( counter < NUM_FRAMES ) {
                            get_face(counter + 1);
                        } else {
                            console.log(MOOD);
                            bestEmotion(emotionData);
                            console.log(MOOD);
                        };
                      })
                      .fail(function(err) {
                        console.log(JSON.stringify(data))
                      })
                  });
            }
    });
}

function voiceToText() {
  if (!VOICE_RECORDING) {
    VOICE_RECORDING = true;
    dom.voiceToText.textContent = "🔴";
    // start recording here
  }
  else {
    VOICE_RECORDING = false;
    dom.voiceToText.textContent = "🎙";
    dom.input.value += "whatever was recorded";
    // finish recording here
  }
}
