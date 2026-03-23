
export default function extractNumbers(code) {
    const numbers = []
    const matches = Array.from(code.matchAll(/(?<=^|[\s\[|])(\d+)(?=$|[\s\];])/g))
    for (const match of matches) {
        console.log(match)
        numbers.push({
            value: match[0],
            start: match.index,
            end: match.index + match.length - 1
        })
    }
    return numbers
}

