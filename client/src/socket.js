import { reactive } from "vue";
import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";

const socket = io(URL);

export function findRoom(roomCode, callback) {
    socket.emit("findRoom", roomCode, callback);
}

export function joinRoom(roomCode, name, callback) {
    socket.emit("joinRoom", roomCode, name, callback);
}

export function createRoom(roomName, instructorName, html, css, js, callback) {
    socket.emit("createRoom", roomName, instructorName, html, css, js, callback);
}


//IDE state
export const state = reactive({
    code: {},
    connectionInfo: null,
    studentList: null,
    shareIn: {},
    shareOut: {},

    getConnectionInfo() {
        socket.emit("getConnectionInfo", (roomCode, room, name, role) => {
            this.connectionInfo = { roomCode, room, name, role };
        });
    },

    getStudentList() {
        socket.emit("getStudentList", (studentList) => {
            this.studentList = studentList;
        });
    },

    connectViewCode(conID) {
        if(this.shareIn.id) {
            this.disconnectViewCode();
        }
        this.shareIn.id = conID;
        socket.emit("connectViewCode", conID);
    },

    disconnectViewCode() {
        socket.emit("disconnectViewCode", this.shareIn.id);
        this.shareIn = {};
    },

    shareOutChange() {
        this.shareOut.codeChanged = true;
    }
});


//socket handlers
let shareOutInterval = null;

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
        state.shareIn.js = code.js;
        state.shareIn.css = code.css;
    }
});