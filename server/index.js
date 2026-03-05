const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173"
    }
});

app.use(express.static(join(__dirname, '../client/dist')));

let rooms = {};

const codeChars = [
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'j', 'k', 'm', 'n', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
    '1', '2', '3', '4', '5', '6', '7', '8', '9'
];

function generateRoomCode() {
    let roomCode = "";
    let cont = true;
    while(cont) {
        roomCode = "";
        for (let i = 0; i < 6; i++) {
            roomCode += codeChars[Math.floor(Math.random() * (codeChars.length - 1))];
        }
        cont = roomCode in rooms;
    }
    return roomCode;
}

io.on('connection', (socket) => {
    socket.name = "";
    socket.roomCode = "";

    console.log('a user connected: ' + socket.id);
    socket.on('disconnect', () => {
        console.log('a user disconnected: ' + socket.id);
    });

    socket.on("findRoom", (roomCode, callback) => {
        callback(rooms[roomCode]);
    });

    socket.on('joinRoom', (roomCode, name, callback) => {
        joinRoom(roomCode, name, "student", callback);
    });

    socket.on("createRoom", (roomName, instructorName, html, css, javascript, callback) => {
        const roomCode = generateRoomCode();
        rooms[roomCode] = {roomName, instructorName, html, css, javascript};
        joinRoom(roomCode, instructorName, "instructor", callback);
    });

    function joinRoom(roomCode, name, role, callback) {
        try {
            socket.leave(socket.roomCode);
            socket.name = name;
            socket.roomCode = roomCode;
            socket.role = role;
            socket.join(roomCode);
            console.log(socket.id + " joined room " + roomCode);
            callback();
        } catch (error) {
            callback(error);
        }
    }

    socket.on("getConnectionInfo", (callback) => {
        callback(socket.roomCode, rooms[socket.roomCode], socket.name, socket.role);
        console.log(rooms[socket.roomCode]);
    });
});

server.listen(3000, () => {
    console.log('server running at http://localhost:3000');
});