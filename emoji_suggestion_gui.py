from tkinter import *
from PIL import Image, ImageTk

from classify_emotions import recommend_emojize

# Source for images: https://emojipedia.org/

def suggest(emoji_button):
    """
    Create overlay to allow users to pick an emoji
    :param emojis: emojis to use in suggestions
    """
    emojis = recommend_emojize()
    overlay = Toplevel()

    if emojis == None:
        l = Label(overlay, text="no suggestions")
        l.pack()

    else:
        buttons = []
        for emoji in emojis:
            filename="emoji_images/" + emoji[1:-1] + ".png"
            image = Image.open(filename)
            image_resize = image.resize((25, 25), Image.ANTIALIAS)
            photo = ImageTk.PhotoImage(image_resize)

            b = Button(overlay, image=photo, command=(lambda x=photo : add_emoji(x, overlay, emoji_button)))
            b.image = photo
            b.pack()
            buttons.append(b)

    quit = Button(overlay, text="None", command=overlay.destroy)
    quit.pack()

def add_emoji(photo, window, emoji_button):
    """
    Adds given emoji to the chat application to send
    :param emoji: emoji to add
    :param window: window to close on exist
    """
    window.destroy()
    emoji_button.config(image=photo)
    emoji_button.image = photo
