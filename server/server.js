require("dotenv").config()
require('./db/mongo')()
const express = require("express")
const app = express()
const cors = require("cors")
const cookieParser = require("cookie-parser")
const userRouter = require('./routes/userRouter')
const messageRouter = require('./routes/messageRouter')
const socket = require("socket.io")

// app.use(express.json({ extended: false }))
app.use(express.json())
app.use(express.urlencoded({ extended: false }))

app.use(cors({
    origin: ['http://localhost:3000'],
    credentials: true
}))

app.use(cookieParser())
app.use(express.static("uploads/"))
app.use('/api/auth', userRouter)
app.use('/api', userRouter)
app.use('/api', messageRouter)


const server = app.listen(process.env.PORT, () => console.log(`server listening on port ${process.env.PORT}`))

//initialize socket
const io = socket(server, {
    cors: {
        origin: "http://localhost:3000",
        credentials: true
    }
})

// create a global object that contains all the online users 
// global.onlineUsers = new Map()

let availableUsers = [];


const addUsers = (userId, socketId) => {
    !availableUsers.some((available) => available.userId === userId) &&
        availableUsers.push({
            userId,
            socketId
        })
    // console.log('user added');
}

const getUsers = (userId) => {
    return availableUsers.find(available => available.userId === userId)

}
const removeUsers = (socketId) => {
    availableUsers = availableUsers.filter(available => available.socketId !== socketId)

}
//start the connection
io.on("connection", (socket) => {
    // global.chatSocket = socket;
    // console.log("onlineUsers", onlineUsers);


    //when user is added
    socket.on("adduser", (userId) => {
        // console.log("adduser", userId);

        //push the user to the global online object i created
        // onlineUsers.set(userId, socket.id)
        addUsers(userId, socket.id)

        // console.log("onlineUsers added", onlineUsers);
        io.emit("getUsers", availableUsers)



    })



    // when i receive a message i want to get the sender from the global online object
    socket.on("sendMessage", (msg) => {
        // console.log("msg friom the client", msg);
        // console.log("onlineUsers", onlineUsers);
        // const receiverSocket = onlineUsers.get(msg.to)
        const receiverSocket = getUsers(msg.to)
        // const senderSocket =  onlineUsers.get(msg.from)
        // console.log('senderSocket', senderSocket);
        // console.log('receiverSocket', receiverSocket);
        // if the receiver is online i want to snnd him the message he was sent

        if (receiverSocket) {
            // socket.to(receiverSocket).emit("msg-received", msg.message)
            // console.log("msg.message", msg.message);
            // socket.to(receiverSocket).emit("msg-received", { message: msg.message, date: msg.date })
            socket.to(receiverSocket.socketId).emit("msg-received", { message: msg.message, date: msg.date })
            // console.log("msg.message", msg.date);

        }
    })


    socket.on("sendNotification", (msg) => {
        // console.log(msg);

        const receiverSocket = getUsers(msg.to)
        socket.to(receiverSocket.socketId).emit("receiveNotification", {sender: msg.from, senderName : msg.fromName,  receiver: msg.to,  receiverName: msg.toName, message: msg.message, date: msg.date })


    })

 


    // socket.on("typing", (msg) => {
    //     console.log(msg);
    //     const receiverSocket = onlineUsers.get(msg.to)
    //     if (receiverSocket) {
    //         socket.to(receiverSocket).emit("showtyping", msg.message)
    //     }
    // })

    // console.log("out",availableUsers)

    socket.on("disconnect", () => {
        // console.log("my socket id has been disconnected ", socket.id);
        removeUsers(socket.id)
        // console.log("in",availableUsers)
        io.emit("getUsers", availableUsers)

        // onlineUsers.forEach((value, key, map) => {

        //     console.log(`my key ${key}: my val ${value} : my map ${map}`)
        //     //    onlineUsers.delete(userId)

        // });

        // for (let entry of onlineUsers) { // the same as of recipeMap.entries()
        //     console.log('entry', entry); // cucumber,500 (and so on)
        //     let index = entry.map(val => val).indexOf(socket.id)
        //     console.log('index', index);
        //     }

        // let key = [...onlineUsers].find(([key, val]) => val === socket.id)
        // console.log('key', key && key[0]);
        // key && onlineUsers.delete(key[0])
        // io.emit("getUsers", onlineUsers)



    })

})