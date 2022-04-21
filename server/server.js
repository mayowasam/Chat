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
app.use(express.static("upload/avatar"))
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
global.onlineUsers = new Map()

global.onlineUsersSet = new Set()
let users= [];

//start the connection
io.on("connection", (socket) => {
    global.chatSocket = socket;
    console.log("onlineUsers", onlineUsers);

  
    //when user is added
    socket.on("adduser", (userId) => {
        // console.log("adduser", userId);

        //push the user to the global online object i created
        onlineUsers.set(userId, socket.id)
        // console.log("onlineUsers added", onlineUsers);

        //since idont want a repeated user in my online users to be able to know the count
        onlineUsersSet.add(userId)

    })

    //number of users connected 
    // io.emit("clientsize", onlineUsersSet.size)

    onlineUsersSet.forEach((val, valAgain, set) => {
            console.log('users in number', val);
            if(!users.includes(val)) return users.push(val)
            return users
  
    })
    // console.log(users);
    //connected users
    io.emit("clientsize", users)


    // when i receive a message i want to get the sender from the global online object
    socket.on("sendMessage", (msg) => {
        // console.log("msg friom the client", msg);
        console.log("onlineUsers", onlineUsers);
        const receiverSocket = onlineUsers.get(msg.to)
        // const senderSocket =  onlineUsers.get(msg.from)
        // console.log('senderSocket', senderSocket);
        // console.log('receiverSocket', receiverSocket);
        // if the receiver is online i want to snnd him the message he was sent
        if (receiverSocket) {
            // socket.to(receiverSocket).emit("msg-received", msg.message)
            // console.log("msg.message", msg.message);
            socket.to(receiverSocket).emit("msg-received", {message:msg.message, date: msg.date})
            // console.log("msg.message", msg.date);

        }
    })

    socket.on("typing", (msg) => {
      console.log(msg);
      const receiverSocket = onlineUsers.get(msg.to)
      if (receiverSocket) {
        socket.to(receiverSocket).emit("showtyping",  msg.message )
    }
    })

})