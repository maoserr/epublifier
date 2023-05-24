import browser from "webextension-polyfill";
import {ChapterInfo, NovelMetaData} from "../../common/novel_data";
import {ParserDocDef} from "../../common/parser_types";
import {add_float_window} from "../sidebar/sb_container"

export async function setup_main(toc: boolean,
                                 chaps: ChapterInfo[],
                                 meta: NovelMetaData,
                                 parser: ParserDocDef) {
    if (toc) {
        await browser.storage.local.set(
            {
                last_parse: {
                    chaps: JSON.stringify(chaps),
                    meta: JSON.stringify(meta),
                    parser: parser.parse_doc
                }
            }
        )
        await browser.windows.create({
            url: "main.html",
            type: "popup",
        });
        window.close()
    } else {
        let curr_tab = await browser.tabs.query(
            {active: true})
        const url = browser.runtime.getURL('js/sidebar.js')
        await browser.scripting.executeScript(
            {
                target: {tabId: curr_tab[0].id!},
                func: add_float_window,
                args: [url]
            }
        )
        window.close()
    }
}
