const socket = io();

//selection
const nameFormsArea = document.querySelector(".nameForms");
const nameForm = document.querySelector("#nameForm");
const msgForm = document.querySelector("#msg_form");
const roomArea = document.querySelector(".room");
const onlineUserList = document.querySelector("#onlineUserList");
const msgEmpty = document.querySelector(".msg-empty");
const innerCanvas = document.querySelector(".inner_canvas");
const displayName = document.querySelector(".displayName");
const messages = document.querySelector(".messages");
const createRoomInput = document.querySelector("#create_room");
const createRoomBtn = document.querySelector("#create-btn");
const publicRoomDiv = document.querySelector("#accordionPanelsStayOpenExample");
const modal = document.querySelector(".modal");

//GLOBALS VARIABLE
let activeUsers;
let publicRooms;

//SET NAME EVENT
nameForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const name = nameForm[0].value;
  if (!name) return;
  socket.emit("set_name", name, () => {
    nameFormsArea.hidden = true;
    roomArea.hidden = false;
    nameForm[0].value = "";
  });
});

//GET ACTIVE USERS
socket.on("active_user", (users) => {
  onlineUserList.innerHTML = "";
  activeUsers = users;
  users.forEach((user) => {
    const li = document.createElement("li");
    li.style.cursor = "pointer";
    li.style.fontWeight = "600";
    li.addEventListener("click", () => {
      openCanvas(user);
      msgForm[1].dataset.room = false;
      messages.innerHTML = "";
    });
    li.classList.add("user_list");
    li.classList.add("list-group-item");
    li.classList.add("px-4");
    li.classList.add("onLine");
    li.textContent = user.id === socket.id ? "You" : user.name;
    onlineUserList.appendChild(li);
  });
});


//send private msg
msgForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const message = msgForm[0].value;
  const id = msgForm[1].value;
  const isRoom = msgForm[1].dataset.room;

  socket.emit("send_message", { message, id, isRoom }, () => {
    if (!message) return;
    const li = document.createElement("li");
    li.classList.add("list-group-item");
    li.classList.add("send_message");
    li.style.background = "linear-gradient(to right, #0000A5 , #E238EC)";
    li.style.color = "white";
    li.style.marginLeft = "50%";
    li.style.wordBreak = "break-all";
    li.textContent = `You : ${message}`;
    messages.appendChild(li);
    msgForm[0].value = "";
  });
}); 

//Receive msg

socket.on("receive_message", (data, senderId) => {
  const isRoom = data.isRoom;
  const users = activeUsers.find((user) => user.id === data.id);
  const sender = activeUsers.find((user) => user.id === senderId);
  if (isRoom) {
    innerCanvas.hidden = false;
    displayName.textContent = data.id;
    msgForm[1].value = data.id;
    msgForm[1].dataset.room = true;
    msgEmpty.classList.add("d-none");
  } else {
    openCanvas(sender);
    msgForm[1].dataset.room = false;
  }
  const li = document.createElement("li");
  li.classList.add("list-group-item" );
  li.classList.add("send_message");
  li.textContent = `${sender.name} : ${data.message}`;
  messages.appendChild(li);
});

//open canvas

function openCanvas(user) {
  msgEmpty.classList.add("d-none");
  displayName.textContent = user.name;
  innerCanvas.hidden = false;
  msgForm[1].value = user.id;
}

//Create room
createRoomBtn.addEventListener("click", () => {
  const roomName = createRoomInput.value;
  if (!roomName) return;
  socket.emit("create_room", roomName, () => {
    closeModal();
  });
});

//Get public room

socket.on("get_public_room", (rooms) => {
  publicRooms = rooms;
  publicRoomDiv.innerHTML = "";
  rooms.forEach((room) => {
    const accordionItem = document.createElement("div");
    accordionItem.classList.add("accordion-item");
    accordionItem.innerHTML = `
    <div class="accordion-item">
    <h2 class="accordion-header" id="${room.id}id">
      <button class="accordion-button collapsed" type="button" data-bs-toggle="collapse" data-bs-target="#${room.id}option" aria-expanded="false" aria-controls="${room.id}option">
        ${room.roomName} (${room.size})
        <span onclick="joinRoom('${room.roomName}')"  class="material-symbols-outlined mx-1">
                      group_add
                  </span>
                  <span 
                  onclick="leaveRoom('${room.roomName}')"
                  class="material-symbols-outlined mx-1"> logout </span>
      </button>
    </h2>
    <div id="${room.id}option" class="accordion-collapse collapse" aria-labelledby="${room.id}id" data-bs-parent="#accordionExample">
      <div class="accordion-body">
        <ul id="participants">
        
        </ul>
      </div>
    </div>
  </div>
    `;
    const participantsUl = accordionItem.querySelector("#participants");
    room?.participants?.forEach((participant) => {
      const li = document.createElement("li");
      li.classList.add("list-group-item");
      li.classList.add("onLineRoom");
      li.textContent = participant.name;
      participantsUl.appendChild(li);
    });
    publicRoomDiv.appendChild(accordionItem);
  });
});

//Jion room event
function joinRoom(roomName) {
  socket.emit("join_room", roomName, () => {
    messages.innerHTML = "";
    console.log("User join");
    innerCanvas.hidden = false;
    msgEmpty.classList.add("d-none");
    displayName.textContent = roomName;
    msgForm[1].value = roomName;
    msgForm[1].dataset.room = true;
  });
}

//Close modal
function closeModal() {
  modal.classList.remove("show");
  modal.style.display = "none";
  createRoomInput.value = "";
  document.body.classList.remove("modal-open");
  document.body.style = {};
  document.querySelector(".modal-backdrop")?.remove("show");
}

//Leave room//

function leaveRoom(roomName) {
  socket.emit("leave_room", roomName, () => {
    innerCanvas.hidden = true;
  });
}
