// Maps emotions to suggested emojis.
var emojiBank = {
  "joy" : ["🙂", "😊", "😄", "😀", "😆"],
  "sadness" : ["🙁", "😟", "😭", "😞"],
  "disgust" : ["😬", "🤮", "🤢"],
  "anger" : ["😠", "😡"],
  "contempt" : ["😒", "🙄", "😑", "😏"],
  "fear" : ["😨", "😧", "😦", "😱"],
  "surprise" : ["😲", "😳"],
  "tongueOut": ["😜", "😛"],
  "wink": ["😉"],
  "kiss": ["😗", "😙", "😘"],
  "neutral" : ["😐"],
}

// Maps affectiva suggested emojis to the appropriate word
// in emojiBank in order to get suggested emojis.
var emojiToWord = {
  "🙂": "joy",
  "😃": "joy",
  "😞": "sadness",
  "😡": "anger",
  "😏": "contempt",
  "😱": "fear",
  "😜": "tongueOut",
  "😛": "tongueOut",
  "😉": "wink",
  "😗": "kiss",
  "😳": "surprise",
  "😏": "contempt",
  "😐": "neutral",
  "😒": "contempt",
}
