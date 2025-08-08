//sets up the socket.io server for real-time communication
//also maps socket.id to user_id so I can send targetted messages
const { Server } = require("socket.io")
const { supabase } = require("./supabaseClient")

const connectedUsers = new Map();

function initializeSocket(server) {
    const io = new Server(server, {
        cors: {
            origin: "https://uplifted-zarr30c1w-kingkd22s-projects.vercel.app", 
            methods: ["GET","POST"],
        },
    });

    io.on("connection", (socket) => {
        console.log("Socket connected", socket.id);

        socket.on("register", async (token) => {
            //verify supabase JWT
            const { data: { user}, error } = await supabase.auth.getUser(token)
            if (error || !user) {
                console.log("Invalid token");
                return;
            }

            //map user_id to this socket
            connectedUsers.set(user.id, socket.id);
            console.log(`User ${user.id} registed on socket ${socket.id}`)
        });

        socket.on("disconnected", () => {
            console.log("Socket disconnected", socket.id);
            //remove from map
            for (const [userId, socketId] of connectedUsers.entries()) {
                if (socketId === socket.id) {
                    connectedUsers.delete(userId);
                    break
                }
            }
        })
    });

    return {
        io,
        emitToUser: (userId, event,  payload) => {
            const socketId = connectedUsers.get(userId);
            if (socketId) {
                io.to(socketId).emit(event, payload)
            }
        }
    }
}

module.exports = initializeSocket