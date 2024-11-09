import browser, {DeclarativeNetRequest, Tabs} from "webextension-polyfill";
import Rule = DeclarativeNetRequest.Rule;

function set_badge() {
  const man = browser.runtime.getManifest()
  console.info("Setting badge text")
  if (man.version == "1.0.0") {
    browser.action.setBadgeText({text: "d"}).then().catch(() => {
    });
  }
  const rules: Rule[] = [{
    id: 1,
    condition: {
      initiatorDomains: [browser.runtime.id],
      resourceTypes: ['xmlhttprequest', 'image'],
    },
    action: {
      type: 'modifyHeaders',
      requestHeaders: [{
        header: 'Referer',
        operation: 'set',
        value: 'https://sspai.com',
      }],
    },
  }];
  browser.declarativeNetRequest.updateDynamicRules({
    removeRuleIds: rules.map(r => r.id),
    addRules: rules,
  }).then(r=>console.log(`Rule successfully added: ${browser.runtime.getURL("")}`)).catch(
    e => console.error("Failed to add rule")
  );
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
  });
})

async function msg_proc(data: any) {
  switch (data.cmd) {
    case "download": {
      await browser.downloads.download({
        url: data.file,
        filename: data.filename,
      });
      break;
    }
    case "report": {
      const ext = browser.runtime.getManifest()
      const browser_name = ('browser_specific_settings' in ext) ? "Firefox" : "Chrome"
      await browser.tabs.create({
        url: 'https://github.com/maoserr/epublifier/issues/new?'
          + 'assignees=maoserr&labels=bug&projects=&template=bug_report.md&'
          + 'title=%5BBUG%5D+New+bug:+' + encodeURIComponent(data.origin) + '&body=**Describe the bug**%0A'
          + 'A clear and concise description of what the bug is.%0A%0A'
          + '**Required info (please complete the following information):**%0A'
          + ' - Url: ' + encodeURIComponent(data.origin) + '%0A'
          + ' - Browser: ' + encodeURIComponent(browser_name) + '%0A'
          + ' - Extension Version: ' + encodeURIComponent(ext.version)
      })
      break;
    }
  }
}

browser.runtime.onMessage.addListener(msg_proc)
