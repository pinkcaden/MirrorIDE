<template>
  <div class="chat">
    <div id="roomCode" v-if="connectionInfo?.roomCode && connectionInfo?.name">
      You are in room {{ connectionInfo.roomCode }} as {{ connectionInfo.name }}
    </div>
    <div v-else>
      You are not currently in a room.
    </div>

    <ul id="messages">
      <li v-for="(message, index) in state.messages" :key="index">
        <strong>{{ message.name }}:</strong> {{ message.msg }}
      </li>
    </ul>

    <form id="msgForm" @submit.prevent="handleSubmit" v-if="connectionInfo?.roomCode && connectionInfo?.name">
      <input
          id="msgInput"
          v-model="newMessage"
          autocomplete="off"
      />
      <button>Send</button>
    </form>
  </div>
</template>

<script>
import { state, submitMessage, getConnectionInfo } from "../socket";

export default {
  name: "ChatBox",

  data() {
    return {
      state,
      connectionInfo: null,
      newMessage: ""
    };
  },

  async mounted() {
    this.connectionInfo = await getConnectionInfo();
  },

  methods: {
    handleSubmit() {
      if (!this.newMessage) return;

      submitMessage(this.newMessage, () => {
        this.newMessage = "";
      });
    }
  }
};
</script>

<style scoped>
.chat {
  position: fixed;
  top: 30px;
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