import { reactive } from "vue";
import { io } from "socket.io-client";
import router from "./router";

// "undefined" means the URL will be computed from the `window.location` object
const URL = import.meta.env.PROD === "production" ? undefined : "http://localhost:3000";

const socket = io(URL);

let sendCodeViewInterval = null;
let sendCodeEditInterval = null;

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
    connected: false,
    connectionInfo: {},

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
    studentList: {},
    shareInView: {
        id: null,
        code: null,
        name: null
    },
    shareOutView: {
        id: null,
        code: null,
        codeChanged: false
    },
    shareInEdit: {
        id: null,
        requestId: null,
        code: null
    },
    shareOutEdit: {
        id: null,
        requestId: null,
        requestName: null,
        initialCode: null,
        code: null,
        name: null,
        codeChanged: false
    },
    isViewing: false,
    isEditing: false,

    getActivity() {
        console.log("getActivity called before set");
        return {
            lines: "error",
            lastEdit: "error"
        };
    },

    async getConnectionInfo() {
        await new Promise((resolve) => {
            socket.emit("getConnectionInfo", (roomCode, room, name, role) => {
                state.connectionInfo.roomCode = roomCode;
                state.connectionInfo.room = room;
                state.connectionInfo.name = name;
                state.connectionInfo.role = role;
                state.connected = true;
                resolve();
            });
        });
    },

    getStudentList() {
        socket.emit("getStudentList", (studentList) => {
            //gets student list without activity first since its faster
            state.studentList = studentList;
        });
    },

    getActivityList() {
        socket.emit("getActivityList", (studentActivityList) => {
            //gets student list including activity
            console.log("GETTING STUDENT ACTIVITY LIST");
            state.studentList = studentActivityList;
        });
    },

    connectViewCode(conID, conName) {
        if(conID === state.shareInView.id || conID === state.shareOutEdit.id || conID === null) return;

        if(state.isViewing) {
            state.disconnectViewCode();
        }
        if(state.isEditing) {
            state.disconnectEditCode();
        }

        state.isViewing = true;
        state.shareInView.id = conID;
        state.shareInView.name = conName;
        socket.emit("connectViewCode", conID);
    },

    disconnectViewCode() {
        state.isViewing = false;
        socket.emit("disconnectViewCode", state.shareInView.id);
        state.shareInView.id = null;
        state.shareInView.code = null;
    },

    requestEditCode(conID, conName) {
        state.shareOutEdit.requestId = conID;
        state.shareOutEdit.requestName = conName;
        socket.emit("requestEditCode", conID);
    },

    cancelEditRequest() {
        socket.emit("cancelEditRequest", state.shareOutEdit.requestId);
        state.shareOutEdit.requestId = null;
        state.shareOutEdit.requestName = null;
    },

    connectEditCode() {
        state.shareInEdit.id = state.shareInEdit.requestId;
        state.shareInEdit.requestId = null;
        socket.emit("connectEditCode", state.shareInEdit.id, state.shareOutView.code);
    },

    rejectEditRequest() {
        socket.emit("rejectEditRequest", state.shareInEdit.requestId);
        state.shareInEdit.requestId = null;
    },

    disconnectEditCode() {
        state.isEditing = false;
        socket.emit("disconnectEditCode", state.shareOutEdit.id);
        state.shareOutEdit.id = null;
        state.shareOutEdit.requestId = null;
        state.shareOutEdit.requestName = null;
        state.shareOutEdit.code = null;
        state.shareOutEdit.initialCode = null;
        state.shareOutEdit.name = null;
        state.shareOutEdit.codeChanged = false;
        clearInterval(sendCodeEditInterval);
    },

    setShareOutViewCode(code) {
        state.shareOutView.codeChanged = true;
        state.shareOutView.code = code;
        console.log("setShareOutViewCode", state.shareOutView.code);
    },

    setShareOutEditCode(code) {
        state.shareOutEdit.codeChanged = true;
        state.shareOutEdit.code = code;
    },

    endSession() {
        socket.emit("endSession");
        router.push('/');
    }
});

socket.on("connectViewCode", (shareID) => {
    state.shareOutView.id = shareID;
    state.shareOutView.codeChanged = true;
    clearInterval(sendCodeViewInterval);

    function sendCodeView() {
        if (state.shareOutView.codeChanged) {
            socket.emit("sendCodeView", shareID, state.shareOutView.code);
            state.shareOutView.codeChanged = false;
            console.log("sendCodeView", shareID, state.shareOutView.code);
        }
    }

    sendCodeView();
    sendCodeViewInterval = setInterval(sendCodeView, 1500);
});

//TODO what if viewee connection drops? need to disconnect viewer in this case. same for edit
socket.on("disconnectViewCode", () => {
    console.log("disconnectViewCode");
    state.shareOutView.id = null;
    //DO NOT clear state.shareOutView.code, this should always be a live reflection of the main ide code
    clearInterval(sendCodeViewInterval);
});

socket.on("requestEditCode", (reqID) => {
    state.shareInEdit.requestId = reqID;
});

socket.on("cancelEditRequest", () => {
    state.shareInEdit.requestId = null;
});

socket.on("connectEditCode", (shareID, code) => {
    if(state.shareOutEdit.requestId === shareID) {
        if(state.isViewing) state.disconnectViewCode();

        state.isEditing = true;

        state.shareOutEdit.id = shareID;
        state.shareOutEdit.name = state.shareOutEdit.requestName;
        state.shareOutEdit.requestId = null;
        state.shareOutEdit.requestName = null;
        state.shareOutEdit.initialCode = code;
        state.shareOutEdit.codeChanged = false;
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

socket.on("rejectEditRequest", () => {
    state.shareOutEdit.requestId = null;
    state.shareOutEdit.requestName = null;
    console.log("request rejected");
});

socket.on("disconnectEditCode", () => {
    state.shareInEdit.id = null;
    state.shareInEdit.code = null;
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

socket.on("disconnectRoom", (msg = null) => {
    if(msg) alert(msg);
    router.push('/');
});