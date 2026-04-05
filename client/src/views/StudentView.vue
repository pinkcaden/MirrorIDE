<script setup>
import { computed, onMounted, onBeforeUnmount, ref } from "vue";
import IDE from "../components/IDE.vue";
import { state } from "../socket";

const ideRef = ref(null);
let syncInterval = null;
let lastSent = "";

onMounted(() => {
  state.getConnectionInfo();

  syncInterval = setInterval(() => {
    if (!ideRef.value) return;

    const texts = ideRef.value.getTexts();
    const serialized = JSON.stringify(texts);

    state.setShareOutViewCode(texts);
    lastSent = serialized;
  }, 500);
});

onBeforeUnmount(() => {
  if (syncInterval) clearInterval(syncInterval);
});

const connectionInfo = computed(() => state.connectionInfo);
</script>

<template>
  <div class="studentView">
    <h2>Student View</h2>

    <div v-if="connectionInfo" class="requestBox">
      <p><b>Room:</b> {{ connectionInfo.room?.roomName }}</p>
    </div>

    <div class="editorWrapper">
      <IDE ref="ideRef" :html="true" :css="true" :js="true"/>
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
  overflow: auto;
  padding: 0.5rem;
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

.acceptBtn,
.declineBtn {
  padding: 0.6rem 1rem;
  border: 1px solid #333;
  border-radius: 8px;
  background: #111;
  color: white;
  cursor: pointer;
}

.acceptBtn:hover,
.declineBtn:hover {
  background: #1a1a1a;
}
</style>