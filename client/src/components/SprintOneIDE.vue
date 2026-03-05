<script>
import TextEditor from "./TextEditor.vue"
export default {
  components: {TextEditor},
  data() {
    return {
      index: 0,
      studentText: ''
    }
  },
  methods: {
    switchText() {
      this.index = ((this.index + 1) % 3)
      const name = "edit" + this.index
      this.studentText = this.$refs[name].getText()
    }
  }
}
</script>

<template>
  <p>{{studentText}}</p>
  <button @click = "switchText()">
    get text
  </button>
  <tr>
    <td>
      <TextEditor v-bind:lang-choice="'js'" ref="edit0"></TextEditor>
    </td>
    <td>
      <TextEditor v-bind:lang-choice="'css'" ref="edit1"></TextEditor>
    </td>
    <td>
      <TextEditor v-bind:lang-choice="'html'" ref="edit2"></TextEditor>
    </td>
  </tr>
</template>

<style scoped>

</style>