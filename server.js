var express = require("express");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

var players = [];

app.use(
  "/public/TemplateData",
  express.static(__dirname + "/public/TemplateData")
);

app.use("/public/Build", express.static(__dirname + "/public/Build"));

app.use(express.static(__dirname + "/public"));

io.on("connection", (socket) => {
  console.log("a user connected: " + socket.id);
  console.log(players);
  socket.on("disconnect", () => {
    console.log("user disconnected: " + socket.id);
    players = players.filter((item) => item.id != socket.id);
    console.log(players);
  });
  socket.on("PING", (data) => {
    players = players.filter((item) => item.id != data.id);
    players.push(data);
    let pongResponse = {
      players: players.filter((item) => item.id != data.id),
    };
    socket.emit("PONG", pongResponse);
  });
});

let port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log("listening on *:" + port);
});

setInterval(function () {
  console.log("Active Players");
  console.log(players);
}, 5000);
