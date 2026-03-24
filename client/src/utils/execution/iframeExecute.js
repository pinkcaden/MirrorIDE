import isEscaped from '../../utils/strings/isEscaped.js'


export default class Executor {
    logOverwrite;
    uuid;
    iframe;

    constructor(parent) {
        this.uuid = crypto.randomUUID().toString();

        this.logOverwrite = `
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
        this.iframe = document.createElement("iframe")
        this.iframe.srcdoc = `<script>${this.logOverwrite}</script>`
        parent.appendChild(this.iframe)
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
        this.iframe.srcdoc = `
    <!DOCTYPE html> 
    <html lang="en">
    <head>
      <title>Page</title>
      <script>${this.logOverwrite}</script>
      ${code.css ? `<style>${code.css}</style>` : ''}
    </head>
    <body>
      ${code.html ? code.html : ''}
      ${code.js ? `<script>${code.js}<\/script>` : ''}
    </body>
    </html>
  `
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