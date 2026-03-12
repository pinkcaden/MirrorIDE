<script>
import IDE from '../components/IDE.vue'
export default {

  components: {
    IDE
  },
  methods: {
    transfer(dest) {

      const text = (this.$refs['ide' + String((dest + 1) % 2)]).getTexts()
      this.$refs['ide' + String(dest)].setTexts(text)

    }
  }
}
</script>

<template>
  <div>
    <button @click="this.$refs['ide0'].requestSteal()">steal 1</button>
    <button @click="this.$refs['ide0'].relinquishSteal({'js' : 'this is instructor js', 'css' : 'this is instructor css' })">free 1</button>
    <div>
      <button @click = "transfer(1)">1 to 2</button>
      <button @click = "transfer(0)">2 to 1</button>
    </div>
  <IDE ref = "ide0" v-bind:css = true v-bind:js = true v-bind:html = false></IDE>
  <IDE ref = "ide1" v-bind:css = true v-bind:js = true v-bind:html = false></IDE>
  </div>
</template>

<style scoped>

</style>