<script setup>
import TextEditor from "../components/TextEditor.vue";
import {ref} from "vue";

const students = [
  {id: 1, name: 'Deborah', lines: 45, lastEdit: '4 seconds ago', status: 'active'},
  {id: 2, name: 'David', lines: 12, lastEdit: '20 seconds ago', status: 'idle'},
  {id: 3, name: 'Caden', lines: 70, lastEdit: '1 seconds ago', status: 'active'},
  {id: 4, name: 'Aidan', lines: 32, lastEdit: '16 seconds ago', status: 'idle'},
]
const selectedStudent = ref(students[0]);
const request = () => {
  alert("Request sent to")
}
</script>

<template>
  <div class="professorPage">
    <div class="sidebar">
      <h3>Students</h3>
      <div class="students" v-for="student in students" :key="student.id" @click="selectedStudent = student">
        <div class="studentName">
          {{ student.name }}
        </div>
        <div class="studentLines">
          Lines: {{ student.lines }}
        </div>
        <div class="studentEdit">
          Last edit: {{ student.lastEdit }}
        </div>
        <div class="studentStatus">
          Status: {{ student.status }}
        </div>
      </div>
    </div>

    <div class="main">
      <h2>{{ selectedStudent.name }}</h2>
      <div class="selectedSummary">
        <span>Lines: {{ selectedStudent.lines }}</span>
        <span>Last edit: {{ selectedStudent.lastEdit }}</span>
        <span>Status: {{ selectedStudent.status }}</span>
      </div>

      <div class="controls">
        <button @click="request" class="requestBtn">Request Edit Access</button>
      </div>
      <div class="editorWrapper">
        <TextEditor />
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
.studentName {
  font-weight: bold;
  margin-bottom: 0.4rem;
}
.studentLines, .studentEdit, .studentStatus {
  font-size: 0.9rem;
  color: #bbb;
  margin-top: 0.2rem;
}
.main {
  flex: 1;
  min-width: 0;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;
}
.editorWrapper {
  flex: 1;
  min-height: 650px;
  width: 100%;
  border: 1px solid #333;
  border-radius: 12px;
  overflow: hidden;
  padding: 0.5rem;
  box-sizing: border-box;
}
.editorWrapper :deep(*) {
  box-sizing: border-box;
}
.selectedSummary {
  display: flex;
  gap: 1rem;
  font-size: 0.95rem;
  color: #bbb;
  margin-bottom: 1rem;
}
.controls {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 1rem;
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
</style>