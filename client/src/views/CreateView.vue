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
            this.$router.push("/chat");
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

form {
  width: 100%;
  background: rgba(0, 0, 0, 0.15);
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