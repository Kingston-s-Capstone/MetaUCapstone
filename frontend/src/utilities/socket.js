import { io } from "socket.io-client"

//connect to backend socket.io server
const socketserver = import.meta.env.VITE_SERVER_URL
const socket = io(`${socketserver}`, {
    transports:['websocket'],
    autoConnect: false,
})

export default socket;