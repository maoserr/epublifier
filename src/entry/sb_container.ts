import FloatWinCont from "../services/dom/FloatWinCont";
import browser from "webextension-polyfill";

const src = browser.runtime.getURL('sidebar.html')

new FloatWinCont(document, src)
