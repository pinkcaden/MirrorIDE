<template>
  <div :style = "{display : 'inline-flex'}">
    <table>
      <tbody id="tableBody">
      <tr id="editorTabRow">
        <td>
          <button class="editorTab"
                  v-if="js"
                  @click="this.currentLanguage = 'js'"
                  ref="jsBtn">JS
          </button>

        </td>
        <td>
          <button class="editorTab"
                  v-if="css"
                  @click="this.currentLanguage = 'css'"
                  ref="cssBtn">CSS
          </button>

        </td>
        <td>
          <button class="editorTab"
                  v-if="html"
                  @click="this.currentLanguage = 'html'"
                  ref="htmlBtn">HTML
          </button>

        </td>
      </tr>
      <tr id="editorRow">
        <td id="editorSection" colspan="3">
          <TextEditor
              v-if="css"
              v-bind:lang-choice="'css'"
              v-show="this.currentLanguage === 'css'"></TextEditor>
          <TextEditor
              v-bind:lang-choice="'html'"
              v-if="html"
              v-show="this.currentLanguage === 'html'"></TextEditor>
          <TextEditor
              v-if="js"
              v-bind:lang-choice="'js'"
              v-show="this.currentLanguage === 'js'"></TextEditor>
        </td>
      </tr>
      </tbody>
    </table>
    <Terminal></Terminal>
  </div>
</template>


<script>
import TextEditor from './TextEditor.vue'
import Terminal from './Terminal.vue'

const BUTTON_STYLES = {
  'js': { selected: "#F7ECBE", unselected: "#EDBF2D"},
  'css': { selected: "#D5E4ED", unselected: "#2687D1"},
  'html': { selected: "#E3D0B6", unselected: "#D98114"}
}


export default {
  components: {
    TextEditor,
    Terminal
  },
  data() {
    return {
      currentLanguage: String,
      languages: []
    }
  },
  props: {
    js: {
      type: Boolean,
      default: false,
      readonly: true
    },
    css: {
      type: Boolean,
      default: false,
      readonly: true
    },
    html: {
      type: Boolean,
      default: false,
      readonly: true
    }
  },
  mounted() {
    if (this.js) {
      this.languages.push('js')
    }
    if (this.html){
      this.languages.push('html')
    }
    if (this.css){
      this.languages.push('css')
    }

    this.currentLanguage = this.languages[0]
  },
  watch: {
    currentLanguage(newValue, oldValue) {
      if (typeof oldValue === 'function') {
        for (const lang of this.languages) {
          console.log(lang)
          this.$refs[lang + 'Btn'].style.background = BUTTON_STYLES[lang].unselected
          this.$refs[lang + 'Btn'].style.fontWeight = 'normal'
        }
      } else {
        this.$refs[oldValue + 'Btn'].style.background = BUTTON_STYLES[oldValue].unselected
        this.$refs[oldValue + 'Btn'].style.fontWeight = 'normal'
      }
      this.$refs[newValue + 'Btn'].style.background = BUTTON_STYLES[newValue].selected
      this.$refs[newValue + 'Btn'].style.fontWeight = 'bold'
    }
  }
}

</script>


<style scoped>

#editorTabRow {
  margin: 0;
  padding: 0;
}

.editorTab {
  width: 100%;
  height: 100%;
  margin: 0;
}

</style>