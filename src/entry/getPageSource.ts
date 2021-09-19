import {IndexData} from "../common/novel_data";

/**
 * Converts DOM to a string
 * @param dom
 */
function serialize_dom(dom: Document) {
    let s = new XMLSerializer();
    return s.serializeToString(dom);
}

let data: IndexData = {source: serialize_dom(document), url: window.location.href};
chrome.runtime.sendMessage({
    action: "getSource",
    data: data
});
