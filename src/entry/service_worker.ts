import browser, {Tabs} from "webextension-polyfill";

function load_main(e: any) {
    if (e.msg === 'LOAD_MAIN') {
        browser.windows.create({
            url: "main.html",
            type: "popup",
        }).then().catch(() => {});
    }
}

browser.runtime.onMessage.addListener(load_main)

function set_badge() {
    const man = browser.runtime.getManifest()
    console.info("Setting badge text")
    if (man.version == "1.0.0") {
        browser.action.setBadgeText({text: "d"}).then().catch(() => {});
    }
}

browser.runtime.onStartup.addListener(set_badge)
browser.runtime.onInstalled.addListener(set_badge)
browser.action.onClicked.addListener((tab:Tabs.Tab)=>{
    browser.scripting.executeScript(
      {
          target: {tabId: tab.id!},
          files: ["js/sb_container.js"]
      }
    ).then().catch(() => {});
})
