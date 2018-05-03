var USERNAME = ""; // gets set when user signs in
var CHATTING = false; // switches to true when user signs in
var MOOD = "neutral";
var EMOTIONS = ["contempt", "disgust", "fear", "happiness", "neutral", "sadness", "surprise"];
var NUM_FRAMES = 5;
var VOICE_RECORDING = false;
var SCROLL_ACTIVE = false;


// Holds DOM elements that don’t change, to avoid repeatedly querying the DOM
var dom = {};
var picWidth;
var picHeight;
var emotionData = [];


// Create socket
var socket = null;

document.addEventListener("DOMContentLoaded", function() {
  // Create references to static elements
  dom.msgs = document.querySelector("#sent-msgs");
  dom.input = document.querySelector("#msg-input");
  dom.popup = document.querySelector("#popup");
  dom.popupContent = document.querySelector(".popup-content");
  dom.selectEmoji = document.querySelector("#select-emoji-btn");
  dom.voiceToText = document.querySelector("#voice-to-text-btn");
  dom.scrollToggle = document.querySelector("#scroll-btn");

  // Add event listeners to static elements
  dom.selectEmoji.addEventListener("click", popupEmojis);
  dom.voiceToText.addEventListener("click", voiceToText);
  dom.scrollToggle.addEventListener('click', scrollControl);
  document.querySelector("#send-btn").addEventListener("click", send);
  document.querySelector("#recalibrate-btn").addEventListener("click", createCalibrationPopup);
  document.querySelector("#continue-btn").addEventListener("click", createCalibrationPopup);

  dom.input.addEventListener("keydown", function(evt) {
    if (evt.key === "Enter") { send(); }
  });

  picWidth = 320; // We will scale the photo width to this
  picHeight = 0; // This will be computed based on the input stream

  socket = io();

  socket.on("chat message", function(msg) {
    createMsgDiv(msg.user, msg.content);
    document.dispatchEvent(new CustomEvent('log', { detail: {
      name: "receiveMsg",
      info: {"from": msg.user, "content": msg.content},
    }}));
  });

  socket.on("announcement", function(msg) {
    createAnnouncement(msg);
    document.dispatchEvent(new CustomEvent('log', { detail: {
      name: "receiveAnnounce",
      info: {"content": msg},
    }}));
  });

  var streaming = false;
  var video = null;
  var canvas = null;
  var photo = null;
  var startbutton = null;

  video = document.getElementById('video');
  canvas = document.getElementById('canvas');
  camera = document.getElementById('video');
  canvas.style.display = "none";
  camera.style.display = "none";

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

  document.dispatchEvent(new CustomEvent('log', { detail: {
    name: 'sendMsg',
    info: {"content": dom.input.value}
  }}));
}

function createCalibrationPopup() {
  LOG_MOUSEDOWN = true;

  dom.popup.style.setProperty("display", "flex");
  dom.popupContent.innerHTML = "";
  dom.popupContent.setAttribute("id", "calibration-popup");

  if (CHATTING) { createCloseBtn(dom.popupContent); }

  var clickCounter = 0;
  var startTime = Date.now();
  function progressCalibration(curRow, curCol) {
    if (clickCounter === 5) {
      clickCounter = 0;
      var curBtn = document.querySelector(`#calibrate-${curRow}-${curCol}`);
      curBtn.textContent = "😄";
      curBtn.disabled = true;

      // Create next calibration button
      if (curRow === 3 && curCol === 3) { // end of calibration
        setTimeout(function() {
          var audio = new Audio('calibrate_snd.mp3');
          audio.play();
          dom.popupContent.innerHTML = "";

          document.dispatchEvent(new CustomEvent('log', { detail: {
            name: "calibrate",
            info: {"length":  (Date.now() - startTime)/1000. },
          }}));

          if (!CHATTING) { createSignIn(); }
          else { closePopup(); }
        }, 1000);
        LOG_MOUSEDOWN = false;
      }
      else {
        var nextRow; var nextCol;
        if (curCol === 3) { // end of columns, so move to next row
          nextRow = curRow + 1;
          nextCol = 1;
        } else { // move to next column
          nextRow = curRow;
          nextCol = curCol + 1;
        }
        var audio = new Audio('calibrate_snd.mp3');
        audio.play();
        createCalibrationBtn(nextRow, nextCol);
      }
    }
  }

  // Create the buttons that will be clicked to callibrate
  function createCalibrationBtn(row, col) {
    var btn = document.createElement("button");
    btn.textContent = "😭";
    btn.setAttribute("class", "emoji-btn calibration-btn");
    btn.setAttribute("id", `calibrate-${row}-${col}`);
    btn.addEventListener("click", function() {
      clickCounter += 1
      progressCalibration(row, col)
    });
    btn.style.setProperty("grid-row", row);
    btn.style.setProperty("grid-column", col);
    dom.popupContent.appendChild(btn);

  }

  createCalibrationBtn(1, 1);
}

function createSignIn() {
  var header = document.createElement("h2");
  header.textContent = "Calibration is done!"

  var header2 = document.createElement("h3");
  header2.textContent = "Please sign in to use ChatterBox.";

  var nameInput = document.createElement("input");
  nameInput.setAttribute("type", "text");
  nameInput.setAttribute("placeholder", "Please enter a username");
  nameInput.setAttribute("id", "name-input");
  nameInput.addEventListener("keydown", function(evt) {
    if (evt.key === "Enter") { signin(); }
  });
  dom.name = nameInput;

  var signinButton = document.createElement("button");
  signinButton.textContent = "Start Chatting";
  signinButton.setAttribute("id", "signin-btn");
  signinButton.addEventListener("click", signin);

  dom.popupContent.appendChild(header);
  dom.popupContent.appendChild(header2);
  dom.popupContent.appendChild(nameInput);
  dom.popupContent.appendChild(signinButton);
  dom.popupContent.setAttribute("id", "signin-popup");

  dom.popup.style.setProperty("display", "flex");
  dom.name.focus();
}

function createMsgDiv(user, content) {
  if (!CHATTING) { return; }

  var userDiv = document.createElement("div");
  userDiv.setAttribute("class", "msg-user");
  userDiv.textContent = user;

  var contentDiv = document.createElement("div");
  contentDiv.setAttribute("class", "msg-content");
  contentDiv.textContent = content;

  var msgDiv = document.createElement("div");
  msgDiv.setAttribute("class", "msg");
  if (user === USERNAME) { msgDiv.classList.add("own-msg"); }
  else {
    get_face(1);
    var audio = new Audio('receive_snd.mp3');
    audio.play();
  }
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

  if (msg.substring(msg.length - 21) === " has joined the chat!"
      && msg.substring(0, msg.length - 21) === USERNAME) {
    msgDiv.textContent = `Welcome to ChatterBox, ${USERNAME}!`;
  }
  else {
    msgDiv.textContent = msg;
  }

  dom.msgs.appendChild(msgDiv);
  dom.msgs.scrollTop = dom.msgs.scrollHeight;
}

function popupEmojis() {
  document.dispatchEvent(new CustomEvent('log', { detail: {
    name: 'popupEmoji',
    info: {},
  }}));

  var emojiList = document.createElement("div");
  emojiList.setAttribute("id", "emoji-list");

  if (MOOD === "neutral") {
    for (m in emojiBank) {
      if (m !== "neutral") {
        emojiBank[m].forEach(emoji => drawEmojiBtn(emoji, emojiList, false));
      }
    }
  }
  else {
    var suggestedList = document.createElement("div");
    suggestedList.setAttribute("id", "suggested-list");

    var suggText = document.createElement("div");
    suggText.textContent = "Suggestions: ";
    suggestedList.appendChild(suggText);

    emojiBank[MOOD].forEach(emoji => drawEmojiBtn(emoji, suggestedList, true));

    dom.popupContent.appendChild(suggestedList);
    dom.popupContent.append(document.createElement("hr"));

    for (m in emojiBank) {
      if (m !== "neutral" && m !== MOOD) {
        emojiBank[m].forEach(emoji => drawEmojiBtn(emoji, emojiList, false));
      }
    }
  }

  dom.popupContent.appendChild(emojiList);

  createCloseBtn(dom.popupContent);

  dom.popupContent.setAttribute("id", "emoji-popup");
  dom.popup.style.setProperty("display", "flex");
}

function drawEmojiBtn(emoji, appendTo, isSuggested) {
  var emojiBtn = document.createElement("button");
  emojiBtn.textContent = emoji;
  emojiBtn.setAttribute("class", "emoji-btn");

  emojiBtn.addEventListener("click", function() {
    dom.input.value += emoji;
    dom.selectEmoji.textContent = emoji;
    closePopup();
    document.dispatchEvent(new CustomEvent('log', { detail: {
      name: "chooseEmoji",
      info: {"chosen": emoji, "curMood": MOOD, "isSuggested": isSuggested},
    }}));
  });

  appendTo.appendChild(emojiBtn);
}

function createCloseBtn(appendTo) {
  var closeBtn = document.createElement("button");
  closeBtn.textContent = "✖";
  closeBtn.setAttribute("class", "emoji-btn");
  closeBtn.setAttribute("id", "close-btn");
  closeBtn.addEventListener("click", closePopup);
  appendTo.appendChild(closeBtn);
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

    document.dispatchEvent(new CustomEvent('log', { detail: {
      name: "setMood",
      info: {"fromMood": MOOD, "toMood": bestEmotion},
    }}));

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
                          'Ocp-Apim-Subscription-Key': 'aa8dc9560e8c4fba855f65862b996195'
                        },
                        processData: false,
                        data: blobData
                      })
                      .done(function(data) {
                        emotionData.push(data[0].faceAttributes.emotion);
                        if ( counter < NUM_FRAMES ) {
                            get_face(counter + 1);
                        } else {
                            bestEmotion(emotionData);
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
    var audio = new Audio('record_snd.mp3');
    audio.play();
    recognition.start();

    document.dispatchEvent(new CustomEvent('log', { detail: {
      name: "startRecording",
      info: {},
    }}));
  }
  else {
    VOICE_RECORDING = false;
    recognition.stop();
    dom.voiceToText.textContent = "🎙";
    document.dispatchEvent(new CustomEvent('log', { detail: {
      name: "endRecording",
      info: {"content": dom.input.value},
    }}));
  }
}

function scrollControl() {
  if (!SCROLL_ACTIVE) {
    SCROLL_ACTIVE = true;
    webgazer.showPredictionPoints(true);
    webgazer.setGazeListener(scrollListenerRef);

    document.dispatchEvent(new CustomEvent('log', { detail: {
      name: "startTrackingGaze",
      info: {},
    }}));
  } else {
    SCROLL_ACTIVE = false;
    webgazer.showPredictionPoints(false);
    webgazer.clearGazeListener();

    document.dispatchEvent(new CustomEvent('log', { detail: {
      name: "endTrackingGaze",
      info: {},
    }}));
  }
}

function scrollChat(direction) {
  var scrollDistance = 10;

  document.dispatchEvent(new CustomEvent('log', { detail: {
    name: "scroll",
    info: {"direction": direction},
  }}));

  if (direction === "up") {
    dom.msgs.scrollTop -= scrollDistance;
  }
  else if (direction === "down") {
    dom.msgs.scrollTop += scrollDistance;
  }
}
