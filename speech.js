var processSpeech = function(transcript) {
    console.log(transcript);
};

var canSend = true;
var recognition = new webkitSpeechRecognition();
recognition.continuous = true;
recognition.interimResults = true;
recognition.onresult = function(event) {
  // Build the interim transcript, so we can process speech faster
  var transcript = '';
  var hasFinal = false;
  for (var i = event.resultIndex; i < event.results.length; ++i) {
    if (event.results[i].isFinal)
      hasFinal = true;
    else
      transcript += event.results[i][0].transcript;
  }
  if (transcript != "") {
    if ((transcript.length > 13) && transcript.slice(-12).toLowerCase() == "send message") {
        if (canSend) {
            dom.input.value = transcript.slice(0, -12);
            send();
            canSend = false;
            setTimeout(function() { canSend = true; }, 1000);
        }
    } else { dom.input.value = transcript; }
  }
  // If we reacted to speech, kill recognition and restart
  if (!VOICE_RECORDING) {
    recognition.stop();
  }
};