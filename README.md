# 6835-project: Chatterbox

## Table of Contents
| Filename        | Description |
| --------------- | ----------- |
| `affectiva.js`  | Uses the Affectiva Emotion SDK for classifying facial expressions with an emoji and an emotion. |
| `chat.js`       | Modifies `index.html` depending on the state of the application. Combines `speech.js`, `scroll.js`, `affectiva.js`, and `logging.js` into the interface. |
| `chatServer.js` | Starts and runs a Node.js server using Express. |
| `emojiBank.js`  | Contains a dictionary used to suggest emojis based on the emotion classification. |
| `index.html`    | Initial layout of the interface. Modified using `chat.js` |
| `logging.js`    | Logs desired mouse and keyboard events to a Google spreadsheet. The data was then processed after user testing. |
| `package.json`  | Used by `npm` to keep track of dependencies. |
| `scroll.js`     | Triggers scrolling up or down when gaze tracking is turned on and a cutoff is reached at the top or bottom of the screen. |
| `speech.js`     | Processes speech using `webkitSpeechRecognition` API |
| `style.css`     | Provides styling to the interface. |
| `WebGazer.js`   | Sourced from <https://webgazer.cs.brown.edu/> and used to implement gaze tracking.  |


## Using the Chat

### Setup
1. Install Node.js  
2. Navigate to directory `6835-project`
3. Run `npm install`

### Running the Chat
1. Run `npm start`
2. Open a browser and go to `localhost:3000`

Or go to <https://agile-citadel-17828.herokuapp.com/>.


### Running the Python Chat
1. TODO: Install dependencies
2. Navigate to directory `python_chat`
3. Run the server: `python3 chat_server.py`
4. Open a GUI: `python3 chat_gui.py`
