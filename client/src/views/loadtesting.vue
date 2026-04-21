<script>
import { simulateRooms } from "../loadtesting.js";

export default {
  name: "loadtesting",
  methods: {
    simulateRooms() {
      this.$refs.msg.innerText = simulateRooms(this.$refs.numRooms.value, this.$refs.numStudents.value);
    }
  }
}
</script>

<template>
  <form ref="form" id="form" action="">
    <h1>Simulation Options</h1>
    <label>
      How many rooms would you like to simulate?
      <input ref="numRooms" autocomplete="off" type="number"/>
    </label>
    <label>
      How many students would you like to simulate per room?
      <input ref="numStudents" autocomplete="off" type="number"/>
    </label>
    <button type="button" @click="simulateRooms()">Simulate Rooms</button>
    <div ref="msg"></div>
    <br>
  </form>

</template>

<style scoped>
#form {
  display: flex;
  flex-direction: column;
  gap: 15px;
}
</style>