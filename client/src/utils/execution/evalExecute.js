import '../strings/extractStrings.js'
import extractStrings from "../strings/extractStrings.js";

export default class Executor {
    constructor(parent, console) {
        this.$domElement$ = parent
        this.$console$ = console
    }

    compile(code) {
        let compiledCode = code
        const strings = extractStrings(code)
        const compileData = {
            strings : {}
        }

        let id = 0
        for (const string of strings) {
            const strId = `$STRS$[${id}]`
            compileData.strings[id] = string.value
            compiledCode = compiledCode.replace(string.value, strId)
            id++
        }

        const importReg = compiledCode.matchAll(/(?<=^|[;\n\s,)])document\./g)
        const docRefReg = compiledCode.matchAll(/(?<=^|[;\n\s,)])document\./g).forEach((match) => {
            compiledCode = compiledCode.replace(match[0], 'this.$domElement$.')
        })
        const conRefReg = compiledCode.matchAll(/(?<=^|[;\n\s])console\./g).forEach((match) => {
            compiledCode = compiledCode.replace(match[0], 'this.$console$.')
        })

        id = 0
        for (const string of strings) {
            const strId = `$STRS$[${id}]`
            const value = compileData.strings[id]
            compiledCode = compiledCode.replace(strId, value)
            id++
        }
        return [true, compiledCode]
    }

    execute(code) {
        eval(code)
    }
}

// if (this._running) return
// const terminal = this.$refs['terminal']
// const source = this.$refs.jsEditor.getText().toString()
// const runButton = this.$refs.runButton
// terminal.clear()
// this._running = true
// terminal.log('Running code')
// const [compiledStatus, compiledCode] = this._executor.compile(source)
// console.log(compiledCode)
// this._executor.execute(compiledCode)
// this._running = false
// runButton.endRun()