const express = require("express")
const http = require("http")
const socketio = require("socket.io")

const app = express()
const server = http.createServer(app)
const io = socketio(server,{
    cors:{
        origin:"http://localhost:3000"
    }
})

io.on("connection",(socket)=>{
    console.log("new user connected");

    socket.on("codeChange",(code)=>{
        console.log(code);
        socket.broadcast.emit("codeUpdate",code)
    })

    socket.on("disconnect",()=>{
        console.log("user disconnected");
    })
    
})

const PORT = process.env.PORT || 8000
server.listen(PORT,()=>{
    console.log(`Server is running on port ${PORT}`)
})