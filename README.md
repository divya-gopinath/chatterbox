# 6835-project

## Using the Chat

### Setup
1. Install Node.js  
2. Navigate to directory ```6835-project```
3. Run ```npm install```

### Running the Chat
1. Run ```npm start```
2. Open a browser and go to ```localhost:3000```

#### JS TODO:
- min-width of messages is currently set by name


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
