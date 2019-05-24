/**
 * CODE
 */

//================== MODELS =================
class Message {
    constructor(content="", user){
      this.dateCreated = new Date();
      this.content = content;
      this.user = user;
      this.color;
      this.tag = msgType.message;
    }
}
  
class User {
    constructor(name="") {
        this.id;
        this.name = name;
        this.color;
    }
}

var msgType = {
    info: "infoMsg",
    error: "errorMsg",
    message: "message"
}

//================== END MODELS =================

//================== EXEC CODE ==================

var socket = io();
var chatTextArea = document.querySelector("#chat-send");
var inputJoin = document.querySelector("#join-chat input");
var messageElement = document.querySelector("#chat-history li");
var messages = [];
var connectedUsers = [];

inputJoin.focus();

//================== END EXEC CODE ==================

//=================== LISTENERS =========================

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


//=================== END LISTENERS =========================

//=================== SOCKETS =========================

socket.on('commandResult', result => {
    console.log(result);
    let promptMessage = new Message();
    promptMessage.content = result.message;
    switch (result.status) {
        case "OK":
            promptMessage.tag = msgType.info;
            switch (result.command.name) {
                case "color":
                    promptMessage.color = result.command.content;
                    break;
                case "rename":
                    updateConnectedUsers(result.content);
                    break;
                default:
                    console.log('No specific command behavior on client side for : ' + result.command.name);
                    break;
            }
            break;
        case "KO":
            promptMessage.tag = msgType.error;
            console.error("Command: "+ result.command.name + " failed");
            break;
            
        default:
            break;
    }
    console.log(promptMessage);
    addMessage(promptMessage);
})
/**
 * A user has send a new message to the chat
 * (also applies to current user)
 */
socket.on('newMessage', (msgData) => {
    console.log("New message")
    let message = new Message(msgData.content, msgData.user);
    if(msgData.tag){
        message.tag = msgData.tag;
    }
    addMessage(message);
});

socket.on('chatJoined', (object) => {
    let status = object.status;
    let messages = object.content;
    let joinArea = document.querySelector("#join-chat");
    if(status == "OK"){
        console.log("Chat joined");
        joinArea.hidden = true;
        updateMessages(messages);
        chatTextArea.focus();
    }else if(status == "KO"){
        joinArea.hidden = false;
        //TODO: Show error message for chat join error
        throw new Error(object.message);
    }
})

socket.on('userLeft', (userObj)=> {
    addMessage(new Message(`${userObj.username} has left the chat.`));
    connectedUsers = userObj.chatUsers;
    updateConnectedUsers(connectedUsers);
});

socket.on('userJoined', (userObj)=> {
    let infoMessage = new Message(`${userObj.username} has joined the chat.`);
    //Same as the class name;
    infoMessage.tag =  msgType.info;
    addMessage(infoMessage);
    connectedUsers = userObj.chatUsers;
    updateConnectedUsers(connectedUsers);
});



socket.on('connect_error', function () { 
    let errorMessage = new Message("Connexion lost to server. Please reload the page.");
    errorMessage.tag = "errorMsg";
    addMessage(errorMessage);
    socket.destroy(); 
});



socket.on('disconnected', () => {
    leaveChat();
})

//=============== END SOCKETS ===================

/**
 * END CODE
 */

 //=========== FUNCTIONS =================/

function sendMessage(){
    let message = chatTextArea.value;
    if(message.length > 0 && message.length <= 255){
        if(message[0] == "/"){
            let command = parseCommand(message);
            socket.emit('command', command);
        }else{
            socket.emit('message', message);
        }
        chatTextArea.value = "";
    }else {
        throw new Error("Message doesn't respect the dimensions, should be between 1 & 255 characters.");
    }
}

function updateMessages(messages){
    messages.forEach(msgData => {
        msgData.dateCreated = new Date(msgData.dateCreated);
        addMessage(msgData);
    });
}

/**
 * Fired when you join the chat,
 * the server will reply with a chatJoined event
 */
function joinChat(){
    let joinArea = document.querySelector("#join-chat");
    let nameInput = document.querySelector("#join-chat input");
    if(nameInput.value.length >= 3){
        joinArea.hidden = true;
        socket.emit('userJoined', nameInput.value.substring(0,20));
    }else{
        throw new Error("User name is less than the required 3 characters long");
    }
}

function leaveChat(){
    let joinArea = document.querySelector("#join-chat");
    let chatHistory = document.querySelector("#chat-history");

    //Clear chat history
    chatHistory.innerHTML = "";

    //show joinArea
    joinArea.hidden = false;
}

function parseCommand(message){
    let command = {
        name:"",
        content:""
    }
    //removes the '/'
    let messageParsed = message.substring(1);
    //Get an array of all elements splitted by " "
    let args = messageParsed.trim().split(" ");
    //First element is command name
    command.name = args[0];
    //Others elements are command content joined with space again
    command.content = args.slice(1).join(" ");

    return command;
}

function addMessage(message){
    let chat = document.querySelector("#chat-history");
    let messageContent = document.createElement("li");
    let date = document.createElement("span");
    let messageDom = document.createElement("span");



    date.classList.add("date");
    messageDom.classList.add(message.tag);
    console.log(message);
    if(message.color)
        messageDom.style.color = message.color;

    let dateObj = message.dateCreated;
    date.innerText = "["+pad(dateObj.getHours(),2)+":"+pad(dateObj.getMinutes(),2)+"]";
    messageDom.innerText = message.content;


    messageContent.appendChild(date);
    //Append the user to the DOM only if a user is associated to the message
    if(message.user){
        let userDom = document.createElement("span");
        userDom.classList.add("username");
        userDom.style.color = message.user.color;
        if(message.user.name){
            userDom.innerText = message.user.name + ":";
        }
        messageContent.appendChild(userDom);
    }
    messageContent.appendChild(messageDom);

    messageContent.addEventListener("click", (event)=> {
        //Toggle on/off
        console.log(date);
        if(date.classList.contains("show")){
            date.classList.remove("show");
        }else{
            date.classList.add("show");
        }
    });

    chat.appendChild(messageContent);
    //TODO: Only scroll if at bottom of scroll
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

//============== END FUNCTIONS ================ 