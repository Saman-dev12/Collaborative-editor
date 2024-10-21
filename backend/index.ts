import express from "express"
import http from "http"
import {Server} from "socket.io"

const app = express()
const server = http.createServer(app)
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
})

app.use(express.json())
app.use(express.urlencoded({ extended: true }))
app.use(express.static("public"))

app.get("/health", (req, res) => {
    res.send('Health Check')
})

io.on("connection", (socket) => {
    console.log("a user connected")

    socket.on("codeChange", (data) => {
        io.emit("codeUpdate", data)
    })  

    socket.on("disconnect", () => {
        console.log("user disconnected")
    })
})

const PORT = process.env.PORT || 8000
app.listen(PORT, () => {
    console.log("Server is running on port 8000")
})