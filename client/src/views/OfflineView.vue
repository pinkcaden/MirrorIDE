<script>
import IDE from '../components/IDE.vue'

export default {

  components: {
    IDE
  }
}
</script>

<template>
    <IDE ref="ide1" v-bind:css=false v-bind:html=false v-bind:js=true></IDE>
</template>

<style scoped>

</style>