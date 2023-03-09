const express = require("express");
const app = express();
const http = require("http");

const server = http.createServer(app);

const { Server } = require("socket.io");
const io = new Server(server);

const menu = ['vegetable salad', 'Corn', 'Agbado', 'Ewa', 'Garri', 'Casava', 'Rice', 'Beans']

app.get("/", (req, res) => {
  res.sendFile(__dirname + "/index.html");
});

io.on("connection", (socket) => {
  console.log("client connected", socket.id);

  socket.emit("connected", "connected to backend server");

  socket.on("disconnect", () => {
    console.log("client disconnected", socket.id);
  });

  socket.emit("order", menu);
  
});

server.listen(5500, () => {
  console.log("listening on *:5500");
});
