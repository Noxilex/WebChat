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
  maxMessage: 100,
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
      color: randomColor(60)
      //Add a color element that is random for each user when they connect
    };

    users.push(connected_user);
    console.log(connected_user, " has connected.");

    //A connected user joins the chat
    socket.on('userJoined', (name) => {
      name = name.trim();
      if(name.length >= 3 && name.length <= 20){

        connected_user.name = name;
        console.log(connected_user, " has joined the chat.");
        chatUsers.push(connected_user);
  
        //Sends the last 10 messages
        let lastMessages = chat.messages.slice(-10);
        
        socket.emit('chatJoined', {
          status: "OK",
          content: lastMessages
        });
        
        io.emit('userJoined', {
          username:name,
          chatUsers: chatUsers
        });
      }else{
        socket.emit('chatJoined', {
          status: "KO",
          message: "Incorrect username, username must have between 3 & 20 characters"
        })
      }
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
        addNewMessage(message, connected_user);
      }
    });

    /**
     * command = {
     *  name,
     *  content
     * }
     */
    socket.on('command', (command) => {
      let result = {
        status: "KO",
        command: command,
        message: ""
      }
      switch (command.name) {
        case "color":
          //TODO: Validate input
          connected_user.color = command.content;
          result.status = "OK";
          result.message = "Username color was changed to " + command.content;
          socket.emit('commandResult', result)
          break;
        case "roll":
          let dice = parseInt(command.content.split(" ")[0], 10);
          if( isNaN(dice)){
            result.status = "KO";
            result.message = "Argument provided for command wasn't a number";
            socket.emit('commandResult', result);
          }else{
            result.status = "OK";
            let diceRoll = Math.ceil(Math.random()*dice);
            result.message = connected_user.name + " rolls a "+ dice + " dice...";
            result.message += "\n Gets " + diceRoll;
            io.emit('newMessage', {
              content: result.message,
              tag: "infoMsg"
            });
          }
          break;

        default:
          result.status = "KO";
          result.message = "'"+command.name+"' command is not supported."; 
          break;
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
        socket.emit('disconnected');
      }
      removeUser(users, socket.id);
      console.log(connected_user, " has disconneted.");
    })

});

// Starts the server.
server.listen(5001, "0.0.0.0", function() {
    console.log("Started server on port 5001");
});
 
/**
 * Check the message array size before adding a new one
 * If the size is higher than the max, shift the first message
 * then add the new one
 */
function addNewMessage(message, user){
  //Add his message to the chat
  let messageAdded = new Message(message, user);
  
  //If messages array has reached its limit, remove the last message
  //Prevents memory overload
  if(chat.messages.length >= chat.maxMessage){
    chat.messages.shift();
  }
  //Then add the new one
  chat.messages.push(messageAdded);

  console.log(messageAdded.user, " " , messageAdded.content); 

  //Broadcast message to everyone
  io.emit('newMessage', messageAdded);
}

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

function randomColor(light){
  return `hsl(${Math.floor(Math.random()*360)}, 100%, ${light}%)`
}

function isNumber(value){
  return !isNaN(parseInt(value)) && isFinite(value);
}