import browser from "webextension-polyfill";

/**
 * Converts DOM to a string
 * @param dom
 */
function serialize_dom(dom: Document) {
    let s = new XMLSerializer();
    return s.serializeToString(dom)
}

try {
    let data = {source: serialize_dom(document), url: window.location.href};
    browser.runtime.sendMessage({
        action: "getSource",
        data: data
    }).then();
} catch (e) {
    browser.runtime.sendMessage({
        action: "getSource",
        data: null
    }).then();
}
