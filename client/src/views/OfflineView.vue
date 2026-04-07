<script>
import IDE from '../components/IDE.vue'

export default {

  components: {
    IDE
  },
  data() {
    return {
      ide0Time: 0,
      ide1Time: 0,
      ide0Lines: 0,
      ide1Lines: 0,
      shown: true,
    }
  },

  methods: {
    transfer(dest) {
      const text = (this.$refs['ide' + String((dest + 1) % 2)]).getTexts()
      this.$refs['ide' + String(dest)].setTexts(text)
    }
  },
  mounted() {
    this.loop = setInterval(() => {
      this.ide0Time = this.$refs.ide0.getInactivity()
      this.ide1Time = this.$refs.ide1.getInactivity()
      this.ide0Lines = this.$refs.ide0.getLineCount()
      this.ide1Lines = this.$refs.ide1.getLineCount()
    }, 1000)
  },
  beforeDestroy() {
    clearInterval(this.loop)
  }

}
</script>

<template>
  <div>
    <button @click="this.$refs['ide0'].requestSteal()">steal 1</button>
    <button
        @click="this.$refs['ide0'].relinquishSteal({'js' : 'this is instructor js', 'css' : 'this is instructor css', 'html' : 'this is instructor html' })">
      free 1
    </button>
    <div>
      <button @click="transfer(1)">1 to 2</button>
      <button @click="transfer(0)">2 to 1</button>
      <button @click="this.shown = false">Hide</button>
      <button @click="this.shown = true">Show</button>
    </div>
    <div> 1 Lines: {{this.ide0Lines}} ------ Time: {{ this.ide0Time }} -----  2 Time: {{ this.ide1Time }}   -----   2 Lines: {{this.ide0Lines}}</div>
    <IDE v-show="this.shown" ref="ide0" v-bind:css=true v-bind:js=true v-bind:html=true></IDE>
    <IDE ref="ide1" v-bind:css=true v-bind:js=true v-bind:html=true></IDE>
  </div>
</template>

<style scoped>

</style>