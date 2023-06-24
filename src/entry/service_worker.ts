import browser from "webextension-polyfill";

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
