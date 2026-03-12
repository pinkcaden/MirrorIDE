<template>
  <div :style="{display : 'inline-flex'}">
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
              ref="cssEditor"
              v-if="css"
              v-bind:lang-choice="'css'"
              v-show="this.currentLanguage === 'css'"></TextEditor>
          <TextEditor
              ref="htmlEditor"
              v-bind:lang-choice="'html'"
              v-if="html"
              v-show="this.currentLanguage === 'html'"></TextEditor>
          <TextEditor
              ref="jsEditor"
              v-if="js"
              v-bind:lang-choice="'js'"
              v-show="this.currentLanguage === 'js'"></TextEditor>
        </td>
      </tr>
      </tbody>
    </table>
  </div>
</template>


<script>
import TextEditor from './TextEditor.vue'

const BUTTON_COLORS = {
  'js': {selected: "#F7ECBE", unselected: "#EDBF2D"},
  'css': {selected: "#D5E4ED", unselected: "#2687D1"},
  'html': {selected: "#E3D0B6", unselected: "#D98114"}
}


export default {
  components: {
    TextEditor
  },
  data() {
    return {
      currentLanguage: String,
      languages: {}
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
      this.languages['js'] = {button: this.$refs.jsBtn, editor: this.$refs.jsEditor, ...BUTTON_COLORS['js']};
    }
    if (this.html) {
      this.languages['html'] = {button: this.$refs.jsBtn, editor: this.$refs.htmlEditor, ...BUTTON_COLORS['html']}
    }
    if (this.css) {
      this.languages['css'] = {button: this.$refs.cssBtn, editor: this.$refs.cssEditor, ...BUTTON_COLORS['css']}
    }

    this.currentLanguage = Object.keys(this.languages)[0]
  },
  watch: {
    currentLanguage(newValue, oldValue) {
      if (typeof oldValue === 'function') {
        for (const lang of Object.values(this.languages)) {
          lang.button.style.background = lang.unselected
          lang.button.style.fontWeight = 'normal'
        }
      } else {
        const oldLang = this.languages[oldValue]
        oldLang.button.style.background = oldLang.unselected
        oldLang.button.style.fontWeight = 'normal'
      }
      const newLang = this.languages[newValue]
      newLang.button.style.background = newLang.selected
      newLang.button.style.fontWeight = 'bold'
    }
  },
  methods: {

    getInactivity() {
      const inactivities = []
      for (const lang of Object.values(this.languages)) {
        inactivities.push(lang.editor.getLastUpdate())
      }
      return (Date.now() - Math.min(...inactivities)) / 1000
    },
    getTexts() {
      const texts = {}
      for (const lang of Object.keys(this.languages)) {
        texts[lang] = this.languages[lang].editor.getText()
      }
      return texts
    },
    setTexts(texts) {
      for (const lang of Object.keys(texts)) {
        this.languages[lang].editor.rewriteText(texts[lang])
      }
    },
    getUpdates(){

    },
    giveUpdates(){

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