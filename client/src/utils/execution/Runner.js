import getDocumentProxy from "./VirtualDOM.js";

export default class Runner {
    raceAgainstMessage(listenSource, raceId, messageType, runId) {
        return new Promise((resolve, reject) => {
            this.timer = setTimeout(() => {
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
            const timer = this.timer;
            function cleanup() {
                clearTimeout(timer);
                listenSource.removeEventListener("message", handler);
            }
            listenSource.addEventListener("message", handler);
        });
    }

    findById(id) {
        for (let node of this.buffer){
            if (node.id === id) {
                return node;
            }
        }
        return this.frameDoc.getElementById(id);
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
                const doc = this.parser.parseFromString(code.html, 'text/html');
                const displayDoc = this.parser.parseFromString(code.html, 'text/html');
                const nodes = doc.querySelectorAll('*');
                const displayNodes = displayDoc.querySelectorAll('*');
                for (let i = 0; i < nodes.length; i++) {
                    const node = nodes[i];
                    const nodeId = node.id;
                    const displayNode = displayNodes[i];
                    //!FIND RESTRICTED TAG TYPES
                    const tag = node.tagName.toLowerCase();
                    if (tag === "a" && node.href !== "") {
                        return {valid: false, code: '', data: `"a" tags may not contain links in MirrorIDE`};
                    }
                    if (["script", "iframe", "src", "style", "canvas", "img", "video"].includes(tag)) {
                        return {valid: false, code: '', data: `"${tag}" tags are not allowed in MirrorIDE`};
                    }
                    const virtId = 'v' + Math.random().toString().substring(2, 10);
                    if (nodeId in idRules) {
                        let ruleText = idRules[nodeId].cssText;
                        ruleText = ruleText.substring(ruleText.indexOf('{'), ruleText.length);
                        newSheet.insertRule(`#${virtId} ${ruleText}`);
                    }

                    node.setAttribute('virtid', virtId);
                    displayNode.id = virtId;
                    let eventList = '';
                    Object.values(displayNode.attributes).filter(attr => attr.name.substring(0, 2) === 'on').forEach(attr => {
                        const eKey = Math.random().toString().substring(2, 10);
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
            if (!code.js || code.js.length === 0) {
                compiledCode['js'] = `() => {};`
            } else {
                const noStrings = code.js.replace(/(["'`])(?:\\.|(?!\1).)*\1/g, '');
                const restrictedKeywords = ["import", "async", "await"]
                let regex = new RegExp(String.raw`(?:^|[\s;])(?:${restrictedKeywords.join("|")})(?:$|[\s;])`, "g");
                let result = regex.exec(noStrings)
                if (result){return {valid: false, data: `${result[0]} keyword is not allowed in MirrorIDE`}}
                compiledCode['js'] = code.js
            }
        } catch (e) {
            return {valid: false, code: '', data: e.message}
        }
        return {valid: true, code: compiledCode, data: compileData}
    }

    run(code, compileData) {
        this.workerRunning = false;
        this.frame.srcdoc = undefined;
        const runId = Math.random().toString().substring(2, 10);
        //! WORKER BLOB
        try {
            const blob = new Blob([`
    import {parseHTML} from 'https://esm.sh/linkedom';
    const getDocumentProxy = ${getDocumentProxy.toString()}
    let eventTable = ${JSON.stringify(compileData.eventTable)};

    let document;
    try{
        document = getDocumentProxy(${JSON.stringify(code.html.structure ? code.html.structure : '')}, eventTable, "${runId}");
    } catch(e) {console.log(e)}
    
    let logCount = 0;
    const MAX_LOGS = 1000;
    ["log","warn","error"].forEach(level => {
      console[level] = (...args) => {
        logCount += 1;
        for (let i = 0; i < args.length; i += 1) {
            if (args[i] === undefined) {
                args[i] = 'undefined'
            } else if (args[i] === null) {
                args[i] = 'null'
            } else if (typeof args[i] !== 'string') {
                args[i] = JSON.stringify(args[i]);
            }
        }
        if (logCount < MAX_LOGS) {self.postMessage({messageType: "consoleMessage", level, args, ideSource: "${runId}"})}
      };
    });

    ["alert", "close", "setImmediate", "setTimeout", "setInterval", "clearTimeout", "clearInterval", "fetch"].forEach(func => {
        globalThis[func] = (...args) => {console.warn(func + " is not available in"); return null;}
        self[func] = (...args) => {console.warn(func + " is not available in MirrorIDE"); return null;}
    })

    self.onmessage = function(e) {
        if (e.data?.ideSource !== "${runId}") {return;}
        switch (e.data.messageType) {
            case "runCode":
                try {
                    if (e.data.sourceCode.length < 1) { self.postMessage({messageType: "runCodeFinish", ideSource : "${runId}", raceId: e.data.raceId}); return}
                        eval(e.data.sourceCode + \`;
                        self.addEventListener("message", e => {
                            if (e.data.ideSource !== "${runId}" || e.data.messageType !== "domEvent") {return}
                            try {
                                eval(eventTable[e.data.eventId].eventFunc);
                            } catch (e) {self.postMessage({messageType: "codeFail", ideSource : "${runId}", errType : e.name, errMsg: e.message});}
                            self.postMessage({messageType: "domEventFinish", ideSource: "${runId}", raceId: e.data.raceId});
                    }); \`);
                    self.postMessage({messageType: "runCodeFinish", ideSource : "${runId}", raceId: e.data.raceId});
                    return
                } catch (e) {self.postMessage({messageType: "codeFail", ideSource : "${runId}", errType : e.name, errMsg: e.message});}
                return;
            case "styleUpdate":
                document.__setVirtCSS__(e.data.elementKey, e.data.value)
    }}`
            ], {type: "application/javascript"});
            //! MAKE WORKER
            this.worker = new Worker(URL.createObjectURL(blob), {type: "module"})
        } catch (e) {
            console.log(e);
            return;
        }

        //! WORKER LISTENER
        this.buffer = []
        this.workerListener = (message) => {
            if (message.data.ideSource !== runId) {
                return;
            }
            if (message.data.messageType === "codeFail") {
                this.worker.terminate();
                this.workerRunning = false;
                this.cleanUp();
                this.logHandle("error", [message.data.errType, message.data.errMsg]);
                return;
            }
            switch (message.data.messageType) {
                case "consoleMessage":
                    this.logHandle(message.data.level, message.data.args);
                    return;
                case "innerText":
                    this.findById(message.data.elementKey).innerText = message.data.value;
                    return;
                case "setStyle":
                    this.findById(message.data.elementKey).style.setProperty(message.data.prop, message.data.value);
                    return;
                case "innerHTML":
                    const doc = this.parser.parseFromString(message.data.value, 'text/html');
                    Array.from(doc.querySelectorAll('*')).forEach((node) => {
                        for (const attr in node) {
                            if (attr.substring(0, 2) === "on" && !(node.getAttribute(attr) === null ||
                                node.getAttribute(attr) === undefined || node.getAttribute(attr) === "")) {
                                this.logHandle("warn", ["Inline event handlers are not allowed in innerHTML."]);
                                node.setAttribute(attr, "");
                            }
                        }
                    })
                    this.findById(message.data.elementKey).innerHTML = message.data.value;
                    return;
                case "createElement":
                    const newElement = this.frameDoc.createElement(message.data.elementTag);
                    newElement.id = message.data.newElementId;
                    this.buffer.push(newElement);
                    return;
                case "moveElement":
                    const realArgs = [];
                    const moveTarget = this.frameDoc.getElementById(message.data.elementKey);
                    for (const virtId of message.data.args) {
                        realArgs.push(this.findById(virtId));
                    }
                    moveTarget[message.data.moveType](...realArgs)
                    return;
                case "className":
                    const classTarget = this.findById(message.data.elementKey);
                    classTarget.className = message.data.value
                    const style = getComputedStyle(classTarget);
                    let styleStr = '{'
                    for (const prop of style) {
                        if (!(prop.substring(0,4) === "-web" || prop.substring(0,4) === "anim"
                            || prop.substring(0, 4) === "time")){
                            styleStr += prop + " : " + style[prop] + "; ";
                        }
                    }
                    styleStr += '}';
                    this.worker.postMessage({messageType: "styleUpdate", ideSource: runId, elementKey: classTarget.id, value: styleStr});
                    return
                case "onEvent":
                    console.log("gotcha")
                    const eventTarget = this.findById(message.data.elementKey);
                    eventTarget.setAttribute(message.data.eventType, message.data.sendFunc)
                    return
            }
        }

        //! FRAME LISTENER
        this.frameListener = (message) => {
            if (message.data.ideSource !== runId) {
                return;
            }
            if (message.data.messageType === "domEvent"){
                const raceId = Math.random().toString().substring(2, 10);
                message.data.raceId = raceId;
                this.worker.postMessage(message.data);
                this.raceAgainstMessage(this.worker, raceId, "domEventFinish", runId)
                    .then(() => {clearTimeout(this.timer);})
                    .catch((e) => {
                    if (this.workerRunning) {
                        this.cleanUp();
                        this.worker.terminate();
                        this.logHandle("error", ["Infinite loop / recursion detected. \nThe script has been terminated."]);
                    }
                })
            }
        }

        window.addEventListener("message", this.frameListener)
        this.worker.addEventListener("message", this.workerListener)

        const loadListener = () => {
            this.frameDoc = this.frame.contentDocument;
            const runRaceId = Math.random().toString().substring(2, 10);
            this.workerRunning = true;
            this.worker.postMessage({ messageType: "runCode", ideSource: runId, raceId: runRaceId, sourceCode: code.js});
            this.raceAgainstMessage(this.worker, runRaceId, "runCodeFinish", runId)
                .then((e) => {
                    this.frame.removeEventListener("load", loadListener);
                    clearTimeout(this.timer);
                })
                .catch((e) => {
                    if (this.workerRunning) {
                        clearTimeout(this.timer);
                        this.frame.removeEventListener("load", loadListener);
                        this.worker.terminate();
                        this.cleanUp();
                        this.logHandle("error", ["Infinite loop / recursion detected. \nThe script has been terminated."]);
                    }
                })
        }
        this.frame.addEventListener("load", loadListener)

        //!FRAME -> INTERFACE
        this.frame.srcdoc = `<!DOCTYPE html>
        <html lang="en">
            <head>
            <script>
            const buffer = [];
            const __send__ = (eventId, elementKey) => {
                 window.parent.postMessage({
                     messageType: "domEvent",
                     eventId, elementKey,
                     ideSource: "${runId}",
                 }, "*");
            };
            let eventTable = ${JSON.stringify(compileData.eventTable)};
            </script>
            </head>
            <body>
            ${code.html['display'] ? code.html['display'] : ''}
            </body>
        </html>`
        }

    cleanUp() {
        clearTimeout(this.timer);
        if (this.frameListener) {
            window.removeEventListener("message", this.frameListener);
        }
        if (this.workerListener) {
            this.worker.removeEventListener("message", this.workerListener);
        }
    }


}