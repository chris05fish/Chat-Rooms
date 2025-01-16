const express = require("express");
const http = require("http");
const { Server } = require("socket.io");

const app = express();
const server = http.createServer(app);
const io = new Server(server);

const PORT = 3000;

// Serve static files
app.use(express.static(__dirname + '/public'));

// WebSocket connection
io.on("connection", (socket) => {
    console.log("A user connected:", socket.id);

    // User joins a room
    socket.on("joinRoom", (room) => {
        console.log(`User ${socket.id} joined room: ${room}`);
        socket.join(room);
        // Notify everyone in the room except the sender
        socket.to(room).emit("newUser", socket.id);
        // Send existing users to the new user
        const usersInRoom = Array.from(io.sockets.adapter.rooms.get(room)).filter(id => id !== socket.id);
        socket.emit("existingUsers", usersInRoom);
    });

    // Handle WebRTC signaling messages
    socket.on("signal", (data) => {
        io.to(data.room).emit("signal", { user: socket.id, signal: data.signal });
    });

    // User disconnects
    socket.on("disconnect", () => {
        console.log("A user disconnected:", socket.id);
    });
});

server.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});
