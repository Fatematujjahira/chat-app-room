//dependencies
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

//app initialize
const app = express();
const expressServer = http.createServer(app);

app.use(express.static("public"));

//application route
app.get("/", (req, res) => {
  res.sendFile(`${__dirname}/index.html`);
});

//socket server
const io = new Server(expressServer);

//connecting socket
io.on("connection", (socket) => {
  //get online user
  async function getActiveUsers() {
    const activeUsersSocket = io.sockets.sockets;
    const sids = io.sockets.adapter.sids;
    const activeUsersArray = [];
    const activeUsersId = [...sids.keys()];
    activeUsersId.forEach((userId) => {
      const { name, id } = activeUsersSocket.get(userId);
      if (name) {
        activeUsersArray.push({
          name,
          id,
        });
      }
    });
    return activeUsersArray;
  }

  //get public rooms
  async function getPublicRooms() {
    const rooms = await io.sockets.adapter.rooms;
    const sids = await io.sockets.adapter.sids;
    const allSocket = await io.sockets.sockets;

    const roomsKeys = [...rooms.keys()];
    const sidsKeys = [...sids.keys()];
    const publicRooms = [];
    let roomId = 0;
    for (let roomName of roomsKeys) {
      if (!sidsKeys.includes(roomName)) {
        const participantSet = rooms.get(roomName);
        const size = participantSet.size;

        const participants = [];

        for (let id of [...participantSet]) {
          const userSocket = allSocket.get(id);
          participants.push({
            id: userSocket.id,
            name: userSocket.name,
          });
        }
        publicRooms.push({
          id: "a" + roomId + Date.now(),
          roomName,
          size,
          participants,
        });
        roomId++;
      }
    }
    return publicRooms;
  }


  //set name 

  socket.on("set_name", async (name, cb) => {
    socket.name = name;
    cb();
    const activeUsers = await getActiveUsers();
    io.emit("active_user", activeUsers);
    const publicRoom = await getPublicRooms();
    io.emit("get_public_room", publicRoom);
  });



  //Disconnect 
  socket.on("disconnect", async () => {
    const activeUsers = await getActiveUsers();
    io.emit("active_user", activeUsers);
    const publicRoom = await getPublicRooms();
    io.emit("get_public_room", publicRoom);
  });


  //private message
  socket.on("send_message", (data, cb) => {
    const id = data.id;
    const isRoom = data.isRoom === "false" ? false : data.isRoom;
    data.isRoom = isRoom;
 
    if (!data.message) return;
    if (isRoom) {
      socket.to(id).emit("receive_message", data, socket.id);
      cb();
    } else {
      io.to(id).emit("receive_message", data, socket.id);
      cb();
    }
  });

  //create public room
  socket.on("create_room", async (roomName, cb) => {
    socket.join(roomName);
    const publicRoom = await getPublicRooms();
    io.emit("get_public_room", publicRoom);
    cb();
  });

  //join room event
  socket.on("join_room", async (roomName, cb) => {
    socket.join(roomName);
    const publicRoom = await getPublicRooms();
    io.emit("get_public_room", publicRoom);
    cb();
  });

  //leave room
  socket.on("leave_room", async (roomName, cb) => {
    socket.leave(roomName);
    const publicRoom = await getPublicRooms();
    io.emit("get_public_room", publicRoom);
    cb();
  });
});

//listening port
expressServer.listen(process.env.PORT || 5000, () => {
  console.log("Server is running on port 5000");
});
