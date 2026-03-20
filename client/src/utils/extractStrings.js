// Weird. "//" in a string literal evaluates to "/". So a case returning true is "///""
function isEscaped(code, index) {
    let count = 0
    let i = index - 1
    while (code.charAt(i) === "\\") {
        count++
        i--
    }
    return count % 2 === 1
}

export default function extractStrings(code) {
    let inString = false
    let stringChar = {value: null, index: null}
    let stringChars = ['"', "'", '`']
    let strings = []
    for (let i = 0; i < code.length; i++) {
        let char = code.charAt(i)

        if (!inString) {
            if (stringChars.includes(char)) {
                inString = true
                stringChar = {value: char, index: i}
            }
        } else {
            if (char === stringChar.value && !isEscaped(code, i)) {
                inString = false
                const start = stringChar.index + 1
                strings.push({
                    value: code.slice(stringChar.index + 1, i),
                    start: start - 1,
                    end: i
                })
                stringChar = null
            }
        }
    }
    return strings
}
