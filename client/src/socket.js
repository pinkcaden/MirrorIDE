import { reactive } from "vue";
import { io } from "socket.io-client";

export const state = reactive({
    connected: false,
    messages: []
});

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";

export const socket = io(URL);

socket.on("connect", () => {
    state.connected = true;
});

socket.on("disconnect", () => {
    state.connected = false;
});

export function findRoom(roomCode, callback) {
    socket.emit("findRoom", roomCode, callback);
}

export function joinRoom(roomCode, name, callback) {
    state.messages = [];
    socket.emit("joinRoom", roomCode, name, callback);
}

export function createRoom(roomName, instructorName, html, css, javascript, callback) {
    state.messages = [];
    socket.emit("createRoom", roomName, instructorName, html, css, javascript, callback);
}

export function submitMessage(msg, callback) {
    socket.emit('chat message', msg);
    callback();
}

export async function getConnectionInfo() {
    return new Promise((resolve) => {
        socket.emit("getConnectionInfo", (roomCode, name) => {
            resolve({ roomCode, name });
        });
    });
}

socket.on('chat message', (msg, name) => {
    state.messages.push({msg, name});
});