import getDocumentProxy from "./VirtualDOM.js";
import debounceMaxWait from "../timing/debounceMaxWait.js";

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
        this.frame = document.createElement('iframe');
        this.frame.srcdoc = '';
        root.appendChild(this.frame);
        this.logHandle = logHandle;
    }

    compile(code) {
        this.cleanUp();
        this.parser = new DOMParser();
        const compileData = {eventTable: {}};
        const compiledCode = {html: {}};
        const idRules = {};
        let sheet;
        let newSheet = new CSSStyleSheet();
        //!GET ID RULES FROM CSS
        if (code.css && code.css.length > 0) {
            try {
                sheet = new CSSStyleSheet();
                sheet.replaceSync(code.css);
                for (const rule of sheet.cssRules) {
                    if (rule.selectorText.substring(0, 1) === "#") {
                        idRules[rule.selectorText.substring(1)] = rule;
                    }
                }
            } catch (e) {
                return {valid: false, code: '', data: e.message};
            }

        }
        if (code.html && code.html !== "") {
            try {
                this.mutationObservers = [];
                const doc = this.parser.parseFromString(code.html, 'text/html');
                const displayDoc = this.parser.parseFromString(code.html, 'text/html');
                const nodes = doc.querySelectorAll('*');
                const displayNodes = displayDoc.querySelectorAll('*');
                for (let i = 0; i < nodes.length; i++) {
                    const node = nodes[i];
                    const nodeId = node.id;
                    const displayNode = displayNodes[i];
                    //!FIND RESTRICTED TAG TYPES
                    if (nodeId === "a" && node.href !== "") {
                        return {valid: false, code: '', data: `"a" tags cannot contain linksallowed in MirrorIDE`};
                    }
                    if (["script", "iframe", "src", "style"].includes(nodeId)) {
                        return {valid: false, code: '', data: `"${nodeId}" tags are not allowed in MirrorIDE`};
                    }
                    const virtId = 'v' + crypto.randomUUID().toString();
                    if (nodeId in idRules) {
                        let ruleText = idRules[nodeId].cssText;
                        ruleText = ruleText.substring(ruleText.indexOf('{'), ruleText.length);
                        newSheet.insertRule(`#${virtId} ${ruleText}`);
                    }

                    node.setAttribute('virtid', virtId);
                    displayNode.id = virtId;
                    let eventList = '';
                    Object.values(displayNode.attributes).filter(attr => attr.name.substring(0, 2) === 'on').forEach(attr => {
                        const eKey = crypto.randomUUID().toString();
                        const sendFunc = "__send__('" + eKey + "', '" + virtId + "')";
                        compileData.eventTable[eKey] = {
                            eventType: attr.name.substring(2),
                            eventFunc: attr.value,
                            sendFunc: sendFunc,
                            elementKey: virtId
                        };
                        attr.value = sendFunc;
                        eventList += eKey + ';';
                    })
                    node.setAttribute('events', eventList);
                    displayNode.setAttribute('events', eventList);



                }
                //! APPLY STYLE SHEETS
                if (code.css && code.css.length > 0 && code.html) {
                const displayCss = displayDoc.createElement('style')
                    Array.from(sheet.cssRules).map((rule) => {
                        return rule.cssText
                    }).join(' ')
                    displayCss.innerText =
                        Array.from(newSheet.cssRules).map((rule) => {
                            return rule.cssText
                        }).join(' ') + ' ' +
                        Array.from(sheet.cssRules).map((rule) => {
                            return rule.cssText
                        }).join(' ')
                    displayDoc.body.prepend(displayCss)
                }


                compiledCode.html.structure = doc.body.innerHTML
                compiledCode.html.display = displayDoc.body.innerHTML
            } catch (e) {
                return {valid: false, code: '', data: e.message}
            }
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
        //! FRAME -> INTERFACE
        this.frame.srcdoc = `<!DOCTYPE html>
        <html lang="en">
            <head>
            <script>
            const debounceMaxWait = ${debounceMaxWait};
            const buffer = [];
            const __send__ = (eventId, elementKey) => {
                 window.parent.postMessage({
                     messageType: "domEvent",
                     eventId, elementKey,
                     ideSource: "${runId}",
                 }, "*");
            };
            
            let eventTable = ${JSON.stringify(compileData.eventTable)};
            window.addEventListener("message", (message) => {
                if (message.data?.ideSource !== "${runId}") {return;}
                switch (message.data?.messageType) {
                    case "createElement":
                        const newElement = document.createElement(message.data.elementTag);
                        newElement.id = message.data.newElementId;
                        buffer.push(newElement);
                        return;
                    case "moveElement":
                        const realArgs = [];
                            const target = document.getElementById(message.data.elementKey);
                        for (const virtId of message.data.args) {
                            const found = buffer.filter((node) => node.id === virtId);
                            if (found.length > 0) {
                                realArgs.push(found[0]);
                            } else {
                                realArgs.push(document.getElementById(virtId));
                            }
                        }
                        target[message.data.moveType](...realArgs)
                        return;
                    case "setStyle":
                        const found = buffer.filter((node) => node.id === message.data.elementKey);
                        if (found.length > 0) {
                            found[0].style.setProperty(message.data.prop, message.data.value);
                        } else{
                            document.getElementById(message.data.elementKey).style.setProperty(message.data.prop, message.data.value);
                        }
                        return
                    }})
            
            </script>
            </head>
            <body>

            ${code.html['display'] ? code.html['display'] : ''}
            
            <script>
            let mutationObservers = [];
            
            window.addEventListener("message", event => {
                if (event.data?.messageType !== "stopUpdates" || event.data?.ideSource !== "${runId}") {return;}
                    mutationObservers.forEach(observer => {
                        observer.disconnect();
                    })
            })

            for(const node of document.querySelectorAll("*")){
                const observer = new MutationObserver((mutations, observer) => {
                    for (const m of mutations) {
                       
                        // for (const prop of newStyle) {
                        //     if (!(prop.substring(0,9) === "animation" || prop.substring(0,4) === "view"
                        //     || prop.substring(0,7) === "-webkit") || prop.substring(0,8) === "timeline"){
                        //        
                        //     }
                        // }
                    }
                });
                mutationObservers.push(observer);
                observer.observe(node, {attributes: true, attributeFilter : ["style", "classList", "class"]})
            }
            
            </script>
            </body>
        </html>`

        //! WORKER BLOB
        let blob;

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
        
        for (let i = 0; i < args.length; i += 1) {
            if (args[i] === undefined) {
                args[i] = 'undefined'
            } else if (args[i] === null) {
                args[i] = 'null'
            } else {
                args[i] = JSON.stringify(args[i]);
            }
        }
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
        this.worker = new Worker(URL.createObjectURL(blob), {type: "module"})
        //! WORKER LISTENER
        this.workerListener = (message) => {
            if (message.data.ideSource !== runId) {
                return
            }
            switch (message.data.messageType) {
                case "codeFail":
                    this.worker.terminate();
                    workerRunning = false
                    this.cleanUp(runId)
                    this.logHandle("error", [message.data.errType, message.data.errMsg])
                    return
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
                    return
                case "innerHTML":
                    const doc = this.parser.parseFromString(message.data.value, 'text/html')
                    Array.from(doc.querySelectorAll('*')).forEach((node) => {
                        for (const attr in node) {
                            if (attr.substring(0, 2) === "on" && !(node.getAttribute(attr) === null ||
                                node.getAttribute(attr) === undefined || node.getAttribute(attr) === "")) {
                                this.logHandle("warn", ["Inline event handlers are not allowed in innerHTML."])
                                return
                            }
                        }
                    })
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
            this.worker.postMessage(message.data)
            this.raceAgainstMessage(this.worker, raceId, "domEventFinish", runId).then(() => {
            }).catch((e) => {
                if (workerRunning) {
                    this.cleanUp(runId)
                    this.worker.terminate();
                    this.logHandle("error", ["Infinite loop / recursion detected"])
                }
            })
        }

        window.addEventListener("message", this.frameListener)
        this.worker.addEventListener("message", this.workerListener)

        const runRaceId = crypto.randomUUID().toString()
        workerRunning = true;
        this.worker.postMessage({
            messageType: "runCode",
            ideSource: runId,
            raceId: runRaceId,
            sourceCode: (code.js ? code.js : '')
        })
        this.raceAgainstMessage(this.worker, runRaceId, "runCodeFinish", runId)
            .then((e) => {
            })
            .catch((e) => {
                if (workerRunning) {
                    this.worker.terminate();
                    this.cleanUp(runId)
                    this.logHandle("error", ["Infinite loop / recursion detected"])
                }
            })
    }

    cleanUp(runId) {
        if (this.frame.srcdoc !== ''){
            this.frame.contentWindow.postMessage({messageType: "stopUpdates", ideSource: runId})
        }
        if (this.frameListener){
            window.removeEventListener("message", this.frameListener)
        }
        if (this.workerListener){
            this.worker.removeEventListener("message", this.workerListener)
        }
    }


}