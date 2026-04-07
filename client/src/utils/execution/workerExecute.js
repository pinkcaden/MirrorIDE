

export default class Executor {
    logOverwrite;
    uuid;
    worker;

    constructor(parent) {
        this.uuid = crypto.randomUUID().toString();

        parent.appendChild(this.iframe)
    }

    getWorkerCode(source) {
        return `
        (function() {
        function send (level, args) {
            parent.postMessage({
                type: 'consoleMessage',
                ideSource: '${this.uuid}',
                level: level,
                args: args
            });
        }

        ["log", "warn", "error"].forEach((level)=>{
            console[level] = function(...args) {
                send(level, args);
            }
            });
        })();`
    }

    compile(code) {
        if (code.js) {
            let source = code.js.toString();
            const noStrings = source.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, '');
            if (/\bimport\b/.test(noStrings)){return [false, "Imports not allowed in MirrorIDE"]}
            return [true, "code compiled"]

        }
    }

    run(code) {

    }

    applyListener = (consoleWork, scope) => {
        const id = this.uuid
        window.addEventListener("message", (e) => {
            if (e.data?.type !== "consoleMessage") return
            if (e.data.ideSource === id) {
                consoleWork.apply(scope, [{values: e.data.args, level: e.data.level}])
            }
        });
    }
}
