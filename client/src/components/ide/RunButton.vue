<script>

import throttle from "../../utils/timing/throttle.js";

export default {
  name: "RunButton",
  props: {
    parentRun: {
      required: true,
      validator : (value) => {return value instanceof Function}
    }
  },
  data(){
    return {
      isRunning: false
    }
  },
  created() {
    this.throttledRun = throttle(this.parentRun, 1500)
  },
  methods: {
    async runClick() {
      this.isRunning = true;
      await new Promise(r => setTimeout(r, 0))
      const ret = this.throttledRun()
      this.isRunning = false;
    }
  },
  watch: {
    isRunning(newValue){
      const btn = this.$refs['run']
      if(newValue){
        btn.classList.remove("btn-success")
        btn.classList.add("btn-danger")
        btn.textContent = "Running code"

      } else {
        btn.classList.remove("btn-danger")
        btn.classList.add("btn-success")
        btn.textContent = "Run"

      }

    }
  }

}
</script>

<template>
  <button ref = "run"
          type = "button"
          class ="btn btn-success m-2 mt-4 w-50"
          @click="runClick()">Run</button>
</template>
<style scoped>

</style>