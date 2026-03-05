<template>
  <div id="ide">
    <div id="roomCode" v-if="connectionInfo">
      Room code: {{ connectionInfo.roomCode }}<br>
      Room name: {{connectionInfo.room['roomName']}}<br>
      Instructor name: {{connectionInfo.room['instructorName']}}<br>
      Your name: {{connectionInfo.name}}<br>
      Your role: {{connectionInfo.role}}<br>
      Languages: <span v-if="connectionInfo.room['html']">HTML </span><span v-if="connectionInfo.room['javascript']">JS </span><span v-if="connectionInfo.room['css']">CSS</span>
    </div>
    <div v-else>
      You are not currently in a room.
    </div>

    <br>

    <div id="codeBoxes" v-if="connectionInfo">
      <label v-if="connectionInfo.room['html']">
        html
        <input id="htmlBox" ref="htmlBox" type="text"/>
      </label>
      <label v-if="connectionInfo.room['javascript']">
        js
        <input id="jsBox" ref="jsBox" type="text"/>
      </label>
      <label v-if="connectionInfo.room['css']">
        css
        <input id="cssBox" ref="cssBox" type="text"/>
      </label>
    </div>
  </div>
</template>

<script>
import { getConnectionInfo } from "../socket";

export default {
  name: "FakeIDEView",

  data() {
    return {
      connectionInfo: null,
    };
  },

  async mounted() {
    this.connectionInfo = await getConnectionInfo();
  },

  methods: {
    sendCode() {
      let html = this.$refs.htmlBox.innerText;
      let js = this.$refs.jsBox.innerText;
      let css = this.$refs.cssBox.innerText;


    }
  }
};
</script>

<style scoped>
#ide {
  position: fixed;
  top: 30px;
}
#codeBoxes {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
#codeBoxes input[type="text"] {
  width: 200px;
  height: 100px;
}
#codeBoxes label {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
#msgForm {
  background: rgba(0, 0, 0, 0.15);
  padding: 0.25rem;
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  display: flex;
  height: 3rem;
  box-sizing: border-box;
  backdrop-filter: blur(10px);
}
#msgInput {
  border: none;
  padding: 0 1rem;
  flex-grow: 1;
  border-radius: 2rem;
  margin: 0.25rem;
}
#msgInput:focus {
  outline: none;
}
#msgForm > button {
  background: #333;
  border: none;
  padding: 0 1rem;
  margin: 0.25rem;
  border-radius: 3px;
  outline: none;
  color: #fff;
}

#messages {
  list-style-type: none;
  margin: 0;
  padding: 0;
}

#messages > li {
  padding: 0.5rem 1rem;
  text-align: left;
}

#messages > li:nth-child(odd) {
  background: rgba(255, 255, 255, 0.04);
}

#roomCode {
  color: green;
}
</style>