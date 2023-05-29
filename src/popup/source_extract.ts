import browser from "webextension-polyfill"

interface ExtractorRes {
    error?: string
    source: string
    url: string
}

/**
 * Function to inject to extract source
 */
function injected_extractor(): ExtractorRes {
    try {
        let s = new XMLSerializer();
        return {
            source: s.serializeToString(document),
            url: window.location.href
        };
    } catch (error) {
        let message = (error instanceof Error) ? error.message : String(error)
        return {
            error: message,
            source: "",
            url: window.location.href
        };
    }
}

/**
 * Extracts source from current tab (extension) or url
 */
export async function extract_source(): Promise<ExtractorRes> {
    let curr_tab = await browser.tabs.query(
        {active: true})
    let inj_res = await browser.scripting.executeScript(
        {
            target: {tabId: curr_tab[0].id!},
            func: injected_extractor
        }
    )
    let res = inj_res[0].result
    if ('error' in res) {
        throw Error(res.error)
    }
    return res
}
