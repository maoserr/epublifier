function serialize_dom(dom:Document) {
  let s = new XMLSerializer();
  return s.serializeToString(dom);
}

chrome.runtime.sendMessage({
  action: "getSource",
  source: serialize_dom(document),
})
