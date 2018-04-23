# 6835-project

## Using the Chat

### Setup
1. Install Node.js  
2. Navigate to directory ```6835-project```
3. Run ```npm install```

### Running the Chat
1. Run ```npm start```
2. Open a browser and go to ```localhost:3000```


### Working on gaze
- Press randomly on the screen while looking at the cursor to calibrate (we should eventually make a calibration screen popup)
    - Right now, ```WebGazer.setRegression```will start tracking as soon as ```scroll.js``` is loaded. I think we should create some element (not a separate page, but a div
      within the main index page-- not sure how)  with a bunch of buttons or dots that you click to calibrate (edges of screen, middle, etc.) and they disappear as you click.
- Click the eye button to (supposedly) begin tracking-- right now this isn't fully implemented
    - Tracking should cause a red dot (```gazeDot``` in the ```WebGazer.js``` code) to appear on the screen
    - Need to debug and finetune scrolling -- something is printed when scroll event triggered

#### JS TODO:
- min-width of messages is currently set by name
- change "i have joined" to welcome message


## OLD (Python) Using the Chat

In directory ```6835-project/python_chat```  
**Run the server:** ```python3 chat_server.py```  
**Open a GUI:** ```python3 chat_gui.py```


### TODO:
- bug when receives multiple messages at a time - things break (when user sends more than one message quickly, so second message sends before first message is received)
- message sending lags sometimes?

### Future TODO:
- issue: characters wrap on line break, not full words
- issue: can type in text area where messages appear
- handle repeat usernames (most likely don't allow)
- make requirements.txt for pip (?)

#### Current Dependencies
- pip3 install
  - Pillow
  - SpeechRecognition
  - pyaudio
  - requests
- other install (brew)
  - portaudio (needed for pyaudio)
  - opencv
