import { io } from "socket.io-client"

//connect to backend socket.io server
const socket = io("http://localhost:4000", {
    transports:['websocket'],
    autoConnect: false,
})

export default socket;