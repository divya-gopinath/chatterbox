# Modified from: https://pastebin.com/F6198iqC
# Modified from: https://medium.com/swlh/lets-write-a-chat-app-in-python-f6783a9ac170
import tkinter as tk
from PIL import Image, ImageTk
from socket import AF_INET, socket, SOCK_STREAM
from threading import Thread

from emoji_bank import emoji_bank

class Application(tk.Frame):

    def __init__(self, parent):
        tk.Frame.__init__(self, parent)
        self.parent = parent
        self.myEmojis = {}
        self.initUI()

    def initUI(self):
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
        self.lbl2.grid(row=6, column = 0, stick=tk.S+tk.W)
        self.entry = tk.Entry(self)
        self.entry.grid(row=6, column = 1, sticky=tk.S+tk.W)

        self.send_btn = tk.Button(self, text="Send", command=self.send)
        self.send_btn.grid(row=6, column=4)

        question_mark = Image.open("emoji_images/question_mark.png").resize((25, 25), Image.ANTIALIAS)
        placeholder = ImageTk.PhotoImage(question_mark)
        self.emoji_btn = tk.Button(self, image=placeholder)
        self.emoji_btn.config(command=(lambda : self.suggest()))
        self.emoji_btn.grid(row=6, column=3)
        self.emoji_btn.image = placeholder

    def update(self, method):
        if method == 'send':
            self.area.insert('end', '<You> ' + self.entry.get() + '\r\n')
            self.area.see('end')
            self.entry.delete(0, 'end')
        elif method == "send_emoji":
            self.area.insert('end', '<You> ' + self.cur_emoji + '\r\n')
            # self.area.insert('end', '<You> ')
            # self.area.image_create('end', image=myEmojis[self.cur_emoji])
            # self.area.insert('end', ' test\r\n')
        elif method == 'connect':
            # Create connection to server
            pass

    def receive(self):
        """Handles receiving of messages."""
        while True:
            try:
                received = client_socket.recv(BUFSIZ).decode("utf8").split('$%')
                if len(received) == 1:
                    self.area.insert('end', received[0] + '\r\n')
                else:
                    name, msg = received
                    self.area.insert('end', "<" + name + "> " + msg + '\r\n')
                self.area.see('end')
            except OSError:  # Possibly client has left the chat.
                break

    def send(self, event=None, is_emoji=False):  # event is passed by binders.
        """Handles sending of messages."""
        msg = self.entry.get()
        if is_emoji:
            msg = self.cur_emoji
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
        """Create overlay to allow users to pick an emoji"""
        # emojis = recommend_emojize()
        emojis = emoji_bank["happiness"]
        self.emoji_overlay = tk.Toplevel()

        if emojis == None:
            l = tk.Label(self.emoji_overlay, text="no suggestions")
            l.pack()

        else:
            for emoji in emojis:
                photo = myEmojis[emoji[1:-1]]
                b = tk.Button(self.emoji_overlay, image=photo, command=(lambda x=emoji[1:-1] : self.add_emoji(x)))
                b.image = photo
                b.pack()

        quit = tk.Button(self.emoji_overlay, text="None", command=self.emoji_overlay.destroy)
        quit.pack()

    def add_emoji(self, emoji):
        """
        Adds given emoji to the chat application to send
        :param emoji: emoji to add
        """
        self.cur_emoji = emoji
        photo = myEmojis[emoji]
        self.emoji_btn.config(image=photo, command=(lambda : self.send(is_emoji=True)))
        self.emoji_btn.image = photo
        self.emoji_overlay.destroy()

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

    root.geometry("350x300")
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
