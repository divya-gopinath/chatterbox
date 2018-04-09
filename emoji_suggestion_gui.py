from tkinter import *
from PIL import Image, ImageTk
from emoji_bank import emoji_bank
import struct

# Source for images: https://emojipedia.org/

app = Tk()
app.title("Chat Application")
app.geometry("500x300+200+200")

question_mark = Image.open("emoji_images/question_mark.png").resize((25, 25), Image.ANTIALIAS)
placeholder = ImageTk.PhotoImage(question_mark)
emoji_button = Button(app, text="suggestion: ", image=placeholder, compound=RIGHT, command=(lambda : suggest(emoji_bank.get("happiness"))))
emoji_button.pack()
emoji_button.image = placeholder

def suggest(emojis):
    """
    Create overlay to allow users to pick an emoji
    :param emojis: emojis to use in suggestions
    """
    overlay = Toplevel()
    buttons = []
    for emoji in emojis:
        filename="emoji_images/" + emoji[1:-1] + ".png"
        image = Image.open(filename)
        image_resize = image.resize((25, 25), Image.ANTIALIAS)
        photo = ImageTk.PhotoImage(image_resize)

        b = Button(overlay, image=photo, command=(lambda x=photo : add_emoji(x, overlay)))
        b.image = photo
        b.pack()
        buttons.append(b)

    quit = Button(overlay, text="None", command=overlay.destroy)
    quit.pack()

def add_emoji(photo, window):
    """
    Adds given emoji to the chat application to send
    :param emoji: emoji to add
    :param window: window to close on exist
    """
    window.destroy()
    emoji_button.config(image=photo)
    emoji_button.image = photo

b = Button(app, text="Quit", width=20, command=app.destroy)
b.pack(side='bottom',padx=0,pady=0)

app.mainloop()
