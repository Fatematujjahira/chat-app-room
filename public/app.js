const socket = io();


// selections
const nameForm = document.getElementById('name_form');
const roomCreateBtn = document.getElementById('create-btn')
const roomNameInputEl = document.getElementById('create_room')
const msgForm = document.getElementById('msg_form');
const nameFormArea = document.querySelector(".name");
const onlineUserList = document.getElementById('onlineUserList');
const messages = document.querySelector(".messages");
const roomArea = document.querySelector('.room')
const innerCanvas = document.querySelector('.inner_canvas')
const displayName = document.querySelector('.displayName')
innerCanvas.hidden = true;


//global variable
let activeUsers;

// set name 
nameForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const name = nameForm[0].value;
    if (!name) return;
    socket.emit('setName', name, () => {
        nameFormArea.hidden = true;
        roomArea.hidden = false;
    })
})

// get active

socket.on("get_active_users", (users) => {
    activeUsers = users;
    onlineUserList.innerHTML = ''
    activeUsers.forEach(user => {
        const li = document.createElement('li');
        li.style.cursor = 'pointer'
        li.addEventListener('click',()=>{
        openCanvas(user)
        messages.innerHTML = ''
        })
        li.textContent = user.id === socket.id ? "you" : user.name;
        li.dataset.id = user.id;
        li.classList.add("list-group-item");
        li.classList.add("onLine");
        onlineUserList.appendChild(li)
    })
    
})


// private msg
msgForm.addEventListener('submit',(e) =>{
    e.preventDefault();
    const msg = msgForm[0].value;
    const id = msgForm[1].value;
    if (msg) {
        socket.emit('send_a_msg', {msg, id}, () => {
        const li = document.createElement("li");
        li.classList.add("list-group-item");
        li.textContent ='you' + ": " + msg;
         messages.appendChild(li)
         msgForm[0].value = '';
        })
    }
})




//receive 

socket.on("receive_a_message", (data, senderId) => {

   const user = activeUsers.find(u => u.id === data.id);
    openCanvas(user)    
    const sender = activeUsers.find(u => u.id ===senderId);
    openCanvas(sender) 
    const li = document.createElement("li");
    li.classList.add("list-group-item");
    li.textContent =sender.name + ": " + data.msg;


    messages.appendChild(li)

})


// canvas function

function openCanvas(user) {
  
        innerCanvas.hidden = false;
        displayName.textContent = user.name;
        msgForm[1].value = user.id;
     
}


// create room function

roomCreateBtn.addEventListener('click',(e)=>{
    const roomName = roomNameInputEl.value;
    if (roomName) {
        socket.emit('create_room', roomName,()=>{
            console.log('created');
        })
    }
})


//get public room
socket.on('getPublicRooms',(publicRooms) =>{
    console.log(publicRooms);
})