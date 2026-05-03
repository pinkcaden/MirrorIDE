<template>
  <div class="join-box">
    <form ref="createForm" action="">
      <h1>Create Room</h1>
      <label>
        Room Name
        <input ref="roomNameInput" data-testid="room-name-input" autocomplete="off" type="text" />
      </label>
      <label>
        Instructor Name
        <input ref="instructorNameInput" data-testid="instructor-name-input" autocomplete="off" type="text" />
      </label>

      <div id="languageOptions">
        Language Options
        <p>Select the languages you'd like to be included in this session.</p>
        <div id="languageLabels">
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
      </div>

      <div id="shareCodeOptions">
        <label>
          <input ref="shareCodeInput" type="checkbox" checked/>
          Share code
        </label>
        <p>Let students view your code live, great for code-along sessions.</p>
      </div>
      <button data-testid="create-room-btn">Create Room</button>
    </form>
    <div ref="errorMsg" data-testid="create-room-error" style="color: red;"></div>
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
      if(!this.$refs.instructorNameInput.value || !this.$refs.roomNameInput.value) {
        this.$refs.errorMsg.innerHTML = "Please fill all required fields to create a room.";
      } else {
        createRoom(
            this.$refs.roomNameInput.value,
            this.$refs.instructorNameInput.value,
            this.$refs.htmlInput.checked,
            this.$refs.cssInput.checked,
            this.$refs.javascriptInput.checked,
            this.$refs.shareCodeInput.checked,
            (err = undefined) => {
              if (!err) {
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
  gap: 20px;
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
  flex-direction: column;
  align-items: flex-start;
}
#languageOptions > p {
  margin-bottom: 5px;
}
#languageLabels {
  display: flex;
  flex-direction: row;
  gap: 20px;
  justify-content: center;
}
#languageLabels > label {
  flex-direction: row;
  align-items: center;
  gap: 5px;
}
p {
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  text-align: left;
}

#shareCodeOptions {
  display: flex;
  flex-direction: column;
  justify-content: center;
}
#shareCodeOptions > label {
  flex-direction: row;
  align-items: center;
  gap: 5px;
}
</style>