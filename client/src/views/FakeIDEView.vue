<template>
  <div id="ide">
    <div id="roomCode" v-if="connectionInfo">
      Room code: {{ connectionInfo.roomCode }}<br>
      Room name: {{connectionInfo.room['roomName']}}<br>
      Instructor name: {{connectionInfo.room['instructorName']}}<br>
      Your name: {{connectionInfo.name}}<br>
      Your role: {{connectionInfo.role}}<br>
      Languages: <span v-if="connectionInfo.room['html']">HTML </span><span v-if="connectionInfo.room['javascript']">JS </span><span v-if="connectionInfo.room['css']">CSS</span>
      <br><br>

      <div v-if="connectionInfo.role === 'instructor'">
        <button @click="this.toggleStudentList()">Toggle Student List</button>
        <br><br>
        <div v-if="showStudentList && studentList">
          <div v-if="Object.keys(studentList).length > 0" id="student-list">
            Student List:
            <div class="list-item" v-for="(student, id) in studentList"> {{student}} <button @click="connectViewCode(id)">View Code</button></div>
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
    <div class="code-boxes" v-if="connectionInfo">
      <br>
      <label v-if="connectionInfo.room['html']">
        html
        <input id="htmlBox" ref="htmlBox" type="text" v-model="state.code.html" @input="shareOutChange()"/>
      </label>
      <label v-if="connectionInfo.room['javascript']">
        js
        <input id="jsBox" ref="jsBox" type="text" v-model="state.code.javascript" @input="shareOutChange()"/>
      </label>
      <label v-if="connectionInfo.room['css']">
        css
        <input id="cssBox" ref="cssBox" type="text" v-model="state.code.css" @input="shareOutChange()"/>
      </label>
    </div>

    <div v-if="connectionInfo && state.shareIn.type">
      <br>
      <span v-if="state.shareIn.type === 'view'">Viewing </span>
      <span v-else-if="state.shareIn.type === 'edit'">Editing </span>
      {{state.shareIn.studentName}}'s Code.
      <br><br>
      <button @click="disconnectViewCode()">Stop Viewing</button>
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
import { state, getConnectionInfo, getStudentList, connectViewCode, disconnectViewCode } from "../socket";

export default {
  name: "FakeIDEView",

  data() {
    return {
      state: state,
      connectViewCode: connectViewCode,
      disconnectViewCode: disconnectViewCode,
      connectionInfo: null,
      studentList: null,
      showStudentList: false
    };
  },

  async mounted() {
    this.connectionInfo = await getConnectionInfo();
  },

  methods: {
    async toggleStudentList() {
      if(this.showStudentList) {
        this.showStudentList = false;
      } else {
        this.studentList = await getStudentList();
        this.showStudentList = true;
      }
    },
    shareOutChange() {
      state.shareOut.codeChanged = true;
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