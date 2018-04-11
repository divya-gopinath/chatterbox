# Modified from: https://pastebin.com/F6198iqC
# Modified from: https://medium.com/swlh/lets-write-a-chat-app-in-python-f6783a9ac170
# Source for images: https://emojipedia.org/

import time
import tkinter as tk
from tkinter.font import Font
from PIL import Image, ImageTk
from socket import AF_INET, socket, SOCK_STREAM
from threading import Thread

from emoji_bank import emoji_bank
from classify_emotions import recommend_emojize
from speech_to_text import recognize_speech

COLORS = ["blue", "magenta", "green", "cyan", "red"]

class Application(tk.Frame):

    def __init__(self, parent):
        tk.Frame.__init__(self, parent)
        self.parent = parent
        self.user_colors = {}
        self.cur_emojis = None
        self.initUI()

    def initUI(self):
        # self.default_font = Font(family="Helvetica")
        self.bold_font = Font(weight="bold", family="Courier", size=14)

        self.parent.title("ChatterBox")
        self.pack(fill=tk.BOTH, expand=True)

        self.columnconfigure(1, weight=1)
        self.columnconfigure(3, pad=7)
        self.rowconfigure(3, weight=1)
        self.rowconfigure(5, pad=7)

        self.parent.bind("<Return>", self.send)

        self.area = tk.Text(self, bd=5)
        self.area.grid(row=1, column=0, columnspan=6, rowspan=4, sticky=tk.E+tk.W+tk.S+tk.N)

        self.lbl2 = tk.Label(self, text='Message')
        self.lbl2.grid(row=6, column=0, stick=tk.W)
        self.entry = tk.Entry(self)
        self.entry.grid(row=6, column=1, columnspan=2, sticky=tk.W+tk.E)

        microphone = Image.open("emoji_images/microphone.png").resize((25, 25), Image.ANTIALIAS)
        microphone = ImageTk.PhotoImage(microphone)
        self.talk_btn = tk.Button(self, image=microphone, command=recognize_speech)
        self.talk_btn.grid(row=6, column=3)
        self.talk_btn.image = microphone

        question_mark = Image.open("emoji_images/question_mark.png").resize((25, 25), Image.ANTIALIAS)
        question_mark = ImageTk.PhotoImage(question_mark)
        self.emoji_btn = tk.Button(self, image=question_mark, state=tk.DISABLED)
        self.emoji_btn.grid(row=6, column=4)
        self.emoji_btn.image = question_mark

        self.send_btn = tk.Button(self, text="Send", command=self.send)
        self.send_btn.grid(row=6, column=5)

    def receive(self):
        """Handles receiving of messages."""
        while True:
            try:
                received = client_socket.recv(BUFSIZ).decode("utf8").split('$%')
                if len(received) == 1:
                    msg = received[0]
                    welcome_msg = msg.split('!')[0]

                    if len(welcome_msg.split(' ')) == 2:
                        self.username = welcome_msg[8:]
                        self.add_user(self.username)
                    self.area.insert('end', msg + '\r\n')
                    self.area.see('end')

                else:
                    name, msg = received
                    if name not in self.user_colors:
                        self.add_user(name)
                    row = int(float(self.area.index(tk.END))) - 1
                    self.area.insert(tk.END, "<" + name + "> ")
                    start = str(row) + ".0"
                    end = str(row) + "." + str(2 + len(name))
                    self.area.tag_add(name, start, end)
                    self.area.insert(tk.END, msg + '\r\n')
                    self.area.see('end')
                    if name != self.username:
                        self.suggest()

            except OSError:  # Possibly client has left the chat.
                break

    def send(self, event=None, emoji=None):  # event is passed by binders.
        """Handles sending of messages."""
        msg = self.entry.get()
        if emoji:
            msg = emoji
        else:
            self.entry.delete(0, 'end')

        client_socket.send(bytes(msg, "utf8"))
        if msg == "{quit}":
            client_socket.close()
            self.parent.destroy()

    def on_closing(self, event=None):
        """This function is to be called when the window is closed."""
        self.entry.delete(0, "end")
        self.entry.insert(0, "{quit}")
        self.send()

    def suggest(self):
        emojis = recommend_emojize()
        if emojis != None and emojis != self.cur_emojis:
            photo = myEmojis[emojis[0][1:-1]]
            self.emoji_btn.config(image=photo, command=(lambda : self.popup_emojis()), state=tk.NORMAL)
            self.emoji_btn.image = photo
            self.cur_emojis = emojis


    def popup_emojis(self):
        """Create overlay to allow users to pick an emoji"""
        self.emoji_overlay = tk.Toplevel()

        if self.cur_emojis == None:
            l = tk.Label(self.emoji_overlay, text="no suggestions")
            l.pack()

        else:
            for emoji in self.cur_emojis:
                photo = myEmojis[emoji[1:-1]]
                b = tk.Button(self.emoji_overlay, image=photo, command=(lambda x=emoji[1:-1] : self.send_emoji(x)))
                b.image = photo
                b.pack()

        quit = tk.Button(self.emoji_overlay, text="None", command=self.emoji_overlay.destroy)
        quit.pack()

    def send_emoji(self, emoji):
        """
        Sends given emoji in the chat application and updates image on the emoji button
        :param emoji: emoji to add
        """
        photo = myEmojis[emoji]
        self.emoji_btn.config(image=photo, command=(lambda : self.popup_emojis()), state=tk.NORMAL)
        self.emoji_btn.image = photo

        self.send(emoji=emoji)
        self.emoji_overlay.destroy()

    def add_user(self, name):
        if name in self.user_colors:
            print ("already have user")
            return
        color = COLORS[ len(self.user_colors) % len(COLORS) ]
        self.user_colors[name] = color
        self.area.tag_config(name, foreground=color, font=self.bold_font)

if __name__ == '__main__':

    root = tk.Tk()

    myEmojis = {}
    for label in emoji_bank:
        if emoji_bank[label]:
            for emoji in emoji_bank[label]:
                filename="emoji_images/" + emoji[1:-1] + ".png"
                image = Image.open(filename)
                image_resize = image.resize((25, 25), Image.ANTIALIAS)
                photo = ImageTk.PhotoImage(image_resize)
                myEmojis[emoji[1:-1]] = photo

    root.geometry("500x300")
    root.minsize('250', '250')
    app = Application(root)
    root.protocol("WM_DELETE_WINDOW", app.on_closing)

    HOST = "127.0.0.1"
    PORT = 33000
    BUFSIZ = 1024
    ADDR = (HOST, PORT)

    client_socket = socket(AF_INET, SOCK_STREAM)
    client_socket.connect(ADDR)

    receive_thread = Thread(target=app.receive)
    receive_thread.start()

    root.mainloop()
