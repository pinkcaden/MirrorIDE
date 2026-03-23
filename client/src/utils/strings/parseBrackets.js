export default function parseBrackets(statement) {
    const ret = {
        statements: [],
        isValid: false,
        error: null
    }
    const matches = []
    const pairs = {
        '(' : ')',
        '{' : '}',
        '[' : ']'
    }
    const stack = []
    let last = { index: -1, type: null}
    for (let i = 0; i < statement.length; i++) {
        const char = statement.charAt(i)
        if (pairs[char]) {
            stack.push({type: char, index: i})
        }
        else if (Object.values(pairs).includes(char)) {
            last = stack.pop()
            if (!last.type || char !== pairs[last.type]) {
                ret.error = "Closing bracket does not correlate to correct opening bracket."
                return ret
            } else {
                ret.statements.push(statement.substring(last.index, i + 1))
            }
        }
    }
    if (stack.length !==  0) {
        ret.error = "Opening bracket does not correlate to correct opening bracket."
        return ret
    }
    ret.isValid = true
    return ret
}
