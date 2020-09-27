var express = require("express");
const { exit } = require("process");
var app = express();
var http = require("http").createServer(app);
var io = require("socket.io")(http);

app.use(
  "/public/TemplateData",
  express.static(__dirname + "/public/TemplateData")
);
app.use("/public/Build", express.static(__dirname + "/public/Build"));
app.use(express.static(__dirname + "/public"));

// state
var players = [];

io.on("connection", (socket) => {
  // report connection
  console.log("a user connected: " + socket.id);
  console.log(players);

  // on user disconnection from session
  socket.on("disconnect", () => {
    console.log("user disconnected: " + socket.id);
    players = players.filter((item) => item.id != socket.id);
    console.log(players);
  });

  socket.on("BroadcastEvent", (data) => {
    let message = data.message;

    switch (data.eventTag) {
      case "ReportHit":
        players = players.filter((item) => item.id != message.id);
        console.log("Player " + message.id + " Killed");
        socket.broadcast.emit("Receive" + data.eventTag, message);
        break;

      case "ReportShot":
        console.log(message.id + " SHOT");
        socket.broadcast.emit("Receive" + data.eventTag, message);
        break;

      case "ReportPlayerPosition":
        // reload reported players information
        players = players.filter((item) => item.id != message.id);
        players.push({ id: message.id, location: message.data });
        let response = {
          players: players.filter((item) => item.id != message.id),
        };
        socket.emit("ReceivePlayerPositions", response);
        break;

      default:
      // code block
    }
  });
});

// listen for communication
let port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log("listening on *:" + port);
});

// log list of active players
setInterval(function () {
  console.log("Active Players");
  console.log(players);
}, 5000);
