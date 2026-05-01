<script>
import IDE from "../components/IDE.vue";
import {watch} from "vue";
import {state} from "../socket";

let getStudentListInterval = null;

export default {
  components: {IDE},
  data() {
    return {
      socketState: state,
      studentListToggle: false,
    }
  },
  mounted() {
    this.socketState.getConnectionInfo();
    this.socketState.getStudentList();

    watch(
        () => this.socketState.shareInView.code,
        (newCode) => {
          if (newCode !== null) {
            console.log("GOT CODE TO VIEW", newCode);
            this.$refs.viewIDE.setTexts(newCode);
          }
        }
    );

    watch(
        () => this.socketState.shareOutEdit.initialCode,
        (initialCode) => {
          if (initialCode !== null) {
            console.log("GOT CODE TO EDIT", initialCode);
            this.$refs.editIDE.setTexts(initialCode);
            this.socketState.shareOutEdit.initialCode = null;
          }
        }
    );
  },
  methods: {
    toggleStudentList(toggle) {
      if (toggle) {
        this.socketState.getStudentList();
        this.socketState.getActivityList();
        getStudentListInterval = setInterval(this.socketState.getActivityList, 5000);
      } else {
        clearInterval(getStudentListInterval);
      }
      this.studentListToggle = toggle;
    },
    getInactivityColor(time) {
      if (time < 60) return "green";
      if (time < 300) return "yellow";
      return "red";
    },
    getInactivityTime(seconds) {
      if (seconds < 60) return seconds + "s";
      return Math.trunc(seconds / 60) + "min";
    },
    viewStudent(studentID, studentName) {
      this.socketState.connectViewCode(studentID, studentName);
    }
  }
}
</script>

<template>
  <div class="professorPage" data-testid="professor-view">
    <div class="sidebar" v-if="studentListToggle" data-testid="student-sidebar">
      <h3>Students</h3>

      <div class="studentTable" data-testid="student-list">
        <div class="studentHeader">
          <span>Name</span>
          <span>Lines</span>
          <span>Last Edit</span>
        </div>
        <div
            class="studentRow"
            data-testid="student-item"
            v-for="(student, studentID) in socketState.studentList"
            :key="studentID"
            @click="viewStudent(studentID, student.name)"
        >
          <span class="studentName">{{ student.name }}</span>
          <span>{{ student.activity ? student.activity.lines : 0 }}</span>
          <span
              v-if="socketState.shareOutEdit.id === studentID"
              class="editingText"
          > EDITING
          </span>
          <span
              v-else-if="student.activity"
              :style="{ color: getInactivityColor(student.activity.lastEdit) }"
          > {{ getInactivityTime(student.activity.lastEdit) }} ago
          </span>
        </div>
      </div>
    </div>

    <div class="main">
      <div class="menubar">
        <button data-testid="toggle-student-list-btn" @click="toggleStudentList(!studentListToggle)">Toggle</button>
        <div v-if="socketState.connected" class="connectionInfo">
          <p><b>Room:</b> {{ socketState.connectionInfo.room.roomName }}</p>
          <p><b>Code:</b> <span data-testid="room-code">{{ socketState.connectionInfo.roomCode }}</span></p>
          <p><b>Name:</b> {{ socketState.connectionInfo.name }}</p>
        </div>
        <button @click="socketState.endSession()">End Session</button>
      </div>
      <h2>Professor View</h2>
      <div v-if="socketState.isViewing">
        <p>Currently viewing {{ socketState.shareInView.name }}'s code.</p>
        <button @click="this.socketState.disconnectViewCode();">Stop Viewing</button>
        <br>
        <button
            @click="socketState.requestEditCode(this.socketState.shareInView.id, this.socketState.shareInView.name);">
          Edit Code
        </button>
      </div>
      <div v-if="socketState.shareOutEdit.requestId !== null">
        <p>Currently requesting to edit {{ socketState.shareOutEdit.requestName }}'s code.</p>
        <button @click="socketState.cancelEditRequest();">Cancel Request</button>
      </div>
      <div v-if="socketState.isEditing">
        <p>Currently editing {{ socketState.shareOutEdit.name }}'s code.</p>
        <button @click="this.socketState.disconnectEditCode();">Stop Editing</button>
      </div>
      <div class="editorWrapper" v-if="socketState.connected">
<!--        main code-->
        <IDE ref="IDE" :html="socketState.connectionInfo.room.html" :css="socketState.connectionInfo.room.css" :js="socketState.connectionInfo.room.js" :share-out-func="socketState.setShareOutViewCode"/>
<!--        view code-->
        <IDE ref="viewIDE" v-show="socketState.isViewing" :html="socketState.connectionInfo.room.html" :css="socketState.connectionInfo.room.css" :js="socketState.connectionInfo.room.js" :editable="false"/>
<!--        edit code-->
        <IDE ref="editIDE" v-show="socketState.isEditing" :html="socketState.connectionInfo.room.html" :css="socketState.connectionInfo.room.css" :js="socketState.connectionInfo.room.js" :share-out-func="socketState.setShareOutEditCode"/>
      </div>
    </div>
  </div>
</template>

<style scoped>
.professorPage {
  width: 100%;
  min-height: calc(100vh - 80px);
  display: flex;
  box-sizing: border-box;
}

.sidebar {
  width: 260px;
  min-width: 260px;
  border-right: 1px solid #333;
  padding: 1rem;
  box-sizing: border-box;
}

.studentTable {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.studentHeader, .studentRow {
  display: grid;
  grid-template-columns: 1.4fr 0.7fr 1fr;
  align-items: center;
  gap: 0.75rem;
}

.studentHeader {
  padding: 0.5rem 0.75rem;
  border-bottom: 1px solid #333;
  color: #aaa;
  font-weight: bold;
  font-size: 0.9rem;
}

.studentRow {
  padding: 0.75rem;
  border: 1px solid #333;
  border-radius: 8px;
  cursor: pointer;
}

.studentRow:hover {
  background: rgba(255, 255, 255, 0.04);
}

.studentName {
  font-weight: bold;
}

.editingText {
  color: orange;
  font-weight: bold;
}

.main {
  display: flex;
  flex-direction: column;
  min-width: 0;
  padding: 1.5rem;
  box-sizing: border-box;
}

.menubar {
  display: flex;
  flex-direction: row;
  width: 100%;
  justify-content: start;
  gap: 20px;
  height: 40px;
}

.connectionInfo {
  display: flex;
  flex-direction: row;
  gap: 15px;
}

.editorWrapper {
  min-height: 650px;
  width: 65%;
  border: 1px solid #333;
  border-radius: 12px;
  overflow: auto;
  padding: 0.5rem;
  box-sizing: border-box;
}
</style>