var USERNAME = ""; // gets set when user signs in
var CHATTING = false; // switches to true when user signs in
var MOOD = "neutral";
var DEVIATE_MOOD = true;
var EMOTIONS = ["contempt", "disgust", "fear", "joy", "anger", "sadness", "surprise"];
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
  dom.affectiva = document.querySelector("#affectiva");

  // Add event listeners to static elements
  dom.selectEmoji.addEventListener("click", popupEmojis);
  dom.voiceToText.addEventListener("click", voiceToText);
  dom.scrollToggle.addEventListener('click', scrollControl);
  document.querySelector("#send-btn").addEventListener("click", send);
  document.querySelector("#recalibrate-btn").addEventListener("click", createCalibrationPopup);
  document.querySelector("#continue-btn").addEventListener("click", createCalibrationPopup);
  dom.affectiva.style.display = "none";

  dom.input.addEventListener("keydown", function(evt) {
    if (evt.key === "Enter") { send(); }
  });

  var faceMode = affdex.FaceDetectorMode.LARGE_FACES;
  var detector = new affdex.CameraDetector(dom.affectiva, 640, 480, faceMode);
  detector.addEventListener("onInitializeSuccess", function() {console.log("Affectiva initialized!")});
  detector.addEventListener("onInitializeFailure", function() {console.log("Affectiva failed :(")});
  detector.detectAllEmojis();
  detector.detectAllEmotions();
  detector.addEventListener("onImageResultsSuccess", function (faces, image, timestamp) {
    if (faces.length > 0) {
        var face = faces[0]; // take the first face in frame
        var emoji = face.emojis.dominantEmoji == "☺" ? "🙂" : face.emojis.dominantEmoji;
        var bestScore = 0;
        EMOTIONS.forEach(function(emotion) {
            var score = face.emotions[emotion];
            if (score > bestScore) {
                MOOD = emotion;
                bestScore = score;
            }
        })
        if (emoji != "😐" || DEVIATE_MOOD) {
            dom.selectEmoji.textContent = emoji;
            if (emoji != "😐") {
                DEVIATE_MOOD = false;
                setTimeout(function() { DEVIATE_MOOD = true; }, 5000); // only go back to neutral after 5 seconds
            } else { MOOD = "neutral"; }
        }
    }
  });

  //Add a callback to notify when camera access is allowed
  detector.addEventListener("onWebcamConnectSuccess", function() {
    console.log("Webcam access allowed");
  });

  //Add a callback to notify when camera access is denied
  detector.addEventListener("onWebcamConnectFailure", function() {
    console.log("Webcam access denied");
  });

  socket = io();

  socket.on("chat message", function(msg) {
    createMsgDiv(msg.user, msg.content);
  });

  socket.on("announcement", function(msg) {
    createAnnouncement(msg);
  });

  detector.start();


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
    var audio = new Audio('calibrate_snd.mp3');
    audio.play();
    closePopup();
  }
}

function send() {
  var value = dom.input.value;
  if (value !== "") {
    socket.emit("chat message", {user: USERNAME, content: dom.input.value});
  }
  dom.input.value = "";
}

function createCalibrationPopup() {
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
      if (curRow === 3 && curCol === 5) { // end of calibration
        setTimeout(function() {
          dom.popupContent.innerHTML = "";

          if (!CHATTING) { createSignIn(); }
          else { closePopup(); }
        }, 1000);
        LOG_MOUSEDOWN = false;
      }
      else {
        var nextRow; var nextCol;
        if (curCol === 5) { // end of columns, so move to next row
          nextRow = curRow + 1;
          nextCol = 1;
        } else { // move to next column
          nextRow = curRow;
          if (curRow === 2) { // only want 3 calibration points in middle row
            nextCol = curCol + 2;
          }
          else {
            nextCol = curCol + 1;
          }

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

function voiceToText() {
  if (!VOICE_RECORDING) {
    VOICE_RECORDING = true;
    dom.voiceToText.textContent = "🔴";
    var audio = new Audio('record_snd.mp3');
    audio.play();
    recognition.start();
  }
  else {
    VOICE_RECORDING = false;
    recognition.stop();
    dom.voiceToText.textContent = "🎙";
  }
}

function scrollControl() {
  if (!SCROLL_ACTIVE) {
    SCROLL_ACTIVE = true;
    webgazer.showPredictionPoints(true);
    webgazer.setGazeListener(scrollListenerRef);
  } else {
    SCROLL_ACTIVE = false;
    webgazer.showPredictionPoints(false);
    webgazer.clearGazeListener();
  }
}

function scrollChat(direction) {
  var scrollDistance = 10;

  if (direction === "up") {
    dom.msgs.scrollTop -= scrollDistance;
  }
  else if (direction === "down") {
    dom.msgs.scrollTop += scrollDistance;
  }
}


// DEPRECATED MICROSOFT AZURE API CODE
//function bestEmotion(emotions) {
//    var bestEmotion = "neutral"
//    var bestScore = 0;
//    for (var i=0; i<emotions.length; i++) {
//        var emotionsCurFrame = emotions[i];
//        var emotionScores = [];
//        for (var j=0; j<EMOTIONS.length; j++) {
//          emotion = EMOTIONS[j];
//            emotionScores.push(emotionsCurFrame[emotion]);
//        }
//        var scoreAndIndex = emotionScores.map((x, i) => [parseFloat(x), i]).reduce((r, a) => (a[0] > r[0] ? a : r));
//        var currentScore = parseFloat(scoreAndIndex[0]);
//        var currentEmotion = EMOTIONS[scoreAndIndex[1]];
//        if(currentEmotion != "neutral" && currentScore > bestScore) {
//            bestEmotion = currentEmotion;
//            bestScore = currentScore;
//        }
//    }
//    emotionData = [];
//    if (bestEmotion !== MOOD) {
//      dom.selectEmoji.textContent = emojiBank[bestEmotion][0];
//    }
//
//
//
//    MOOD = bestEmotion;
//}
//
//function get_face(counter) {
//    // take snapshot and get image data
//    var canvas = document.getElementById('canvas');
//    context = canvas.getContext('2d');
//    // repeat over multiple frames
//    Webcam.snap(function(data_uri) {
//              base_image = new Image();
//              base_image.src = data_uri;
//              base_image.onload = function() {
//                  context.drawImage(base_image, 0, 0, 320, 240);
//                  var data = canvas.toDataURL('image/jpeg');
//                  var params = {
//                    "returnFaceId": "true",
//                    "returnFaceAttributes": "emotion",
//                  };
//
//                  fetch(data).then(res => res.blob()).then(blobData => {
//                    $.post({
//                        returnFaceAttributes: "emotion",
//                        url: "https://westcentralus.api.cognitive.microsoft.com/face/v1.0/detect" + "?" + $.param(params),
//                        contentType: "application/octet-stream",
//                        headers: {
//                          'Ocp-Apim-Subscription-Key': 'aa8dc9560e8c4fba855f65862b996195'
//                        },
//                        processData: false,
//                        data: blobData
//                      })
//                      .done(function(data) {
//                        emotionData.push(data[0].faceAttributes.emotion);
//                        if ( counter < NUM_FRAMES ) {
//                            get_face(counter + 1);
//                        } else {
//                            bestEmotion(emotionData);
//                        };
//                      })
//                      .fail(function(err) {
//                        console.log(JSON.stringify(data))
//                      })
//                  });
//            }
//    });
//}
