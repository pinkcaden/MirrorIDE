

export default class WorkerExecutor {
    logOverwrite;
    uuid;
    worker;

    constructor() {
        this.uuid = crypto.randomUUID().toString();
        this.timer = null
    }

    setLogHandle(newHandler) {
        this.logHandle = newHandler;
    }
    setScope(newScope) {
        this.scope = newScope;
    }

    getWorkerCode(source) {
        return `
    function __send__(type, payload) {
      self.postMessage({
        type,
        ideSource: '${this.uuid}',
        ...payload
      });
    };
    
    let logCount = 0;
    const MAX_LOGS = 500;
    ["log","warn","error"].forEach(level => {
      console[level] = (...args) => {
        logCount += 1;
        if (logCount < MAX_LOGS) {__send__("consoleMessage", { level, args });}
      };
    });

    self.onmessage = () => {
      try {
        const result = (function() {
          (function(__send__) {
            ${source}
            })(() => {__send__("error", { error: "__send__ is not defined" })});
        })();
        
        __send__("result", { result });
      } catch (e) {
        __send__("error", { error: e.message });
      }
    };
  `
    }

    compile(code) {
        if (code.js) {

            try {
                new Function(this.getWorkerCode(code.js));
            } catch (error) {
                return [false, error.message]
            }
            console.log('workwed')

            let source = code.js.toString();
            const noStrings = source.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, '');
            if (/\bimport\b/.test(noStrings)){return [false, "Imports not allowed in MirrorIDE"]}

            return [true, "code compiled"]
        }
    }

    run(code) {
        let worker;
        try {
            const blob = new Blob([this.getWorkerCode(code.js)], { type: "application/javascript" })
            worker = new Worker(URL.createObjectURL(blob))
        } catch (err) {
            this.logHandle.apply(this.scope, [{values: [err.message], level: "error"}])
            return;
        }
        worker.addEventListener("messageerror", (err) => {
            console.error("MESSAGE ERROR:", err);
        });
        worker.addEventListener("error", (err) => {
            console.error("WORKER ERROR:", err);
        });
        console.log(this.getWorkerCode(code.js));
        worker.onmessage = (msg) => {
            if (msg.data.ideSource !== this.uuid) return;
            if (msg.data.type === "consoleMessage") {
                this.logHandle.apply(this.scope, [{values: msg.data.args, level: msg.data.level}])
            }
            if (msg.data.type === "result"){
                clearTimeout(this.timer)
                this.timer = null
            }
            if (msg.data.type === "error"){
                this.logHandle.apply(this.scope, [{values: [msg.data.error], level: "error"}])
                clearTimeout(this.timer)
                this.timer = null
            }
        };
        worker.onerror = (err) => {
            if (this.timer) {
                clearTimeout(this.timer)
                this.timer = null
            }
            this.logHandle.apply(this.scope, [{values: [err.message], level: "error"}])
        };

        this.timer = setTimeout(()=>{
            this.timer = null
            worker.terminate();
            this.logHandle.apply(this.scope, [{values: ["infinite loop / recursion"], level: "error"}])
        },3000)

        worker.postMessage(null);


    }
}
