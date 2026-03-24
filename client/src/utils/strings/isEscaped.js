export default function isEscaped(code, index) {
    let count = 0
    let i = index - 1
    while (code.charAt(i) === "\\") {
        count++
        i--
    }
    return count % 2 === 1
}