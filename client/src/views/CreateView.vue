<template>
  <div class="join-box">
    <form ref="createForm" action="">
      <h1>Create Room</h1>
      <label>
        Room Name
        <input ref="roomNameInput" autocomplete="off" type="text" />
      </label>
      <label>
        Instructor Name
        <input ref="instructorNameInput" autocomplete="off" type="text" />
      </label>
      <div id="languageOptions">
        <label>
          HTML <input ref="htmlInput" type="checkbox" checked/>
        </label>
        <label>
          CSS <input ref="cssInput" type="checkbox" checked/>
        </label>
        <label>
          Javascript <input ref="javascriptInput" type="checkbox" checked/>
        </label>
      </div>
      <button>Create Room</button>
    </form>
    <div ref="errorMsg" style="color: red;"></div>
  </div>
</template>

<script>
import { createRoom } from "../socket";

export default {
  name: "CreateRoom",
  mounted() {
    this.$refs.createForm.addEventListener('submit', (event) => {
      event.stopPropagation();
      event.preventDefault();
      if(this.$refs.roomNameInput.value && this.$refs.instructorNameInput.value) {
        createRoom(
            this.$refs.roomNameInput.value,
            this.$refs.instructorNameInput.value,
            this.$refs.htmlInput.checked,
            this.$refs.cssInput.checked,
            this.$refs.javascriptInput.checked,
            (err = undefined) => {
          if(!err) {
            // const formatted = roomCode.slice(0, 3) + "-" + roomCode.slice(3);
            // alert("Room created!\nCode: " + formatted);
            this.$router.push("/professor");
          } else {
            this.$refs.errorMsg.innerHTML = "Failed to create room. " + err;
          }
        });
      }
    });
  }
}
</script>

<style scoped>

.join-box {
  border: 1px solid #333;
  width: min(420px, 92vw);
  text-align: center;
  padding: 2rem;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.55);
}
.join-box h1, .join-box h2 {
  margin: 0 0 8px 0;
}
.join-box input[type="text"] {
  width: 100%;
  background: #141414;
  color: #fff;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 10px 12px;
  outline: none;
  box-sizing: border-box;
}
.join-box input[type="text"]:focus {
  border-color: #2b7cff;
  box-shadow: 0 0 0 3px rgba(43, 124, 255, 0.15);
}
.join-box button {
  width: 100%;
  background: #161616;
  color: #fff;
  border: 1px solid #333;
  border-radius: 8px;
  padding: 10px 12px;
  cursor: pointer;
  transition: background 0.15s ease, border-color 0.15s ease;
}
.join-box button:hover {
  background: #1f1f1f;
  border-color: #444;
}

form {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  gap: 15px;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
}
input[type='text'] {
  width: 100%;
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
  width: 100%
}
label {
  display: flex;
  flex-direction: column;
  align-items: start;
}
#languageOptions {
  display: flex;
  flex-direction: row;
  gap: 15px;
  justify-content: center;
}
#languageOptions > label {
  align-items: center;
}
</style>