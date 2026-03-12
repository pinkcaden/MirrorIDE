<script>
import {basicSetup} from 'codemirror'
import {EditorView, lineNumbers} from '@codemirror/view'
import {Compartment} from '@codemirror/state'
import {oneDark} from '@codemirror/theme-one-dark';
import debounceMaxWait from '../utils/debounceMaxWait.js'

const DEBOUNCE_TIME = 1000;
const DEBOUNCE_MAX = 2500;

const baseTheme = {
  "&": {maxHeight: "600px", maxWidth: "400px"},
  ".cm-content, .cm-gutter": {minHeight: "600px"},
  ".cm-scroller": {overflow: "auto", height: "600px"},
  ".cm-editor": {height: "600px", width: "400px"}
}

async function getLang(lang) {
  try {
    if (lang === 'js') {
      const {javascript} = await import('@codemirror/lang-javascript')
      return javascript({typescript: false})
    } else if (lang === 'html') {
      const {html} = await import('@codemirror/lang-html')
      return html()
    } else if (lang === 'css') {
      const {css} = await import('@codemirror/lang-css')
      return css()
    } else {
      return lineNumbers()
    }
  } catch (e) {
    console.log(e);
    throw e
  }
}

export default {
  name: "TextEditor",
  data() {
    return {
      view: null,
      editable: true,
      editableCompartment: null,
      darkMode: false,
      themeCompartment: null,
      lastEdit: Date.now()
    }
  },
  props: {
    langChoice: {
      type: String,
      default: '',
      required: true,
      validator: (value) => {
        return (value === 'js' || value === 'css' || value === 'html')
      }
    },
  },

  methods: {
    setLastUpdate() {
      this.lastEdit = Date.now()
    },
    getLastUpdate() {
      return this.lastEdit
    },
    getText() {
      return this.view.state.doc
    },
    deleteText() {
      this.view.dispatch({changes: {from: 0, to: this.view.state.doc.length}}, "")
    },
    rewriteText(newText) {
      this.deleteText()
      this.view.dispatch({changes: {from: 0, insert: newText}})
    },
    setEditable(editableStatus) {
      const newExtension = EditorView.editable.of(editableStatus)
      this.view.dispatch({
        effects: this.editableCompartment.reconfigure(newExtension)
      })
    },
    setDarkMode(darkModeStatus) {
      if (darkModeStatus) {
        this.view.dispatch({
          effects: this.themeCompartment.reconfigure([EditorView.theme({...baseTheme, "&": {textAlign : "left"}}), oneDark])
        })
      } else {
        this.view.dispatch({
          effects: this.themeCompartment.reconfigure([EditorView.theme({...baseTheme, "&" : {background : "white", color: "black", textAlign: "left"}})])
        })
      }
    }
  },
  async mounted() {

    const langFunc = await getLang(this.langChoice)

    this.editableCompartment = new Compartment()
    this.themeCompartment = new Compartment()

    const debouncedUpdate =debounceMaxWait(this.setLastUpdate, DEBOUNCE_TIME, DEBOUNCE_MAX)
    const editWatch = EditorView.updateListener.of((update) => {
      if (update.docChanged)
      {
        console.log(update)

        debouncedUpdate()
      }
    })

    this.view = new EditorView({
      doc: "",
      extensions: [basicSetup, langFunc, editWatch,
        this.themeCompartment.of([EditorView.theme({...baseTheme, "&": {background : "white", color: "black", textAlign: "left"}})]),
        this.editableCompartment.of(EditorView.editable.of(this.editable))],
      parent: this.$refs["editor"]
    })

  }
}
</script>

<template>

  <div class="container-lg w-auto h-auto">
    <div class="card border-2 border-black">
      <div id = editor ref="editor">
      </div>
    </div>
  </div>
</template>

<style scoped>
  #editor{
    width: 500px;
  }
</style>