import isEscaped from '../../utils/strings/isEscaped.js'


export default class IframeExecutor {
    logOverwrite;
    uuid;
    iframe;

    constructor(parent) {
        this.uuid = crypto.randomUUID().toString();

        this.logOverwrite = `
        (function() {
        function send (type, payload) {
            window.parent.postMessage({
                type,
                ideSource: '${this.uuid}',
                ...payload
            }, "*");
        }

        ["log", "warn", "error"].forEach((level)=>{
            console[level] = (...args) => {
                send("consoleMessage", { level, args });
            };
            });
        })();`
        this.iframe = document.createElement("iframe")
        this.iframe.sandbox = "allow-scripts "
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
        console.log(code.js.toString());
        const jsCancelTimeout =
            `(function(){${code.js.toString()}; window.parent.postMessage({type: 'done', ideSource: '${this.uuid}'}, "*");})()`

        const timeOut = setTimeout(() => {
            console.log("timing out")
            this.iframe.srcdoc = "";
        }, 3000)

        // ToDo: stop this from adding the event listener everytime run is clicked.
        window.addEventListener("message",(e) => {
            if (e.data?.type === "done" && e.data?.ideSource === this.uuid){
                console.log("finished")
                clearTimeout(timeOut)
            }
        })

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
      ${code.js ? `<script>${jsCancelTimeout}<\/script>` : ''}
    </body>
    </html>
`
        console.log(this.iframe.srcdoc)
    }



    applyListener = (consoleWork, scope) => {
        const id = this.uuid
        window.addEventListener("message", (e) => {
            console.log(e.data?.type)
            if (e.data?.type !== "consoleMessage") return
            if (e.data.ideSource === id) {
                consoleWork.apply(scope, [{values: e.data.args, level: e.data.level}])
            }
        });
    }
}