<template>
  <div :style="{display: 'inline-flex'}">
    <div class="container m-0 p-0" :style = "darkMode ? {background: '#282C34'} : {background: 'white'}">
      <div class="row p-0 m-0">
        <div class="col m-0 p-0">
          <div class="container m-0 p-0">
            <div class="row m-0 p-0">
              <div :style="{display: 'inline-flex', flexDirection : 'row'}">
                <button ref="jsBtn" :style="currentLanguage === 'js' ? {fontWeight: 'bold', background: '#F7ECBE'} : {fontWeight: 'normal', background: '#EDBF2D'}"
                        v-if="js" @click="currentLanguage = 'js'" class="langBtn">JS</button>
                <button ref="cssBtn" :style="currentLanguage === 'css' ? {fontWeight: 'bold', background: '#D5E4ED'} : {fontWeight: 'normal', background: '#2687D1'}"
                        v-if="css" @click="currentLanguage = 'css'" class="langBtn">CSS</button>
                <button ref="htmlBtn" :style="currentLanguage === 'html' ? {fontWeight: 'bold', background: '#E3D0B6'} : {fontWeight: 'normal', background: '#D98114'}"
                        v-if="html" @click="currentLanguage = 'html'" class="langBtn">HTML</button>
              </div>
            </div>

            <div class="row ps-4">
              <TextEditor ref="cssEditor" v-if="css" v-bind:lang-choice="'css'" :parentFunc = "this.handleShare"
                          v-show="currentLanguage === 'css'" ></TextEditor>
              <TextEditor ref="htmlEditor" v-if="html" v-bind:lang-choice="'html'" :parentFunc = "this.handleShare"
                          v-show="currentLanguage === 'html'"></TextEditor>
              <TextEditor ref="jsEditor" v-if="js" v-bind:lang-choice="'js'" :parentFunc = "this.handleShare"
                          v-show="currentLanguage === 'js'"></TextEditor>
            </div>
            <div/>
          </div>
        </div>
          <div class="col m-0 p-0">
            <div class="container h-100">
              <div class="row ">
                <div class="form-check text-black bg-secondary-subtle" >
                  <label class="form-check-label" for="darkModeCheck">
                    Dark Mode
                  </label>
                  <input  class="form-check-input" v-model= "darkMode" type="checkbox" id="darkModeCheck" checked>
                </div>
              </div>
              <div class="row justify-content-center">
                <RunButton :parentRun="this.handleRun"></RunButton>
              </div>
              <div v-show = "this.html" ref = "screen" class = "border border-black border-2" :style = "{background: 'white'}"></div>
              <div class="row justify-content-center border-2 border-white">
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
import Runner from '../utils/execution/Runner.js'
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
      _running: false
    }
  },
  props: {
    js: {type: Boolean, default: false, readonly: true},
    css: {type: Boolean, default: false, readonly: true},
    html: {type: Boolean, default: false, readonly: true},
    shareOutFunc: {type: Function, default: null, required: false, readonly: true},
    editable: {type: Boolean, default: true, required: false, readonly: true}
  },
  mounted() {
    if (this.js) {
      this._languages['js'] = {button: this.$refs.jsBtn, editor: this.$refs.jsEditor};
    }
    if (this.html) {
      this._languages['html'] = {button: this.$refs.htmlBtn, editor: this.$refs.htmlEditor}
    }
    if (this.css) {
      this._languages['css'] = {button: this.$refs.cssBtn, editor: this.$refs.cssEditor}
    }
    for (const lang in Object.keys(this._languages)) {
      this.currentLanguage = lang
    }
    this.currentLanguage = Object.keys(this._languages)[0]

    this.runner = new Runner(this.$refs.screen, this.handleLog)

    const viewCheck = setInterval(()=>{
      let isView;
      for (const lang of Object.values(this._languages)) {
        isView = lang.editor.viewExists();
        if (!isView) {break;}
      }
      if (isView) {
        clearTimeout(viewCheck)
        this.setEditable(this.editable)
      }
    }, 150)
  },
  watch: {
    darkMode(newValue) {
      for (const lang of Object.values(this._languages)) {
        lang.editor.setDarkMode(newValue)
      }
    }
  },
  methods: {
    handleLog(level, args) {
        this.$refs.terminal[level](args[0])
        for (let i = 1; i < args.length; i++) {
          this.$refs.terminal.output(args[i], level)
        }
    },
    handleShare(){
      if (this.shareOutFunc) {this.shareOutFunc(this.getTexts())}
    },
    handleRun() {
      this.$refs.terminal.clear()
      const compiled = this.runner.compile(this.getTexts())
      if (compiled.valid) {
        this.runner.run(compiled.code, compiled.data)
      } else {
        this.$refs.terminal.error("Failed to compile: " + compiled.data)
      }

    },
    setEditable(editable){
      for (const value of Object.values(this._languages)) {
        value.editor.setEditable(editable)
      }
    },
    getInactivity() {
      const inactivities = []
      for (const lang of Object.values(this._languages)) {
        inactivities.push(lang.editor.getLastUpdate())
      }
      return Math.round((Date.now() - Math.max(...inactivities)) / 1000)
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