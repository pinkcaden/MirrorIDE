

const getDocumentProxy = (html, eventTable, runId) => {
    const {document} = parseHTML(html)
    const nodeProxyHandle = {
        get: (implicit, prop) => {
            if (prop === "__$$__") {return implicit}
            if (["appendChild", "insertBefore", "replaceChild", "removeChild", "cloneNode", "insertAdjacentElement",
                "append", "prepend", "before", "after", "remove", "replaceWith", "replaceChildren"].includes(prop)) {
                return (...nodes) => {
                    const args = nodes.map(node => {return (Reflect.get(node, "__$$__"))})
                    const virtIds = args.map(node => {return node.getAttribute("virtid")})
                    self.postMessage({messageType: "moveElement", elementKey: implicit.getAttribute("virtid"), moveType: prop, args: virtIds, ideSource : runId})
                    const ret = implicit[prop](...args)
                    return ret === undefined ? undefined : new Proxy (ret, nodeProxyHandle)
                }
            } else if (prop === "innerHTML" || prop === "innerText") {
                return implicit.getAttribute(prop)
            } else if (prop.substring(0, 2) === "on") {
                if (prop in implicit) {
                }
            } else if (prop === "style") {
                const thisId = implicit.getAttribute("virtid")
                const thisStyle = implicit.style
                
                return new Proxy(thisStyle, {
                    get: (implicit, prop) => {
                        if (prop === "getPropertyValue") {
                            return (p) => {
                                return implicit.getPropertyValue(p)
                            }
                        }
                        if (prop === "setProperty") {
                            return (p, v) => {
                                implicit.setProperty(p, v)
                                self.postMessage({messageType : "setStyle", elementKey: thisId, value: v, prop: p, ideSource : runId})
                            }
                        }
                        if (prop === "removeProperty"){
                            return (p) => {
                                const curVal = implicit.getPropertyValue(prop)
                                self.postMessage({messageType : "setStyle", elementKey: thisId, value: "", prop: p, ideSource : runId})
                                return curVal
                            }
                        }               
                        console.warn("Use getPropertyValue, setProperty, and removeProperty to style elements.")
                        return undefined;        
                    },
                    set: (implicit, prop, value, receiver) => {
                        console.warn("Use getPropertyValue, setProperty, and removeProperty to style elements.")
                        return true;
                    }
                })
            }
            else if (prop === "removeEventListener" || prop === "addEventListener") {
                console.warn("use on____ attributes to assign event listeners to elements.")
                return (...args) => {}
            }
        },
        set: (implicit, prop, value) => {
            if (prop === "className") {
                implicit.setAttribute("className", value)
                self.postMessage({messageType : "className", elementKey: implicit.getAttribute("virtid"), value, ideSource : runId})
            } else if (prop === "innerHTML") {
                implicit[prop] = value
                self.postMessage({messageType: "innerHTML", elementKey: implicit.getAttribute("virtid"),
                value, ideSource : runId})
            } else if (prop === "innerText"){
                implicit.setAttribute("innerText", value)
                self.postMessage({messageType: "innerText", elementKey: implicit.getAttribute("virtid"),
                value, ideSource : runId})
            } else if (prop.substring(0,2) === "on") {
                implicit.setAttribute(prop, value)
                const newEventKey = Math.random().toString().substring(2, 10);
                const vid = implicit.getAttribute("virtid")
                const sendFunc = "__send__('" + newEventKey + "', '" + vid + "')";
                eventTable[newEventKey] = {
                    eventType: prop.substring(2),
                    eventFunc: value,
                    sendFunc,
                    elementKey: vid
                }
                self.postMessage({messageType: "onEvent", eventType: prop, elementKey: vid,
                    eventKey: newEventKey, ideSource : runId, sendFunc})
            }
            return true;
        }
        
    }
    return new Proxy(document, {
        get: (implicit, prop) => {
            if (prop === "createElement") {
                return (tagName) => {
                    const newVirtId = 'v' + Math.random().toString().substring(2, 10);
                    const newRealNode = implicit.createElement(tagName)
                    const newNode = new Proxy(newRealNode, nodeProxyHandle);
                    newRealNode.setAttribute("virtid", newVirtId);
                    self.postMessage({messageType: "createElement", elementTag: tagName, 
                        ideSource: runId,newElementId: newVirtId});
                    return newNode
                }
            } else if (["getElementById", "getElementsByTagName","getElementsByClassName", 
            "getElementsByName", "querySelector", "querySelectorAll"].includes(prop)) {
                return (specifier) => {
                    const found = implicit[prop](specifier)
                    if (Array.isArray(found)){
                        const ret = []
                        for (const node of found) {ret.push(new Proxy(node, nodeProxyHandle))}
                        return ret
                    }
                    return found === undefined ? undefined : new Proxy(found, nodeProxyHandle)
                }
            }
            else if (prop === "__setVirtCSS__"){
                return (el, val) => {
                    for (const node of implicit.querySelectorAll("*")){
                        if (node.getAttribute("virtid") === el) {
                            node.style.cssText = val;
                            return
                        }
                    }
                };
            }
        }
    })


};

export default getDocumentProxy;