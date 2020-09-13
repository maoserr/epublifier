function serialize_dom(dom) {
  let s = new XMLSerializer();
  return s.serializeToString(dom);
}

chrome.runtime.sendMessage({
  action: "getSource",
  source: serialize_dom(document),
});
