var express = require("express");
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

  // consume player position report and respond with all the positions of the other currently active players
  socket.on("ReportPlayerPosition", (data) => {
    // reload reported players information
    players = players.filter((item) => item.id != data.id);
    players.push(data);

    // respond with positions removing the player that made the request from the list
    socket.emit("ReceivePositions", {
      players: players.filter((item) => item.id != data.id),
    });
  });

  // consume player position report and respond with all the positions of the other currently active players
  socket.on("ReportShot", (data) => {
    console.log(data.id + " SHOT");
    socket.broadcast.emit("AnOnlinePlayerShot", data);
  });

  socket.on("BroadcastEvent", (data) => {
    console.log(data.id + " " + data.event + ": " + data.message);
    socket.broadcast.emit(data.event, data.message);
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
