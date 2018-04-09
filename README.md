# 6835-project

To run the GUI:
python3 chat_server.py

New terminal tab:
python3 chat_gui.py
use 127.0.0.1 as host, don't have to put a port
Can open as many guis as you want (each in new tabs)

## OpenCV stuff
Added OpenCV functionality-- call `recommend_emojize() ` in `classify_emotions.py` and you'll see how this works. It'll grab camera data from your webcam (a default of 10 frames collected ever 100ms), make the necessary API calls to classify, and then spit out the suggested emojis (if any) from the emoji bank that I set up in `emoji_bank.py`. I'm using a library called "emojize" so I don't have to deal with a bunch of emoji/unicode issues with the text. The next step is to add a callback function in the GUI such that when you receive a message in your chat, this `recommend_emojize()` function is called. You can see the "suggestion" popup box I quickly made for some demo code on what this popup could look like (find this code in `emoji_suggestion_gui.py`).


TODO:
delete images when done
make requirements.txt for pip
