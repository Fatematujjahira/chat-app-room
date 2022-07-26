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


    // set name event
    socket.on('setName', async (name, cb) => {
        socket.name = name;
        cb()
        const activeUsers = await getOnlineUsers();
       io.emit("get_active_users", activeUsers);

    })


    // disconnect event
    socket.on('disconnect', async () => {
        const activeUsers = await getOnlineUsers();
       io.emit("get_active_users", activeUsers);
    })


    socket.on("send_a_msg", (data, cb) => {
        const id = data.id;
        const msg = data.msg;

        io.to(id).emit("receive_a_message",data, socket.id )
        cb()

    })


})



expressHTTPServer.listen(5000, () => {
    console.log("Server is running on port 5000");
})