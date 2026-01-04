// socket.js
let io;

function init(httpServer) {
    io = require('socket.io')(httpServer, {
        cors: {
            origin: ["http://localhost:5173", "http://localhost:4173"],
            methods: ["GET", "POST"]
        }
    });

    io.on('connection', (socket) => {
        console.log('A user connected via WebSocket:', socket.id);
        socket.on('joinGroup', (groupId) => {
            socket.join(`group-${groupId}`);
            console.log(`Socket ${socket.id} joined room group-${groupId}`);
        });
        socket.on('disconnect', () => {
            console.log('User disconnected via WebSocket:', socket.id);
        });
    });
    
    return io;
}

function getIo() {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
}

module.exports = { init, getIo };