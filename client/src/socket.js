import { reactive } from "vue";
import { io } from "socket.io-client";

// "undefined" means the URL will be computed from the `window.location` object
const URL = process.env.NODE_ENV === "production" ? undefined : "http://localhost:3000";

const socket = io(URL);

let sendCodeViewInterval = null;
let sendCodeEditInterval = null;

export function findRoom(roomCode, callback) {
    socket.emit("findRoom", roomCode, callback);
}

export function joinRoom(roomCode, name, callback) {
    socket.emit("joinRoom", roomCode, name, callback);
}

export function createRoom(roomName, instructorName, html, css, javascript, callback) {
    socket.emit("createRoom", roomName, instructorName, html, css, javascript, callback);
}

//IDE state
export const state = reactive({
    connectionInfo: null,

    // studentList map in this format
    // {
    //      studentID: {
    //          name: name,
    //          activity: {
    //              lines: lines,
    //              lastEdit: lastEdit
    //          }
    //      }
    // }
    studentList: null,
    shareInView: null,
    shareOutView: null,
    shareInEdit: null,
    shareOutEdit: null,

    getActivity() {
        console.log("getActivity called before set");
        return {
            lines: 24,
            lastEdit: 12
        };
    },

    getConnectionInfo() {
        socket.emit("getConnectionInfo", (roomCode, room, name, role) => {
            this.connectionInfo = { roomCode, room, name, role };
        });
    },

    getStudentList() {
        socket.emit("getStudentList", (studentList) => {
            //gets student list without activity first since its faster
            this.studentList = studentList;
        });
        socket.emit("getActivityList", (studentActivityList) => {
            //gets student list including activity
            this.studentList = studentActivityList;
            console.log(this.studentList);
        });
    },

    connectViewCode(conID, conName) {
        if(this.shareInView.id) {
            this.disconnectViewCode();
        }
        if(this.shareOutEdit.id) {
            this.disconnectEditCode();
        }
        this.shareInView.id = conID;
        socket.emit("connectViewCode", conID);
    },

    disconnectViewCode() {
        socket.emit("disconnectViewCode", this.shareInView.id);
        this.shareInView = null;
    },

    requestEditCode(conID, conName) {
        if(this.shareInView.id) {
            this.disconnectViewCode();
        }
        if(this.shareOutEdit.id) {
            this.disconnectEditCode();
        }
        this.shareOutEdit.requestID = conID;
        this.shareOutEdit.requestName = conName;
        socket.emit("requestEditCode", conID);
    },

    connectEditCode() {
        this.shareInEdit.id = this.shareInEdit.requestID;
        delete this.shareInEdit.requestID;
        socket.emit("connectEditCode", this.shareInEdit.id, this.shareOutView.code);
    },

    disconnectEditCode() {
        socket.emit("disconnectEditCode", this.shareOutEdit.id);
        this.shareOutEdit = null;
        clearInterval(sendCodeEditInterval);
    },

    setShareOutViewCode(code) {
        this.shareOutView.codeChanged = true;
        this.shareOutView.code = code;
    },

    setShareOutEditCode(code) {
        this.shareOutEdit.codeChanged = true;
        this.shareOutEdit.code = code;
    }
});

socket.on("connectViewCode", (shareID) => {
    state.shareOutView = {id: shareID, codeChanged: true};
    clearInterval(sendCodeViewInterval);

    function sendCodeView() {
        if (state.shareOutView.codeChanged) {
            socket.emit("sendCodeView", shareID, state.shareOutView.code);
            state.shareOutView.codeChanged = false;
        }
    }

    sendCodeView();
    sendCodeViewInterval = setInterval(sendCodeView, 1500);
});

//TODO what if viewee connection drops? need to disconnect viewer in this case. same for edit
socket.on("disconnectViewCode", () => {
    state.shareOutView = null;
    clearInterval(sendCodeViewInterval);
});

socket.on("requestEditCode", (reqID) => {
    state.shareInEdit.requestID = reqID;
});

socket.on("connectEditCode", (shareID, code) => {
    if(state.shareOutEdit.requestID === shareID) {
        state.shareOutEdit = {id: shareID, name: state.shareOutEdit.requestName, code: code, codeChanged: false};
        clearInterval(sendCodeEditInterval);

        function sendCodeEdit() {
            if (state.shareOutEdit.codeChanged) {
                socket.emit("sendCodeEdit", shareID, state.shareOutEdit.code);
                state.shareOutEdit.codeChanged = false;
            }
        }

        sendCodeEditInterval = setInterval(sendCodeEdit, 1500);
    } else {
        console.log("error: received connectEditCode from non-requested student");
    }
});

socket.on("disconnectEditCode", () => {
    state.shareInEdit = null;
});

socket.on("sendCodeView", (fromID, code) => {
    console.log(fromID);
    console.log("got code to view: ", code);

    if(state.shareInView.id === fromID) {
        state.shareInView.code = code;
    }
});

socket.on("sendCodeEdit", (fromID, code) => {
    console.log(fromID);
    console.log("got edited code: ", code);

    if(state.shareInEdit.id === fromID) {
        state.shareInEdit.code = code;
    }
});

socket.on("getActivity", (callback) => {
    callback(state.getActivity());
});