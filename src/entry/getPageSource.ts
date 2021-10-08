import {IndexData} from "../common/novel_data";
import browser from "webextension-polyfill";
import DOMPurify from 'dompurify';

/**
 * Converts DOM to a string
 * @param dom
 */
function serialize_dom(dom: Document) {
    let s = new XMLSerializer();
    return s.serializeToString(dom)
    // return DOMPurify.sanitize(s.serializeToString(dom));
}

let data: IndexData = {source: serialize_dom(document), url: window.location.href};
browser.runtime.sendMessage({
    action: "getSource",
    data: data
}).then();
