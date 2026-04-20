

const getDocumentProxy = (runId) => {return`
import {parseHTML} from 'https://esm.sh/linkedom';
const getDocumentProxy = (html, eventTable, runId) => {
    const {document} = parseHTML(html)
    const nodeProxyHandle = {
        get: (implicit, prop) => {
            if (prop === "SECRET") {return implicit}
            if (["appendChild", "insertBefore", "replaceChild", "removeChild", "cloneNode", "insertAdjacentElement",
                "append", "prepend", "before", "after", "remove", "replaceWith", "replaceChildren"].includes(prop)) {
                return (...nodes) => {
                    const args = nodes.map(node => {return (Reflect.get(node, "SECRET"))})
                    const virtIds = args.map(node => {return node.getAttribute("virtid")})
                    self.postMessage({messageType: "moveElement", elementKey: implicit.getAttribute("virtid"), moveType: prop, args: virtIds, ideSource : "${runId}"})
                    const ret = implicit[prop](...args)
                    return ret === undefined ? undefined : new Proxy (ret, nodeProxyHandle)
                }
            } else if (prop.substring(0, 2) === "on") {
                if (prop in implicit) {
                }
            } else if (prop === "style") {
                const thisId = implicit.getAttribute("virtid")
                return new Proxy(implicit.style, {
                    get: (implicit, prop) => {
                        return implicit[prop]
                    },
                    set: (implicit, prop, value, receiver) => {
                        implicit[prop] = value
                        self.postMessage({messageType : "setStyle", elementKey: thisId,
                            value, attribute: prop, ideSource : "${runId}"})
                        return true;
                    }
                })
            }
        },
        set: (implicit, prop, value) => {
            if (prop === "innerHTML") {
                implicit[prop] = value
                self.postMessage({messageType: "innerHTML", elementKey: implicit.getAttribute("virtid"),
                value, ideSource : "${runId}"})
            }
            if (prop.substring(0,2) === "on") {

            }
        }
        
    }
    return new Proxy(document, {
        get: (implicit, prop) => {
            if (prop === "createElement") {
                return (tagName) => {
                    const newVirtId = crypto.randomUUID().toString();
                    const newRealNode = implicit.createElement(tagName)
                    const newNode = new Proxy(newRealNode, nodeProxyHandle);
                    newRealNode.setAttribute("virtid", newVirtId);
                    self.postMessage({messageType: "createElement", elementTag: tagName, 
                        ideSource: "${runId}",newElementId: newVirtId});
                    return newNode
                }
            } else if (["getElementById", "getElementsByTagName"].includes(prop)) {
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
        }
    })


};`}

export default getDocumentProxy