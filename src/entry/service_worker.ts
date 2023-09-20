import browser, {Tabs} from "webextension-polyfill";

function set_badge() {
  const man = browser.runtime.getManifest()
  console.info("Setting badge text")
  if (man.version == "1.0.0") {
    browser.action.setBadgeText({text: "d"}).then().catch(() => {
    });
  }
}

browser.runtime.onStartup.addListener(set_badge)
browser.runtime.onInstalled.addListener(set_badge)
browser.action.onClicked.addListener((tab: Tabs.Tab) => {
  browser.scripting.executeScript(
    {
      target: {tabId: tab.id!},
      files: ["js/sb_container.js"]
    }
  ).then().catch((err) => {
    window.alert(err)
  });
})

async function msg_proc(data: any) {
  if (data.cmd == "download") {
    await browser.downloads.download({
      url: data.file,
      filename: data.filename,
    });
  } else if (data.cmd == "report") {
    const ext = browser.runtime.getManifest()
    const browser_name = ('browser_specific_settings' in ext)? "Firefox" : "Chrome"
    browser.tabs.create({
      url: 'https://github.com/maoserr/epublifier/issues/new?'
        + 'assignees=maoserr&labels=bug&projects=&template=bug_report.md&'
        + 'title=%5BBUG%5D+New+bug:+'+encodeURIComponent(data.origin)+'&body=**Describe the bug**%0A'
        + 'A clear and concise description of what the bug is.%0A%0A'
        + '**Required info (please complete the following information):**%0A'
        + ' - Url: ' + encodeURIComponent(data.origin) + '%0A'
        + ' - Browser: ' + encodeURIComponent(browser_name) + '%0A'
        + ' - Extension Version: ' + encodeURIComponent(ext.version)
    })
  }
}

browser.runtime.onMessage.addListener(msg_proc)
