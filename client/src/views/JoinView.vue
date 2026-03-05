<template>
  <div class="join-box">
    <form ref="findForm" action="">
      <h1>Join Room</h1>
      <label>
        Enter room code:
        <input ref="findInput" id="findInput" autocomplete="off" placeholder="000-000" type="text" />
      </label>
      <button ref="findRoomButton">Find Room</button>
      <div ref="roomFoundMsg" id="roomFoundMsg"></div>
      <br>
    </form>
    <form ref="nameForm" action="" style="display: none;">
      <label>
        Enter your name:
        <input ref="nameInput" autocomplete="off" placeholder="name" type="text"/>
      </label>
      <button>Join Room</button>
    </form>
    <div ref="errorMsg" id="errorMsg" style="color: red;"></div>
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
        joinRoom(this.$refs.findInput.value, this.$refs.nameInput.value, (err = undefined) => {
          if(!err) {
            this.$router.push("/ide");
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
        findRoom(this.$refs.findInput.value, (foundRoom) => {
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
  }
}
</script>

<style scoped>

form {
  background: rgba(0, 0, 0, 0.15);
  display: flex;
  flex-direction: column;
  gap: 15px;
}
input[type='text'] {
  border: none;
  padding: 0 1rem;
  margin: 0.25rem;
  height: 1.5rem;
}
form > button {
  background: #333;
  border: none;
  padding: 0 1rem;
  margin: 0.25rem;
  border-radius: 3px;
  outline: none;
  color: #fff;
  height: 2rem;
}
form > button:disabled {
  background: #151515;
  color: #aaa;
}
label {
  display: flex;
  flex-direction: column;
  align-items: start;
}

#roomFoundMsg, #errorMsg {
  text-align: left;
}
</style>