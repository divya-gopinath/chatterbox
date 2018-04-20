// Modified from https://socket.io/get-started/chat/

var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require("socket.io")(http);
var port = process.env.PORT || 3000;

app.get("/", function(req, res){
  res.sendFile(__dirname + "/index.html");
});

app.use(express.static(__dirname + '/'));

io.on("connection", function(socket){
  socket.on("signin", function(username) {
    io.emit("announcement", `${username} has joined the chat!`);
  });

  socket.on("chat message", function(msg) {
    io.emit("chat message", msg);
  });

  socket.on("signout", function(username) {
    io.emit("announcement", `${username} has left the chat!`)
  });
});

http.listen(port, function(){
  console.log("listening on *:" + port);
});
