const express = require('express');
const { createServer } = require('node:http');
const { join } = require('node:path');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = createServer(app);

const io = new Server(server, {
    cors: {
        origin: process.env.CLIENT_ORIGIN
    }
});

const PORT = process.env.PORT || 3000;

app.use(express.static(join(__dirname, '../client/dist')));

app.get("/", (req, res) => {
    res.send("<a href='/rooms'>rooms</a><br><a href='/sockets'>sockets</a>");
})
app.get('/rooms', function(req, res){
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(rooms, null, 4));
});
app.get('/sockets', function(req, res){
    res.header("Content-Type",'application/json');
    res.send(JSON.stringify(Object.fromEntries(
        Array.from(io.sockets.sockets.entries()).map(([id, s]) => [
            id,
            {
                name: s.name,
                room: s.roomCode,
                role: s.role
            }
        ])
    ), null, 4));
});

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
    socket.role = "";

    console.log('a user connected: ' + socket.id);
    socket.on('disconnect', () => {
        console.log('a user disconnected: ' + socket.id);
        if(!rooms[socket.roomCode]) return;
        if(socket.role === "student") {
            delete rooms[socket.roomCode].students[socket.id];
        } else if(socket.role === "instructor") {
            Object.keys(rooms[socket.roomCode].students).forEach((studentID) => {
                console.log(studentID);
                socket.to(studentID).emit('disconnectRoom', "Instructor has disconnected.");
            });
            delete rooms[socket.roomCode];
        }
    });

    socket.on('endSession', () => {
        if(!rooms[socket.roomCode]) return;
        Object.keys(rooms[socket.roomCode].students).forEach((studentID) => {
            console.log(studentID);
            socket.to(studentID).emit('disconnectRoom', "instructor has ended the session.");
        });
        delete rooms[socket.roomCode];
    })

    socket.on("findRoom", (roomCode, callback) => {
        callback(rooms[roomCode]);
    });

    socket.on('joinRoom', (roomCode, name, callback) => {
        joinRoom(roomCode, name, "student", callback);
    });

    socket.on("createRoom", (roomName, instructorName, html, css, js, callback) => {
        const roomCode = generateRoomCode();
        rooms[roomCode] = {roomName, instructorName, instructorID: socket.id, html, css, js, students: {}};
        joinRoom(roomCode, instructorName, "instructor", callback);
    });

    function joinRoom(roomCode, name, role, callback) {
        try {
            socket.leave(socket.roomCode);
            socket.name = name;
            socket.roomCode = roomCode;
            socket.role = role;
            socket.join(roomCode);
            if(role === "student") {
                rooms[roomCode].students[socket.id] = {
                    name: name,
                    activity: null
                };
            }
            console.log(role + " " + name + " joined room " + roomCode);
            callback();
        } catch (error) {
            callback(error);
        }
    }

    socket.on("getConnectionInfo", (callback) => {
        callback(socket.roomCode, rooms[socket.roomCode], socket.name, socket.role);
    });

    socket.on("getStudentList", (callback) => {
        callback(rooms[socket.roomCode]?.students);
    });

    socket.on("connectViewCode", (conID) => {
        console.log("connectViewCode", socket.id, conID);
        socket.to(conID).emit("connectViewCode", socket.id);
    });

    socket.on("requestEditCode", (reqID) => {
        console.log("requestEditCode", socket.id, reqID);
        socket.to(reqID).emit("requestEditCode", socket.id);
    });

    socket.on("cancelEditRequest", (reqID) => {
        console.log("cancelEditRequest", socket.id, reqID);
        socket.to(reqID).emit("cancelEditRequest");
    });

    socket.on("connectEditCode", (conID, code) => {
        console.log("connectEditCode", socket.id, conID, code);
        socket.to(conID).emit("connectEditCode", socket.id, code);
    });

    socket.on("rejectEditRequest", (conID) => {
        console.log("rejectEditRequest", socket.id, conID);
        socket.to(conID).emit("rejectEditRequest");
    });

    socket.on("sendCodeView", (shareID, code) => {
        console.log("sendCodeView", socket.id, code);
        socket.to(shareID).emit("sendCodeView", socket.id, code);
    });

    socket.on("sendCodeEdit", (shareID, code) => {
        console.log("sendCodeEdit", socket.id, code);
        socket.to(shareID).emit("sendCodeEdit", socket.id, code);
    });

    socket.on("disconnectViewCode", (conID) => {
        console.log("disconnectViewCode", socket.id, conID);
        socket.to(conID).emit("disconnectViewCode");
    });

    socket.on("disconnectEditCode", (conID) => {
        console.log("disconnectEditCode", socket.id, conID);
        socket.to(conID).emit("disconnectEditCode");
    });

    socket.on("getActivityList", async (callback) => {
        let studentActivityList = rooms[socket.roomCode]?.students;

        const promises = Object.keys(studentActivityList).map(studentID => {
            const targetSocket = io.sockets.sockets.get(studentID);

            if (!targetSocket) {
                console.log("Socket not found:", studentID);
                return Promise.resolve();
            }

            return new Promise((resolve) => {
                const timeout = setTimeout(() => {
                    console.log(`Timeout from ${studentID}`);
                    resolve();
                }, 2000);

                targetSocket.emit("getActivity", (activity) => {
                    clearTimeout(timeout);
                    console.log("Received activity from", studentID, activity);

                    studentActivityList[studentID].activity = activity;
                    resolve();
                });
            });
        });

        await Promise.all(promises);

        callback(studentActivityList);
    });
});

server.listen(PORT, () => {
    console.log(`server running at http://localhost:${PORT}`);
});