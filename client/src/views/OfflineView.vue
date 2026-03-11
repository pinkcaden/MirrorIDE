<script>
import IDE from '../components/IDE.vue'
export default {

  components: {
    IDE
  }
}
</script>

<template>
  <IDE v-bind:css = true v-bind:js = true v-bind:html = false></IDE>
</template>

<style scoped>

</style>