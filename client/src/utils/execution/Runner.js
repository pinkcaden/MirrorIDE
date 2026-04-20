import getDocumentProxy from "./VirtualDOM.js";

export default class Runner {

    raceAgainstMessage(listenSource, raceId, messageType, runId) {
        return new Promise((resolve, reject) => {
            const timer = setTimeout(() => {
                cleanup();
                reject(new Error("Timed out"));
            }, 3000);

            function handler(event) {
                if (event.data?.ideSource !== runId || event.data?.messageType !== messageType || event.data?.raceId !== raceId) {
                    return
                }
                cleanup();
                resolve(event.data);
            }

            function cleanup() {
                clearTimeout(timer);
                listenSource.removeEventListener("message", handler);
            }

            listenSource.addEventListener("message", handler);
        });
    }

    constructor(root, logHandle) {
        this.frame = document.createElement('iframe')
        root.appendChild(this.frame)
        this.logHandle = logHandle;
    }

    compile(code) {
        this.parser = new DOMParser()
        const compileData = {eventTable: {}}
        const compiledCode = {html: {}}
        const idRules = {}
        let sheet;
        if (code.css && code.css.length > 0) {
            try {
                sheet = new CSSStyleSheet();
                sheet.replaceSync(code.css)
                for (const rule of sheet.cssRules) {
                    if (rule.selectorText.substring(0, 1) === "#") {
                        idRules[rule.selectorText.substring(1)] = rule
                    }
                }
            } catch (e) {
                return {valid: false, code: '', data: e.message}
            }
        }
        try {
            const doc = this.parser.parseFromString(code.html, 'text/html') // TODO: figure out why js running is changing this
            const displayDoc = this.parser.parseFromString(code.html, 'text/html')

            const nodes = doc.querySelectorAll('*')
            const displayNodes = displayDoc.querySelectorAll('*')
            for (let i = 0; i < nodes.length; i++) {
                const virtId = crypto.randomUUID().toString();
                if (nodes[i].id in idRules) {
                    idRules[nodes[i].id].selectorText = "#" + virtId;
                }
                nodes[i].setAttribute('virtid', virtId);
                displayNodes[i].id = virtId;
                let eventList = '';
                Object.values(displayNodes[i].attributes).filter(attr => attr.name.substring(0, 2) === 'on').forEach(attr => {
                    const eKey = crypto.randomUUID().toString();
                    compileData.eventTable[eKey] = {
                        eventType: attr.name.substring(2),
                        eventFunc: attr.value,
                        elementKey: virtId
                    };
                    attr.value = "__send__('" + eKey + "', '" + virtId + "')";
                    eventList += eKey + ';';
                })
                nodes[i].setAttribute('events', eventList);
                displayNodes[i].setAttribute('events', eventList);

            }

            compiledCode.html.structure = doc.body.innerHTML
            compiledCode.html.display = displayDoc.body.innerHTML
        } catch (e) {
            return {valid: false, code: '', data: e.message}
        }
        try {
            compiledCode['js'] = code.js
        } catch (e) {
            return {valid: false, code: '', data: e.message}
        }
        return {valid: true, code: compiledCode, data: compileData}
    }

    run(code, compileData) {
        let workerRunning = false;
        const runId = crypto.randomUUID().toString();
        this.frame.srcdoc = `<!DOCTYPE html>
        <html lang="en">
            <head>
                <style>${code.css ? code.css : ''}</style>
            </head>
            <body>
                <script>
                const buffer = []
                const __send__ = (eventId, elementKey) => {
                     window.parent.postMessage({
                     messageType: "domEvent",
                    eventId, elementKey,
                    ideSource: "${runId}",
                    }, "*");
                };
                let eventTable = ${JSON.stringify(compileData.eventTable)}  
                window.onmessage = (message) => {
                    if (message.data?.ideSource !== "${runId}") {return};
                    switch (message.data?.messageType) {
                        case "createElement":
                            const newElement = document.createElement(message.data.elementTag)
                            newElement.id = message.data.newElementId
                            buffer.push(newElement)
                            return;
                        case "moveElement":
                            const realArgs = [];
                                const target = document.getElementById(message.data.elementKey);
                            for (const virtId of message.data.args) {
                                const found = buffer.filter((node) => node.id === virtId)
                                if (found.length > 0) {
                                    realArgs.push(found[0]);
                                } else {
                                    realArgs.push(document.getElementById(virtId))
                                }
                            }
                            target[message.data.moveType](...realArgs)
                            return;
                        case "setStyle":
                            const found = buffer.filter((node) => node.id === message.data.elementKey)
                            if (found.length > 0) {
                                found[0].style[message.data.attribute] = message.data.value;
                            }
                            document.getElementById(message.data.elementKey).style[message.data.attribute] = message.data.value    
                    }
                }
                </script>
                ${code.html['display'] ? code.html['display'] : ''}
                
            </body>
        </html>`

        //! WORKER BLOB
        let blob;
        console.log(`${getDocumentProxy(runId)}
    let eventTable = ${JSON.stringify(compileData.eventTable)};

    let document;
    try{
        document = getDocumentProxy(${JSON.stringify(code.html.structure ? code.html.structure : '')}, eventTable, "${runId}");
    } catch(e) {console.log(e)}
    let logCount = 0;
    const MAX_LOGS = 500;
    ["log","warn","error"].forEach(level => {

      console[level] = (...args) => {
        logCount += 1;
        if (logCount < MAX_LOGS) {self.postMessage({messageType: "consoleMessage", level, args, ideSource: "${runId}"})}
      };
    });

    self.onmessage = function(e) {
        if (e.data?.ideSource !== "${runId}") {return;}
        switch (e.data.messageType) {
            case "runCode":
                try {
                    if (e.data.sourceCode.length < 1) {
                        self.postMessage({messageType: "runCodeFinish", ideSource : "${runId}", raceId: e.data.raceId}); return}
                        eval(e.data.sourceCode + \`;
                        self.addEventListener("message", e => {
                            if (e.data.ideSource !== "${runId}" || e.data.messageType !== "domEvent") {return}
                            eval(eventTable[e.data.eventId].eventFunc);
                            self.postMessage({messageType: "domEventFinish", ideSource: "${runId}", raceId: e.data.raceId});
                    }); \`);
                    self.postMessage({messageType: "runCodeFinish", ideSource : "${runId}", raceId: e.data.raceId});
                    return
                } catch (e) {self.postMessage({messageType: "codeFail", ideSource : "${runId}", errType : e.name, errMsg: e.message})}
    }}`)
        try {
            blob = new Blob([
                `${getDocumentProxy(runId)}
    let eventTable = ${JSON.stringify(compileData.eventTable)};

    let document;
    try{
        document = getDocumentProxy(${JSON.stringify(code.html.structure ? code.html.structure : '')}, eventTable, "${runId}");
    } catch(e) {console.log(e)}
    let logCount = 0;
    const MAX_LOGS = 500;
    ["log","warn","error"].forEach(level => {

      console[level] = (...args) => {
        logCount += 1;
        if (logCount < MAX_LOGS) {self.postMessage({messageType: "consoleMessage", level, args, ideSource: "${runId}"})}
      };
    });

    self.onmessage = function(e) {
        if (e.data?.ideSource !== "${runId}") {return;}
        switch (e.data.messageType) {
            case "runCode":
                try {
                    if (e.data.sourceCode.length < 1) {
                        self.postMessage({messageType: "runCodeFinish", ideSource : "${runId}", raceId: e.data.raceId}); return}
                        eval(e.data.sourceCode + \`;
                        self.addEventListener("message", e => {
                            if (e.data.ideSource !== "${runId}" || e.data.messageType !== "domEvent") {return}
                            eval(eventTable[e.data.eventId].eventFunc);
                            self.postMessage({messageType: "domEventFinish", ideSource: "${runId}", raceId: e.data.raceId});
                    }); \`);
                    self.postMessage({messageType: "runCodeFinish", ideSource : "${runId}", raceId: e.data.raceId});
                    return
                } catch (e) {self.postMessage({messageType: "codeFail", ideSource : "${runId}", errType : e.name, errMsg: e.message})}
            break;
    }}`
            ], {type: "application/javascript"})
        } catch (e) {
            console.log(e);
            return
        }
        //! MAKE WORKER
        const worker = new Worker(URL.createObjectURL(blob), {type: "module"})
        //! WORKER LISTENER
        this.workerListener = (message) => {
            if (message.data.ideSource !== runId) {
                return
            }
            switch (message.data.messageType) {
                case "codeFail":
                    workerRunning = false
                    worker.terminate();
                    console.log(message.data.errType, message.data.errMsg)
                    this.logHandle("error", [message.data.errType, message.data.errMsg])
                case "consoleMessage":
                    this.logHandle(message.data.level, message.data.args)
                    return
                case "createElement":
                    this.frame.contentWindow.postMessage(message.data)
                    return
                case "moveElement":
                    this.frame.contentWindow.postMessage(message.data)
                    return
                case "setStyle":
                    this.frame.contentWindow.postMessage(message.data)
            }
        }

        //! FRAME LISTENER
        this.frameListener = (message) => {
            if (message.data.ideSource !== runId) {
                return
            }
            const raceId = crypto.randomUUID().toString();
            message.data.raceId = raceId
            worker.postMessage(message.data)
            this.raceAgainstMessage(worker, raceId, "domEventFinish", runId).then(() => {
            }).catch((e) => {
                if (workerRunning){
                    worker.terminate();
                    this.logHandle("error", ["Infinite loop / recursion detected"])
                }
            })
        }

        window.addEventListener("message", this.frameListener)
        worker.addEventListener("message", this.workerListener)

        const runRaceId = crypto.randomUUID().toString()
        workerRunning = true;
        worker.postMessage({
            messageType: "runCode",
            ideSource: runId,
            raceId: runRaceId,
            sourceCode: (code.js ? code.js : '')
        })
        this.raceAgainstMessage(worker, runRaceId, "runCodeFinish", runId)
            .then((e) => {
            })
            .catch((e) => {
                if (workerRunning){
                    worker.terminate();
                    this.logHandle("error", ["Infinite loop / recursion detected"])
                }
            })
    }

    cleanUp() {

    }


}