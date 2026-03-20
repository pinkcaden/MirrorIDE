<template :style = "{minWidth: '100%'}">
  <div id='terminal' ref='terminal'
       class = "container
                m-1 mb-2 mt-4
                overflow-scroll
                text-start
                bg-black
                "
  ></div>
</template>

<script>
export default {
  name: "Terminal",
  data() {
    return {
      _lastDiv : undefined
    }
  },
  methods: {
    outputLine(message) {
      this.newDiv(message, 'white')
    },
    output(message) {
      if (this._lastDiv === undefined) {
        this.outputLine(message)
      } else {
        this._lastDiv.innerText = this._lastDiv.innerText + message.toString()
      }
    },
    warn(message) {
      this.newDiv(message, 'yellow')
    },
    error(message) {
      this.newDiv(message, 'red')
    },
    newDiv(message, color) {
      const msg = document.createElement('div')
      msg.innerText = message.toString()
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
    height: 100px;
    width: 400px;
  }
</style>