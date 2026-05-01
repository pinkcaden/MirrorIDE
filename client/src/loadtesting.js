import { io } from "socket.io-client";
import {state} from "./socket.js";

export function simulateRooms(numRooms, numStudentsPerRoom) {
    const URL = import.meta.env.PROD ? undefined : "http://localhost:3000";

    for (let i = 0; i < numRooms; i++) {
        const instSocket = io(URL);

        instSocket.emit("createRoom", "SIMULATED ROOM " + i, "SIMULATED INSTRUCTOR " + i, true, true, true, false, async (err = undefined) => {
            if (!err) {
                let roomCode = "";

                await new Promise((resolve) => {
                    instSocket.emit("getConnectionInfo", (rc, room, name, role) => {
                        roomCode = rc;
                        resolve();
                    });
                });

                console.log("instructor " + i + " created room with code " + roomCode);

                for (let j = 0; j < numStudentsPerRoom; j++) {
                    const stuSocket = io(URL);

                    stuSocket.on("getActivity", (callback) => {
                        callback({
                            lines: "SIMULATED LINES",
                            lastEdit: "SIMULATED LAST EDIT"
                        });
                    });

                    await new Promise((resolve) => {
                        stuSocket.emit("joinRoom", roomCode, "SIMULATED STUDENT " + i + ":" + j, (err = undefined) => {
                            if (!err) {

                            } else {
                                return "ERROR: student " + j + " could not join room " + i;
                            }
                            resolve();
                        });
                    })
                }

                setInterval(() => {
                    instSocket.emit("getActivityList", (studentActivityList) => {
                        console.log("got activity list for room " + i);
                        console.log(studentActivityList);
                    });
                }, 5000);
            } else {
                return "ERROR: instructor " + i + " could not create room";
            }
        });
    }

    return "succesfully created " + numRooms + " rooms with " + numStudentsPerRoom + " students each.";
}