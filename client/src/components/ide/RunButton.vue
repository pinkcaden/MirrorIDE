<script>

import throttle from "../../utils/timing/throttle.js";

export default {
  name: "RunButton",
  props: {
    parentRun: {
      required: true,
      validator: (value) => {
        return value instanceof Function
      }
    }
  },
  data() {
    return {
      isRunning: false
    }
  },
  created() {
    this.throttledRun = throttle(async () => {
      this.isRunning = true;
      await this.parentRun();
    }, 1500)
  },
  methods: {
    runClick() {
      if (!this.isRunning) {
        const ret = this.throttledRun()
      } else {
        this.isRunning = false;
      }
    },
    endRun() {
      this.isRunning = false;
    }
  }
}
</script>

<template>
  <button ref="run"
          type="button"
          :class="isRunning ? 'btn btn-danger m-2 mt-4 w-50'
          : 'btn btn-success m-2 mt-4 w-50'"
          @click="runClick()"> {{ isRunning ? "Stop execution" : "Run" }}
  </button>
</template>
<style scoped>

</style>