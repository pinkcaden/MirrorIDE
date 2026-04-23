<script>
import IDE from "../components/IDE.vue";
import { state } from "../socket";
import {watch} from "vue";

export default {
  components: {IDE},
  data() {
    return {
      socketState: state,
    }
  },
  async mounted() {
    await this.socketState.getConnectionInfo();

    watch(
      () => this.socketState.shareInEdit.id,
      (id) => {
        if(id === null) {
          this.$refs.IDE.setEditable(true);
        }
      }
    )

    watch(
      () => this.socketState.shareInEdit.code,
      (newCode) => {
        if(newCode !== null) {
          console.log("GOT EDITED CODE", newCode);
          this.$refs.IDE.setTexts(newCode);
        }
      }
    );

    watch(
      () => this.socketState.shareInView.code,
      (newCode) => {
        if(newCode !== null) {
          console.log("GOT CODE TO VIEW", newCode);
          this.$refs.viewIDE.setTexts(newCode);
        }
      }
    );

    if (this.$refs.IDE) {
      state.getActivity = () => {
        //needs to be updated
        return {
          lines: this.$refs.IDE.getLineCount(),
          lastEdit: this.$refs.IDE.getInactivity()
        }
      }
      console.log("set get activity");
    } else {
      console.log("ide ref not found");
    }
  },
  methods: {
    acceptEditRequest() {
      this.socketState.connectEditCode();
      this.$refs.IDE.setEditable(false);
    },
    rejectEditRequest() {
      this.socketState.rejectEditRequest();
    }
  }
}
</script>

<template>
  <div class="studentView">
    <div class="menubar">
      <div v-if="socketState.connected" class="connectionInfo">
        <p><b>Room:</b> {{ socketState.connectionInfo.room.roomName }}</p>
        <p><b>Code:</b> {{ socketState.connectionInfo.roomCode }}</p>
        <p><b>Instructor:</b> {{ socketState.connectionInfo.room.instructorName }}</p>
        <p><b>Name:</b> {{ socketState.connectionInfo.name }}</p>
      </div>
    </div>
    <h2>Student View</h2>

    <div v-if="socketState.connected">

    </div>

    <div v-if="socketState.shareInEdit.requestId !== null">
      <p>{{this.socketState.connectionInfo.room.instructorName}} would like to edit your code.</p>
      <button @click="acceptEditRequest()">Accept</button>
      <button @click="rejectEditRequest()">Reject</button>
    </div>

    <div v-if="socketState.shareInEdit.id !== null">
      <p>{{socketState.connectionInfo.room.instructorName}} is currently editing Your code.</p>
    </div>

    <div class="editorWrapper" v-if="socketState.connected">
      <!--  main code-->
      <IDE ref="IDE" :html="socketState.connectionInfo.room.html" :css="socketState.connectionInfo.room.css" :js="socketState.connectionInfo.room.js" :share-out-func="socketState.setShareOutViewCode"/>
      <!--  view code-->
      <IDE ref="viewIDE" v-show="socketState.isViewing" :html="socketState.connectionInfo.room.html" :css="socketState.connectionInfo.room.css" :js="socketState.connectionInfo.room.js"/>
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
</style>