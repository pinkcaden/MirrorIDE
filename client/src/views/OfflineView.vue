<script>
import IDE from '../components/IDE.vue'

export default {

  components: {
    IDE
  },
  data() {
    return {
      ide0Time: 0,
      ide1Time: 0
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
    </div>
    <div> 1: {{ this.ide0Time }} 2: {{ this.ide1Time }}</div>
    <IDE ref="ide0" v-bind:css=true v-bind:js=true v-bind:html=true></IDE>
    <IDE ref="ide1" v-bind:css=true v-bind:js=true v-bind:html=true></IDE>
  </div>
</template>

<style scoped>

</style>