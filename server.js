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

io.on("connection", (socket) => {
  console.log("a user connected");
  socket.on("disconnect", () => {
    console.log("user disconnected");
  });
  socket.on("PING", () => {
    console.log("Ping received from client");
    socket.emit("PONG");
  });
});

let port = process.env.PORT || 3000;
http.listen(port, () => {
  console.log("listening on *:" + port);
});
