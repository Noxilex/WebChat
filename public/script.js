class Message {
    constructor(content="", user = new User()){
      this.dateCreated = new Date();
      this.dateEdited;
      this.content = content;
      this.user = user;
    }
}
  
class User {
    constructor(name="") {
        this.name = name;
    }
}

var socket = io();
var chatTextArea = document.querySelector("#chat-send");
var messages = [];
var connectedUsers = [];

chatTextArea.addEventListener("keypress", (event) => {
    if(event.key == "Enter"){
        console.log(chatTextArea)
        socket.emit('message', chatTextArea.value);
        //addMessage(new Message(chatTextArea.value));
        chatTextArea.value = "";
    }
})

socket.on('newMessage', (msgData) => {
    console.log("New message")
    addMessage(new Message(msgData.content, msgData.user));
});

socket.on('chatJoined', (messages) => {
    console.log("Chat joined");
    messages.forEach(msgData => {
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
    socket.emit('userJoined', nameInput.value);
    joinArea.hidden = true;
}

function addMessage(message, user){
    let chat = document.querySelector("#chat-history");
    let messageContent = document.createElement("li");
    let userDom = document.createElement("span");
    let messageDom = document.createElement("span");

    if(!user){
        user = message.user;
    }

    console.log(user)

    userDom.classList.add("username");
    messageDom.classList.add("message");
    if(user.name){
        userDom.innerText = user.name + ":";
    }
    messageDom.innerText = message.content;

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

