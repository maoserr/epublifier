import {browser} from "../../common/browser_utils"

interface RequestResponse {
    action: string
    data: string | null
}

function source_received(request: RequestResponse): string | null {
    browser.runtime.onMessage.removeListener(source_received)
    if (request.action == "getSource") {
        return request.data;
    } else {
        return null
    }
}

async function extract_curr_source() {
    let curr_tab = await browser.tabs.query({active: true})
    browser.scripting.executeScript(
        {
            target: {tabId: curr_tab[0].id!},
            files: ["js/getPageSource.js"]
        }
    )
}

export async function extract_source(url?: string): Promise<string> {
    let res: Promise<string>
    if (url != undefined) {
        let fres = await fetch(url)
        res = fres.text()
    } else if (browser != undefined) {
        res = new Promise((resolve, reject) => {
            browser.runtime.onMessage.addListener(
                (request: RequestResponse) => {
                    let res = source_received(request)
                    if (res == null) reject("Failed to inject")
                    resolve(res!)
                })
        })
        try {
            await extract_curr_source()
        } catch(error: any) {
            browser.runtime.onMessage.removeListener(source_received)
            res = new Promise((resolve, reject) => reject(error))
        }
    } else {
        return new Promise((resolve, reject) => {
            reject("No URL passed in and not in browser")
        })
    }
    return res
}
