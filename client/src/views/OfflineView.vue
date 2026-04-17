<script>
import IDE from '../components/IDE.vue'
export default {
  components: {IDE},
}
</script>

<template>
  <IDE :js = "true" :html = "true" :css = "true"></IDE>
</template>

<style scoped>

</style>