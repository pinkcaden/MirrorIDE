<template>
  <div :style="{display: 'inline-flex'}">
    <div class="container m-0 p-0">
      <div class="row">
        <div class="col">
          <div class="container m-0 p-0">
            <div class="row m-0 p-0">
              <div :style="{display: 'inline-flex', flexDirection : 'row'}">
                <button ref="jsBtn" v-if="js" @click="this.currentLanguage = 'js'" class="langBtn">JS</button>
                <button ref="cssBtn" v-if="css" @click="this.currentLanguage = 'css'" class="langBtn">CSS</button>
                <button ref="htmlBtn" v-if="html" @click="this.currentLanguage = 'html'" class="langBtn">HTML</button>
              </div>
            </div>

            <div class="row ps-4">
              <TextEditor ref="cssEditor" v-if="css" v-bind:lang-choice="'css'"
                          v-show="this.currentLanguage === 'css'"></TextEditor>
              <TextEditor ref="htmlEditor" v-if="html" v-bind:lang-choice="'html'"
                          v-show="this.currentLanguage === 'html'"></TextEditor>
              <TextEditor ref="jsEditor" v-if="js" v-bind:lang-choice="'js'"
                          v-show="this.currentLanguage === 'js'"></TextEditor>
            </div>
            <div/>
          </div>
        </div>
        <div class="col m-0 p-0">
          <div class="container bg-white h-100 ">
            <div class="row ">
              <div class="text-black bg-secondary-subtle p-2">
                <div class="form-check">
                  <label class="form-check-label" for="darkModeCheck">
                    Dark Mode
                  </label>
                  <input class="form-check-input" v-model="darkMode" type="checkbox" id="darkModeCheck">
                </div>
              </div>
            </div>
            <div class="row justify-content-center">
              <RunButton ref = "runButton" :parentRun="this.handleRun"></RunButton>
            </div>
            <div ref = "screen"></div>
            <div class="row justify-content-center">
              <Terminal ref="terminal"></Terminal>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>

</template>

<script>
import TextEditor from './ide/TextEditor.vue'
import Terminal from './ide/Terminal.vue'
import RunButton from './ide/RunButton.vue';
import Executor from '../utils/execution/workerExecute.js'

const BUTTON_COLORS = {
  'js': {selected: "#F7ECBE", unselected: "#EDBF2D"},
  'css': {selected: "#D5E4ED", unselected: "#2687D1"},
  'html': {selected: "#E3D0B6", unselected: "#D98114"}
}
export default {
  components: {
    RunButton, TextEditor, Terminal
  },
  data() {
    return {
      currentLanguage: undefined,
      _languages: {},
      _stolenDocs: undefined,
      isStolen: false,
      darkMode: false,
      _running: false,
      _executor: undefined
    }
  },
  props: {
    js: {type: Boolean, default: false, readonly: true},
    css: {type: Boolean, default: false, readonly: true},
    html: {type: Boolean, default: false, readonly: true}
  },
  mounted() {
    if (this.js) {
      this._languages['js'] = {button: this.$refs.jsBtn, editor: this.$refs.jsEditor, ...BUTTON_COLORS['js']};
    }
    if (this.html) {
      this._languages['html'] = {button: this.$refs.htmlBtn, editor: this.$refs.htmlEditor, ...BUTTON_COLORS['html']}
    }
    if (this.css) {
      this._languages['css'] = {button: this.$refs.cssBtn, editor: this.$refs.cssEditor, ...BUTTON_COLORS['css']}
    }
    for (const lang in Object.keys(this._languages)) {
      this.currentLanguage = lang
    }
    this.currentLanguage = Object.keys(this._languages)[0]

    this._executor = new Executor()
    this._executor.setScope(this)
    this._executor.setLogHandle(this.handleLog)
  },
  watch: {
    currentLanguage(newValue, oldValue) {
      if (oldValue === undefined) {
        for (const lang of Object.values(this._languages)) {
          lang.button.style.background = lang.unselected
          lang.button.style.fontWeight = 'normal'
        }
      } else {
        const oldLang = this._languages[oldValue]
        oldLang.button.style.background = oldLang.unselected
        oldLang.button.style.fontWeight = 'normal'
      }
      const newLang = this._languages[newValue]
      newLang.button.style.background = newLang.selected
      newLang.button.style.fontWeight = 'bold'
    },
    darkMode(newValue) {
      for (const lang of Object.values(this._languages)) {
        lang.editor.setDarkMode(newValue)
      }
    }
  },
  methods: {
    handleLog(logObj){
      console.log(logObj)
      if(logObj.level === 'log'){
        for (const value of logObj.values){
          this.$refs.terminal.log(value)
        }
      } else if(logObj.level === 'error'){
        for (const value of logObj.values){
          console.log("hit")
          this.$refs.terminal.error(value)
        }
      } else if(logObj.level === 'warn') {
        for (const value of logObj.values) {
          this.$refs.terminal.warn(value)
        }
      }
      },

    async handleRun() {
      if (this._running) return
      const terminal = this.$refs['terminal']
      const source = this.$refs.jsEditor.getText().toString()
      const runButton = this.$refs['runButton']
      terminal.clear()
      this._running = true
      const code = this.getTexts()
      const compileResults = this._executor.compile(code)
      if (!compileResults[0]){
        terminal.error(compileResults[1])
        return
      }
      this._executor.run(code)
      terminal.log('Running code')
      this._running = false
      runButton.endRun()
    },
    requestSteal() {
      if (!this.isStolen) {
        const confirmation = this._popUpConfirmation('Instructor wants to edit. Allow?')
        if (confirmation) {
          this._stolenDocs = {}
          for (const [key, value] of Object.entries(this._languages)) {
            value.editor.setEditable(false)
            this._stolenDocs[key] = value.editor.getText()
          }
          this.isStolen = true
          return true
        }
      }
      return false
    },
    relinquishSteal(newTexts) {
      if (this.isStolen) {
        const confirmation = this._popUpConfirmation("Save instructor's edits?")
        const times = {}
        for (const [key, value] of Object.entries(this._languages)) {
          times[key] = value.editor.lastEdit
        }
        if (confirmation) {
          this.setTexts(newTexts)
        } else {
          this.setTexts(this._stolenDocs)
        }
        this._stolenDocs = {}
        for (const [key, value] of Object.entries(this._languages)) {
          value.editor.lastEdit = times[key]
          value.editor.setEditable(true)
        }
        this.isStolen = false
        return true
      }
      return false
    },
    getInactivity() {
      const inactivities = []
      for (const lang of Object.values(this._languages)) {
        inactivities.push(lang.editor.getLastUpdate())
      }
      return (Date.now() - Math.max(...inactivities)) / 1000
    },
    getTexts() {
      const texts = {}
      for (const lang of Object.keys(this._languages)) {
        texts[lang] = this._languages[lang].editor.getText()
      }
      return texts
    },
    setTexts(texts) {
      const availableLanguages = Object.keys(this._languages)
      for (const [key, value] of Object.entries(texts)) {
        if (availableLanguages.includes(key)) {
          this._languages[key].editor.rewriteText(value)
        }
      }
    },
    getLineCount() {
      let count = 0
      for (const lang of Object.values(this._languages)){
        count += lang.editor.getLineCount()
      }
      return count
    },

    _popUpConfirmation(message) {
      return confirm(message)
    }


  }
}
</script>


<style scoped>
.langBtn {
  border-radius: 0;
  width: 25%;
  height: 100%;
  margin: 0;
}
</style>