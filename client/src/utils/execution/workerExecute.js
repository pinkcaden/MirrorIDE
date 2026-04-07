

export default class WorkerExecutor {
    logOverwrite;
    uuid;
    worker;

    constructor() {
        this.uuid = crypto.randomUUID().toString();

    }

    setLogHandle(newHandler) {
        this.logHandle = newHandler;
    }
    setScope(newScope) {
        this.scope = newScope;
    }

    getWorkerCode(source) {
        return `
    function send(type, payload) {
      self.postMessage({
        type,
        ideSource: '${this.uuid}',
        ...payload
      });
    }

    ["log","warn","error"].forEach(level => {
      console[level] = (...args) => {
        send("consoleMessage", { level, args });
      };
    });

    self.onmessage = () => {
      try {
        const result = (function() {
          ${source}
        })();

        send("result", { result });
      } catch (e) {
        send("error", { error: e.message });
      }
    };
  `
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
        console.log("run")
        console.log(this.logHandle)
        console.log(this.scope)
        const blob = new Blob([this.getWorkerCode(code.js)], { type: "application/javascript" })
        const worker = new Worker(URL.createObjectURL(blob))
        console.log(worker)
        worker.onmessage = (e) => {
            if (e.data.ideSource !== this.uuid) return;
            // if (e.data.type === "consoleMessage") {
                this.logHandle.apply(this.scope, [{values: e.data.args, level: e.data.level}])
            // }
            if (e.data.type === "result"){
                clearTimeout(timer);
            }
        };
        worker.onerror = (err) => {
            console.error("Worker error:", err);
        };

        const timer = setTimeout(()=>{
            worker.terminate();
            this.logHandle.apply(this.scope, [{values: ["infinite loop / recursion"], level: "error"}])
        },3000)

        worker.postMessage(null);


    }
}
