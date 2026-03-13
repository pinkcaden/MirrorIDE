<template>
  <div id='terminal' ref='terminal'></div>
</template>

<script>
export default {
  name: "Terminal",
  methods: {
    output(message) {
      this.newDiv(message, 'white')
    },
    warn(message) {
      this.newDiv(message, 'yellow')
    },
    error(message) {
      this.newDiv(message, 'red')
    },
    newDiv(message, color) {
      const msg = document.createElement('div')
      msg.innerText = message
      msg.style.color = color;
      this.$refs['terminal'].appendChild(msg);
    },
    clear() {
      this.$refs.terminal.innerHTML = ''
    },
    getContents() {
      const ret = []
      for (const child of this.$refs['terminal'].children) {
        ret.push([child.innerText, child.style.color])
      }
      return ret
    },
    setContents(contents) {
      for (const line of contents) {
        this.newDiv(line[0], line[1])
      }
    }
  }
}
</script>

<style scoped>
#terminal {
  background: black;
  overflow: scroll;
  width: 250px;
  height: 100px;
}
</style>