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

//APP
class Message {
  constructor(content, user){
    this.user = user;
    this.content = content;
    this.dateCreated = new Date();
  }
}
let chat = {
  messages: []
};

//List of connected users
let users = [];

//List of chat users
let chatUsers = [];

//USER CONNECT
io.on('connection', (socket) => {
    //Add user to the list when they connect
    let connected_user = {
      id: socket.id,
      name: "user",
      color: randomColor()
      //Add a color element that is random for each user when they connect
    };

    users.push(connected_user);
    console.log(connected_user, " has connected.");

    //A connected user joins the chat
    socket.on('userJoined', (name) => {
      connected_user.name = name;
      console.log(connected_user, " has joined the chat.");
      chatUsers.push(connected_user);

      //Sends the last 10 messages
      let lastMessages = chat.messages.slice(-10);
      socket.emit('chatJoined', lastMessages);
      
      io.emit('userJoined', {
        username:name,
        chatUsers: chatUsers
      });
    })

    //A connected user leaves the chat
    socket.on('userLeft', () => {
      removeUser(chatUsers, socket.id);
      console.log(chatUsers);
      io.emit('userLeft', {
        username:connected_user.name,
        chatUsers: chatUsers
      });
    });

    socket.on('message', (message) => {

      //Checks if the user is a chat user
      if(chatUsers.includes(connected_user)){
        //Add his message to the chat
        let messageAdded = new Message(message, connected_user);
        chat.messages.push(messageAdded);

        console.log(messageAdded.user, " " , messageAdded.content); 

        //Broadcast message to everyone
        io.emit('newMessage', messageAdded);
      }
    });

    //USER DISCONNECT
    socket.on('disconnect', () => {
      if(chatUsers.includes(connected_user)){
        removeUser(chatUsers, socket.id);
        io.emit('userLeft', {
          username:connected_user.name,
          chatUsers: chatUsers
        });
      }
      removeUser(users, socket.id);
      console.log(connected_user, " has disconneted.");
    })

});

// Starts the server.
server.listen(5001, "0.0.0.0", function() {
    console.log("Started server on port 5001");
});
 
function getUser(users, socketID){
  users.forEach(user => {
    if(user.id == socketID){
      return user;
    }
  });
  console.error("No user found with that ID:", socketID);
  return null;
}

function getUserIndex(users, socketID){
  for (let i = 0; i < users.length; i++) {
    if(users[i].id == socketID)
      return i;
  }
  console.error("No user found with that ID:", socketID);
  return null;
}

function removeUser(users, socketID){
  return users.splice(getUserIndex(users, socketID), 1);
}

function randomColor(){
  return `hsl(${Math.floor(Math.random()*360)}, 100%, 35%)`
}