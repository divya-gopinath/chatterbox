from tkinter import *
from emoji_bank import emoji_bank
from emoji import emojize
import struct

app = Tk()
app.title("Chat Application")
app.geometry("500x300+200+200")
label = Label(app, text="SUGGESTED EMOJI HERE: ", height=0, width=100)

def suggest(emojis):
    """
    Create overlay to allow users to pick an emoji
    :param emojis: emojis to use in suggestions
    """
    overlay = Toplevel()
    buttons = []
    for emoji in emojis:
        emoji_text = emojize(emoji) # encode in unicode utf-8
        emoji_text = ''.join(chr(x) for x in struct.unpack('>2H', emoji_text.encode('utf-16be'))) # unpack for tkinter formatting
        b = Button(overlay, text=emoji_text, command= (lambda : add_emoji(emoji_text, overlay)))
        b.pack()
        buttons.append(b)
    quit = Button(overlay, text="None", command=overlay.destroy)
    quit.pack()

def add_emoji(emoji, window):
    """
    Adds given emoji to the chat application to send
    :param emoji: emoji to add
    :param window: window to close on exist
    """
    print("HERE")
    window.destroy()
    label.config(text= label['text'] + emoji)

b = Button(app, text="Quit", width=20, command=app.destroy)
button1 = Button(app, text="CLICK TO SUGGEST", width=20, command=(lambda : suggest(emoji_bank.get("happiness"))))
label.pack()
b.pack(side='bottom',padx=0,pady=0)
button1.pack(side='bottom',padx=5,pady=5)

app.mainloop()