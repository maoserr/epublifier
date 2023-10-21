import SidebarContainer from "../services/dom/SidebarContainer";
import browser from "webextension-polyfill";

const src = browser.runtime.getURL('sidebar.html')

new SidebarContainer(document,window, src)
