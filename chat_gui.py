# Modified from: https://medium.com/swlh/lets-write-a-chat-app-in-python-f6783a9ac170

from socket import AF_INET, socket, SOCK_STREAM
from threading import Thread
from PIL import Image, ImageTk
import tkinter as tk
from emoji_suggestion_gui import suggest

def receive():
    """Handles receiving of messages."""
    while True:
        try:
            msg = client_socket.recv(BUFSIZ).decode("utf8")
            msg_list.insert(tk.END, msg)
        except OSError:  # Possibly client has left the chat.
            break

def send(event=None):  # event is passed by binders.
    """Handles sending of messages."""
    msg = my_msg.get()
    my_msg.set("")  # Clears input field.
    client_socket.send(bytes(msg, "utf8"))
    if msg == "{quit}":
        client_socket.close()
        app.quit()

def on_closing(event=None):
    """This function is to be called when the window is closed."""
    my_msg.set("{quit}")
    send()

app = tk.Tk()
app.title("ChatterBox")

messages_frame = tk.Frame(app) # Following will contain the messages.
scrollbar = tk.Scrollbar(messages_frame)  # To navigate through past messages.
msg_list = tk.Listbox(messages_frame, height=15, width=50, yscrollcommand=scrollbar.set)
scrollbar.pack(side=tk.RIGHT, fill=tk.Y)
msg_list.pack(side=tk.LEFT, fill=tk.BOTH)
messages_frame.pack()

my_msg = tk.StringVar()  # For the messages to be sent.

entry_field = tk.Entry(app, textvariable=my_msg)
entry_field.bind("<Return>", send)
entry_field.pack()

send_button = tk.Button(app, text="Send", command=send)
send_button.pack()

question_mark = Image.open("emoji_images/question_mark.png").resize((25, 25), Image.ANTIALIAS)
placeholder = ImageTk.PhotoImage(question_mark)
emoji_button = tk.Button(app, text="suggestion:", image=placeholder, compound=tk.RIGHT)
emoji_button.config(command=(lambda : suggest(emoji_button)))
emoji_button.pack()
emoji_button.image = placeholder

img_label = tk.Label(app, image=placeholder)
img_label.pack()
img_label.image = placeholder

app.protocol("WM_DELETE_WINDOW", on_closing)

#----Now comes the sockets part----
HOST = "127.0.0.1"
PORT = 33000

BUFSIZ = 1024
ADDR = (HOST, PORT)

client_socket = socket(AF_INET, SOCK_STREAM)
client_socket.connect(ADDR)

receive_thread = Thread(target=receive)
receive_thread.start()
app.mainloop()  # Starts GUI execution.
