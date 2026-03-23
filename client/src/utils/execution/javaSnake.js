import extractStrings from '../strings/extractStrings.js'
import parseBrackets from '../strings/parseBrackets.js'
import extractNumbers from "../strings/extractNumbers.js";



export function JSNcompile(source){
    const compileData = {strings: {}, numbers: {}}
    let compiledCode = source

    const strings = extractStrings(source)
    let id = 0;
    for (const string of strings) {
        const strId = "$STR" + id + "$"
        compileData.strings[strId] = string.value
        compiledCode = compiledCode.replace(string.value, strId)
        id++
    }

    id = 0
    const numbers = extractNumbers(compiledCode)
    for (const number of numbers) {
        const numId = "$NUM" + id + "$"
        compileData.numbers[numId] = number.value
        compiledCode = compiledCode.replace(number.value, numId)
        id++
    }

    const statements = compiledCode.replace('\n','').split(";").filter(s => s !== '')

    const compiledStatements = []

    for (const statement of statements) {
        const len = statement.trim().length
        const defineReg = statement.match(/\[([^|\[\]]*)\|([^|\[\]]*)\]/)
        const funcReg = statement.match(/\(\s*([a-zA-Z]+(?:\s+[a-zA-Z$\d]+)*)\s*\)/)
        if (funcReg) console.log(funcReg[0].length, len)
        console.log(defineReg)
        console.log(funcReg)
        if (defineReg && defineReg[0].length === len) {
            const l = defineReg[1].trim()
            const r = defineReg[2].trim()
            if (l.includes(" ") || r.includes(" ")) {
                return [false, `Failed to compile: "${statement}"`, null]
            }
            compiledStatements.push(`let ${l} = ${r};`)
        } else if (funcReg && funcReg[0].length === len) {
            const words = funcReg[1].trim().split(" ")
            if (words[0] === 'log') {
                compiledStatements.push(`console.log(${words[1]});`)
            } else if (words[0] === 'error') {
                compiledStatements.push(`console.error(${words[1]});`)
            }
        } else {
            return [false, `Failed to compile: "${statement}"`, null]
        }
    }
    return [true, compiledStatements, compileData]

}

export async function* JSNrun(statements, data) {
    for (const statement of statements) {
        yield ({type: "outputLine", message: statement})
    }
}