<script setup>
import IDE from "../components/IDE.vue";
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import { state } from "../socket";

const ideRef = ref(null);
let studentListInterval = null;
let viewInterval = null;
let lastApplied = "";

onMounted(() => {
  state.getConnectionInfo();
  state.getStudentList();

  studentListInterval = setInterval(() => {
    state.getStudentList();
  }, 1000);

  viewInterval = setInterval(() => {
    if (!ideRef.value) return;
    if (!state.shareInView.code) return;

    const incoming = state.shareInView.code;

    const normalized = {
      html: Array.isArray(incoming.html) ? incoming.html.join("\n") : (incoming.html ?? ""),
      css: Array.isArray(incoming.css) ? incoming.css.join("\n") : (incoming.css ?? ""),
      js: Array.isArray(incoming.js) ? incoming.js.join("\n") : (incoming.js ?? "")
    };

    const serialized = JSON.stringify(normalized);

    if (serialized !== lastApplied) {
      console.log("normalized professor code:", normalized);
      ideRef.value.setTexts(normalized);
      lastApplied = serialized;
    }
  }, 300);
});

onBeforeUnmount(() => {
  if (studentListInterval) clearInterval(studentListInterval);
  if (viewInterval) clearInterval(viewInterval);
});

const connectionInfo = computed(() => state.connectionInfo);
const students = computed(() => {
  if (!state.studentList) return [];
  return Object.entries(state.studentList).map(([id, name]) => ({
    id,
    name
  }));
});

function selectStudent(student) {
  state.connectViewCode(student.id, student.name);
}
</script>

<template>
  <div class="professorPage">
    <div class="sidebar">
      <h3>Students</h3>

      <div v-if="connectionInfo">
        <p><b>Room:</b> {{ connectionInfo.room?.roomName }}</p>
        <p><b>Code:</b> {{ connectionInfo.roomCode }}</p>
        <p><b>Instructor:</b> {{ connectionInfo.name }}</p>
      </div>

      <div
          class="students"
          v-for="student in students"
          :key="student.id"
          @click="selectStudent(student)"
      >
        <div class="studentName">{{ student.name }}</div>
      </div>
    </div>

    <div class="main">
      <h2>Professor View</h2>
          <div class="editorWrapper" v-if="state.connectionInfo">
            <IDE ref="ideRef" :html="true" :css="true" :js="true"/>
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

.students {
  padding: 0.9rem;
  border: 1px solid #333;
  border-radius: 10px;
  margin-top: 0.75rem;
  cursor: pointer;
}

.students:hover {
  background: rgba(255,255,255,0.04);
}

.activeStudent {
  background: rgba(255,255,255,0.08);
}

.studentName {
  font-weight: bold;
  margin-bottom: 0.35rem;
}

.studentMeta {
  font-size: 0.85rem;
  color: #aaa;
  word-break: break-all;
}

.main {
  flex: 1;
  min-width: 0;
  padding: 1.5rem;
  box-sizing: border-box;
}

.controls {
  display: flex;
  gap: 0.75rem;
  margin: 1rem 0;
}

.requestBtn {
  padding: 0.65rem 1rem;
  border: 1px solid #333;
  border-radius: 8px;
  background: #111;
  color: white;
  cursor: pointer;
}

.requestBtn:hover {
  background: #1b1b1b;
}

.editorGrid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.panel {
  min-width: 0;
}

.editorWrapper {
  min-height: 650px;
  width: 100%;
  border: 1px solid #333;
  border-radius: 12px;
  overflow: auto;
  padding: 0.5rem;
  box-sizing: border-box;
}
</style>