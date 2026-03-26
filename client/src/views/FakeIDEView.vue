<template>
  <div id="ide">
    <div id="roomCode" v-if="state.connectionInfo">
      Room code: {{ state.connectionInfo.roomCode }}<br>
      Room name: {{state.connectionInfo.room['roomName']}}<br>
      Instructor name: {{state.connectionInfo.room['instructorName']}}<br>
      Your name: {{state.connectionInfo.name}}<br>
      Your role: {{state.connectionInfo.role}}<br>
      Languages: <span v-if="state.connectionInfo.room['html']">HTML </span><span v-if="state.connectionInfo.room['javascript']">JS </span><span v-if="state.connectionInfo.room['css']">CSS</span>
      <br><br>

      <div v-if="state.connectionInfo.role === 'instructor'">
        <button @click="toggleStudentList()">Toggle Student List</button>
        <br><br>
        <div v-if="showStudentList && state.studentList">
          <div v-if="Object.keys(state.studentList).length > 0" id="student-list">
            Student List:
            <div class="list-item" v-for="(student, id) in state.studentList"> {{student}} <button @click="state.connectViewCode(id)">View Code</button></div>
          </div>
          <div v-else>No students currently in session.</div>
          <br>
        </div>
      </div>
    </div>
    <div v-else>
      You are not currently in a room.
    </div>

    <div v-if="state.shareOut.type === 'view'">
      Your instructor is viewing your code.
      <br><br>
    </div>
    <div class="code-boxes" v-if="state.connectionInfo">
      <br>
      <label v-if="state.connectionInfo.room['html']">
        html
        <input id="htmlBox" ref="htmlBox" type="text" v-model="state.code.html" @input="state.shareOutChange()"/>
      </label>
      <label v-if="state.connectionInfo.room['javascript']">
        js
        <input id="jsBox" ref="jsBox" type="text" v-model="state.code.javascript" @input="state.shareOutChange()"/>
      </label>
      <label v-if="state.connectionInfo.room['css']">
        css
        <input id="cssBox" ref="cssBox" type="text" v-model="state.code.css" @input="state.shareOutChange()"/>
      </label>
    </div>

    <div v-if="state.connectionInfo && state.shareIn.type">
      <br>
      <span v-if="state.shareIn.type === 'view'">Viewing </span>
      <span v-else-if="state.shareIn.type === 'edit'">Editing </span>
      {{state.shareIn.studentName}}'s Code.
      <br><br>
      <button @click="state.disconnectViewCode()">Stop Viewing</button>
      <br><br>
      <div class="code-boxes" >
        <label>
          Student html
          <input id="studentHtmlBox" ref="studentHtmlBox" type="text" v-model="state.shareIn.html" :readonly="state.shareIn.type === 'view'"/>
        </label>
        <label>
          Student js
          <input id="studentJsBox" ref="studentJsBox" type="text" v-model="state.shareIn.javascript" :readonly="state.shareIn.type === 'view'"/>
        </label>
        <label>
          Student css
          <input id="studentCssBox" ref="studentCssBox" type="text" v-model="state.shareIn.css" :readonly="state.shareIn.type === 'view'"/>
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { state } from "../socket";

export default {
  name: "FakeIDEView",

  data() {
    return {
      state: state,

      showStudentList: false
    };
  },

  async mounted() {
    this.state.getConnectionInfo();
  },

  methods: {
    async toggleStudentList() {
      if(this.showStudentList) {
        this.showStudentList = false;
      } else {
        this.state.getStudentList();
        this.showStudentList = true;
      }
    }
  }
};
</script>

<style scoped>
#ide {
  position: fixed;
  top: 30px;
}
.code-boxes {
  display: flex;
  flex-direction: row;
  gap: 15px;
}
.code-boxes input[type="text"] {
  width: 200px;
  height: 100px;
}
.code-boxes label {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
#student-list {
  display: flex;
  flex-direction: column;
  align-items: center;
}
.list-item {
  display: flex;
  flex-direction: row;
  gap: 10px;
  margin: 5px;
}

#roomCode {
  color: green;
}
</style>