<template>
  <div class="join-page">
    <div class="join-box" data-testid="join-room-view">
      <form ref="findForm" action="" data-testid="find-room-form">
        <h1>Join Room</h1>
        <label>
          Enter room code:
          <input ref="findInput" id="findInput" data-testid="find-room-code-input" autocomplete="off" placeholder="000-000" v-model="formattedValue" @input="formatInput" type="text"/>
        </label>
        <button ref="findRoomButton" data-testid="find-room-btn">Find Room</button>
        <div ref="roomFoundMsg" data-testid="room-found-message" id="roomFoundMsg"></div>
        <br>
      </form>
      <form ref="nameForm" action="" data-testid="join-name-form" style="display: none;">
        <label>
          Enter your name:
          <input ref="nameInput" autocomplete="off" data-testid="student-name-input" placeholder="name" type="text"/>
        </label>
        <button data-testid="join-room-btn">Join Room</button>
      </form>
      <div ref="errorMsg" id="errorMsg" data-testid="join-room-error" style="color: red;"></div>
    </div>
  </div>
</template>

<script>
import { joinRoom, findRoom } from "../socket";

export default {
  name: "JoinRoom",
  mounted() {
    this.$refs.nameForm.addEventListener('submit', (event) => {
      event.stopPropagation();
      event.preventDefault();
      if (this.$refs.nameInput.value) {
        const roomCode = this.$refs.findInput.value.replace(/-/g, '');
        joinRoom(roomCode, this.$refs.nameInput.value, (err = undefined) => {
          if(!err) {
            this.$router.push("/student");
          } else {
            this.$refs.errorMsg.innerHTML = "Failed to create room. " + err;
          }
        });
      }
    });

    this.$refs.findForm.addEventListener('submit', (event) => {
      event.stopPropagation();
      event.preventDefault();
      if(this.$refs.findInput.value) {
        const roomCode = this.$refs.findInput.value.replace(/-/g, '');
        findRoom(roomCode, (foundRoom) => {
          if(foundRoom) {
            this.$refs.roomFoundMsg.innerHTML = 'Joining "' + foundRoom["roomName"] + '" with ' + foundRoom["instructorName"];
            this.$refs.roomFoundMsg.style.color = "green";
            this.$refs.nameForm.style.display = "flex";
            this.$refs.findInput.readOnly = true;
            this.$refs.findRoomButton.disabled = true;
          } else {
            this.$refs.roomFoundMsg.innerHTML = "Room not found.";
            this.$refs.roomFoundMsg.style.color = "red";
          }
        });
      }
    });
  },
  data() {
    return {
      formattedValue: ''
    };
  },
  methods: {
    formatInput(event) {
      let value = event.target.value;
      let alphaNumeric = value.replace(/[^a-zA-Z0-9]/g, '');
      let limited = alphaNumeric.slice(0,6);
      let formatted = limited.replace(/(.{3})(?=[^\s])/g, '$1-');
      this.formattedValue = formatted;
      event.target.value = formatted;
    }
  }
}
</script>
<style scoped>
.join-page {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 2rem;
}
.join-box {
  width: min(900px, 92vw);
  min-height: 520px;
  border: 1px solid #333;
  border-radius: 28px;
  padding: 3rem 3.5rem;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
  display: flex;
  flex-direction: column;
  justify-content: center;
}

.join-box h1 {
  font-size: clamp(3rem, 6vw, 5rem);
  margin: 0 0 1.25rem 0;
  text-align: center;
}
form {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  background: transparent;
}

label {
  display: block;
  font-size: 1.1rem;
  text-align: left;
  margin-bottom: 0.25rem;
}
.join-box input[type="text"] {
  width: 100%;
  height: 72px;
  background: #141414;
  color: #fff;
  border: 1px solid #333;
  border-radius: 18px;
  padding: 0 1.25rem;
  outline: none;
  box-sizing: border-box;
  font-size: 1.15rem;
  margin: 0;
}
.join-box input[type="text"]:focus {
  border-color: #2b7cff;
  box-shadow: 0 0 0 3px rgba(43, 124, 255, 0.15);
}
.join-box button {
  width: 180px;
  height: 60px;
  background: #161616;
  color: #fff;
  border: 1px solid #333;
  border-radius: 16px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
  font-size: 1rem;
  margin-top: 0.75rem;
}
.join-box button:hover {
  background: #1f1f1f;
  border-color: #444;
}
form > button:disabled {
  background: #151515;
  color: #aaa;
}
#roomFoundMsg,
#errorMsg {
  text-align: left;
  margin-top: 0.75rem;
}
@media (max-width: 700px) {
  .join-box {
    padding: 2rem 1.5rem;
    min-height: auto;
  }

  .join-box h1 {
    font-size: 2.5rem;
  }

  .join-box input[type="text"] {
    height: 60px;
  }

  .join-box button {
    width: 100%;
  }
}
</style>