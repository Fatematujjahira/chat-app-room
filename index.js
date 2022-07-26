const express = require("express")
const socket = require('socket.io')
const app = express();
app.use(express.static('public'))

const http = require("http");
const expressHTTPServer = http.createServer(app);
const io = new socket.Server(expressHTTPServer)

 
app.get("/", (req, res) => {
    res.sendFile(`${__dirname}/room.html`)
})


io.on('connection', (socket) => {


    // get online users
    const getOnlineUsers = async () => {
        const activeUserSockets = io.sockets.sockets;
        const sids = io.sockets.adapter.sids;
        const activeUserArray = [...sids.keys()];
        const activeUser = []
        activeUserArray.forEach(userId => {
            const userSocket = activeUserSockets.get(userId);
            if (userSocket.name) {
                activeUser.push({
                    id: userSocket.id,
                    name: userSocket.name,
                })
            }
            
        })

        return activeUser;
    }


    //get rooms
    const  getPublicRooms = async () => {
        const rooms = await io.sockets.adapter.rooms;
        const sids =await io.sockets.adapter.sids;
       const allSockets = await io.sockets.sockets;

        const roomKeys = [...rooms.keys()];
        const sidsKeys = [...sids.keys()];

           const publicRooms = [];
           let roomId = 0;
           for(let roomName of roomKeys){
           if (!sidsKeys.includes(roomName)) {
            const particepantSet = rooms.get (roomName);
            const size = particepantSet.size;
  
            const particepants = []

            for (let id of [...particepantSet]){
             const userSocket = allSockets.get(id);
             particepants.push({
                id: userSocket.id,
                name: userSocket.name
             })
           
            }
            
            
           
            publicRooms.push({
                id: "a" + roomId + Date.now(),
                roomName,
                size,
                particepants
               })

           **roomId;
           }
        }

       return publicRooms;


    }

    // [
    //     {"cZISjrfcIfL8ylvEAAAD":["cZISjrfcIfL8ylvEAAAD"]},
    //     {"kuku":["cZISjrfcIfL8ylvEAAAD",]}
    // ]


    // set name event
    socket.on('setName', async (name, cb) => {
        socket.name = name;
        cb()
        const activeUsers = await getOnlineUsers();
       io.emit("get_active_users", activeUsers);
      
    })

    //------/practice room-------
    // [
    //     {"TNoSYj3Uil_opdX6AAAF":[

    //     "TNoSYj3Uil_opdX6AAAF", "TNoSYj3Uil_opdX6AAAF",
    //      "ffff"]
    // },
    // {"TNoSYj3Uil_opdX6AAAF":[

    //     "TNoSYj3Uil_opdX6AAAF", "TNoSYj3Uil_opdX6AAAF",
    //      "ffff"]
    // },

    // {
    //     "room:"[
    //         "TNoSYj3Uil_opdX6AAAF",
    //         "ffffff"
    //     ]
    // }
    // ]
    // disconnect event
    socket.on('disconnect', async () => {
        const activeUsers = await getOnlineUsers();
       io.emit("get_active_users", activeUsers);
       const publicRooms = await getPublicRooms()
       io.emit('getPublicRooms',publicRooms)
    })

// send a private msg
    socket.on("send_a_msg", (data, cb) => {
        const id = data.id;
        const msg = data.msg;

        io.to(id).emit("receive_a_message",data, socket.id )
        cb()

    })

// create a public room
    socket.on('create_room',async (roomName, cb) =>{
        socket.join(roomName);
  const publicRooms = await getPublicRooms()
    io.emit('getPublicRooms',publicRooms)
}) 
})



expressHTTPServer.listen(5000, () => {
    console.log("Server is running on port 5000");
})