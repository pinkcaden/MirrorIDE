import extractStrings from './extractStrings.js'
import parseBrackets from './parseBrackets.js'

String.prototype.replaceAt = function (target, replacement) {
    const start = this.indexOf(target)
    const end = start + target.length
    return this.substring(0, start - 1) + replacement + this.substring(end + 1, this.length)
}

export function JSNcompile(source){
    const compileData = {strings: {}}
    let compiledCode = source
    const strings = extractStrings(source)

    let id = 0;
    for (const string of strings) {
        const strId = "__STR" + id + "__"
        compileData.strings[strId] = string.value
        compiledCode = compiledCode.replaceAt(string.value, strId)
        id++
    }
    const statements = 

    return [true, statements, compileData]

}

export async function* JSNrun(statements) {
    for (const statement of statements) {
        yield ({type: "outputLine", message: statement.toUpperCase()})
    }
}