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