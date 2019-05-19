class Message {
    constructor(content="", user = new User()){
      this.dateCreated = new Date();
      this.dateEdited;
      this.content = content;
      this.user = user;
    }
}
  
class User {
    constructor(name="anonymous") {
        this.name = name;
    }
}

var socket = io();
var chatTextArea = document.querySelector("#chat-send");
var messages = [];

chatTextArea.addEventListener("keypress", (event) => {
    if(event.key == "Enter"){
        console.log(chatTextArea)
        addMessage(new Message(chatTextArea.value));
        chatTextArea.value = "";
    }
})


function updateMessages(messages){

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

    userDom.innerText = user.name;
    messageDom.innerText = message.content;

    messageContent.appendChild(userDom);
    messageContent.appendChild(messageDom);

    chat.appendChild(messageContent);
}


