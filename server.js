const express = require('express');
var http = require("http");
var path = require("path");
const socketIO = require('socket.io');

const api = express();
const server = http.createServer(api);
var io = socketIO(server);

// API
api.use("/public", express.static(__dirname + "/public"));

// Routing
api.get("/", function(request, response) {
  response.sendFile(path.join(__dirname, "public/index.html"));
});

let users = [];
io.on('connection', (socket) => {
    socket.emit('new_user', users);
    console.log("A new user has connected to the server");
});

// Starts the server.
server.listen(5000, "0.0.0.0", function() {
    console.log("Started server on port 5000");
});
 
