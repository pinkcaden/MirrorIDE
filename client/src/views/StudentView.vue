<script setup>
import {ref} from 'vue'
import TextEditor from "../components/ide/TextEditor.vue";

const editRequest = ref(true)
</script>

<template>
  <div class="studentView">
    <h2>Student View</h2>

    <div class="editorWrapper">
      <TextEditor ref="editor" />
    </div>

    <div v-if="editRequest" class="requestBox">
      <p>Instructor wants to edit your code</p>
    </div>
  </div>
</template>

<style scoped>
.studentView {
  width: 100%;
  min-height: calc(100vh - 80px);
  display: flex;
  flex-direction: column;
  padding: 1.5rem;
  box-sizing: border-box;
}
.studentView h2 {
  margin: 0 0 1rem 0;
  text-align: center;
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
.requestBox {
  margin-top: 1rem;
  padding: 1rem;
  border: 1px solid #333;
  border-radius: 12px;
  background: rgba(255,255,255,0.03);
  text-align: center;
}
.requestBox p {
  margin: 0 0 0.75rem 0;
}
.requestActions {
  display: flex;
  justify-content: center;
  gap: 0.75rem;
}
.acceptBtn, .declineBtn {
  padding: 0.6rem 1rem;
  border: 1px solid #333;
  border-radius: 8px;
  background: #111;
  color: white;
  cursor: pointer;
}
.acceptBtn:hover {
  background: #1a1a1a;
}
.declineBtn:hover {
  background: #1a1a1a;
}
</style>