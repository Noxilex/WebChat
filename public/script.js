class Message {
    constructor(content="", user = new User()){
      this.dateCreated = new Date();
      this.content = content;
      this.user = user;
    }
}
  
class User {
    constructor(name="") {
        this.id;
        this.name = name;
        this.color;
    }
}

var socket = io();
var chatTextArea = document.querySelector("#chat-send");
var inputJoin = document.querySelector("#join-chat input");
var messages = [];
var connectedUsers = [];

chatTextArea.addEventListener("keypress", (event) => {
    if(event.key == "Enter"){
        sendMessage();
    }
})

inputJoin.addEventListener("keypress", (event) => {
    if(event.key == "Enter"){
        joinChat();
    }
})


function sendMessage(){
    if(chatTextArea.value.length > 0 && chatTextArea.value.length <= 255){
        socket.emit('message', chatTextArea.value);
        //addMessage(new Message(chatTextArea.value));
        chatTextArea.value = "";
    }
}

socket.on('newMessage', (msgData) => {
    console.log("New message")
    addMessage(new Message(msgData.content, msgData.user));
});

socket.on('chatJoined', (messages) => {
    console.log("Chat joined");
    messages.forEach(msgData => {
        msgData.dateCreated = new Date(msgData.dateCreated);
        addMessage(msgData);
    });
})

socket.on('userLeft', (userObj)=> {
    addMessage(new Message(`${userObj.username} has left the chat.`));
    connectedUsers = userObj.chatUsers;
    updateConnectedUsers(connectedUsers);
});

socket.on('userJoined', (userObj)=> {
    addMessage(new Message(`${userObj.username} has joined the chat.`));
    connectedUsers = userObj.chatUsers;
    updateConnectedUsers(connectedUsers);
});

function updateMessages(messages){
    
}

function joinChat(){
    let joinArea = document.querySelector("#join-chat");
    let nameInput = document.querySelector("#join-chat input");
    if(nameInput.value.length >= 3){
        socket.emit('userJoined', nameInput.value.substring(0,20));
        joinArea.hidden = true;
    }else{
        //TODO: Set error message if name is less than 3 characters long
        throw new Error("User name is less than the required 3 characters long");
    }
}

function addMessage(message, user){
    let chat = document.querySelector("#chat-history");
    let messageContent = document.createElement("li");
    let date = document.createElement("span");
    let userDom = document.createElement("span");
    let messageDom = document.createElement("span");

    if(!user){
        user = message.user;
    }

    console.log(user)

    date.classList.add("date");
    userDom.classList.add("username");
    userDom.style.color = user.color;
    messageDom.classList.add("message");

    let dateObj = message.dateCreated;
    date.innerText = "["+pad(dateObj.getHours(),2)+":"+pad(dateObj.getMinutes(),2)+"]";
    if(user.name){
        userDom.innerText = user.name + ":";
    }
    messageDom.innerText = message.content;

    messageContent.appendChild(date);
    messageContent.appendChild(userDom);
    messageContent.appendChild(messageDom);

    chat.appendChild(messageContent);
    chat.scrollBy(0, chat.scrollHeight);
}

function updateConnectedUsers(newUsers){
    connectedUsers = newUsers;
    let userList = document.querySelector('#connected-users');
    userList.innerHTML = "";
    newUsers.forEach(user => {
        let li = document.createElement('li');
        li.innerText = user.name;
        userList.appendChild(li);
    });
}

function pad(number, size){
    let nbLeadingZeros = size - (number+"").length;
    let result = "";
    for(let i= 0; i < nbLeadingZeros; i++){
        result += "0";
    }
    return result + number;
}