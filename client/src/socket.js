import { reactive } from "vue";
import { io } from "socket.io-client";

export const state = reactive({
    connected: false,
    code: {},
    shareIn: {},
    shareOut: {}
});

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";

export const socket = io(URL);

let shareOutInterval = null;

socket.on("connect", () => {
    state.connected = true;
});

socket.on("disconnect", () => {
    state.connected = false;
});

socket.on("connectViewCode", (shareID) => {
    state.shareOut = {id: shareID, type: "view", codeChanged: true};
    clearInterval(shareOutInterval);
    function sendViewCode() {
        if(state.shareOut.codeChanged) {
            socket.emit("sendViewCode", shareID, state.code);
            state.shareOut.codeChanged = false;
        }
    }
    sendViewCode();
    shareOutInterval = setInterval(sendViewCode, 1000);
});
socket.on("disconnectViewCode", () => {
    state.shareOut = {};
    clearInterval(shareOutInterval);
});

socket.on("sendViewCode", (fromID, fromName, code) => {
    console.log("got code: ", code);
    console.log(fromID);
    if(state.shareIn.id === fromID) {
        state.shareIn.type = "view";
        state.shareIn.studentName = fromName;
        state.shareIn.html = code.html;
        state.shareIn.javascript = code.javascript;
        state.shareIn.css = code.css;
    }
});

export function connectViewCode(conID) {
    if(state.shareIn.id) {
        disconnectViewCode();
    }
    state.shareIn.id = conID;
    socket.emit("connectViewCode", conID);
}

export function disconnectViewCode() {
    socket.emit("disconnectViewCode", state.shareIn.id);
    state.shareIn = {};
}

export function findRoom(roomCode, callback) {
    socket.emit("findRoom", roomCode, callback);
}

export function joinRoom(roomCode, name, callback) {
    socket.emit("joinRoom", roomCode, name, callback);
}

export function createRoom(roomName, instructorName, html, css, javascript, callback) {
    socket.emit("createRoom", roomName, instructorName, html, css, javascript, callback);
}

export async function getConnectionInfo() {
    return new Promise((resolve) => {
        socket.emit("getConnectionInfo", (roomCode, room, name, role) => {
            resolve({ roomCode, room, name, role });
        });
    });
}

export async function getStudentList() {
    return new Promise((resolve) => {
        socket.emit("getStudentList", (studentList) => {
            resolve(studentList);
        });
    });
}

export async function getStudentCode(studentID) {
    return new Promise((resolve) => {
        socket.emit("getStudentCode", studentID, (studentCode) => {
            resolve(studentCode);
        });
    });
}