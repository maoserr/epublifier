import browser from "webextension-polyfill";
import {Chapter, NovelMetaData} from "../common/novel_data";
import {ParserDocDef} from "../common/parser_types";

export async function setup_main(toc: boolean,
                                 chaps: Chapter[],
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
    } else {
        let curr_tab = await browser.tabs.query(
            {active: true})
        await browser.storage.local.set(
            {
                last_parse: {
                    chaps: JSON.stringify(chaps),
                    meta: JSON.stringify(meta),
                    parser: parser.parse_doc
                }
            }
        )
        await browser.scripting.executeScript(
            {
                target: {tabId: curr_tab[0].id!},
                files: ["js/sb_container.js"]
            }
        )
        window.close()
    }
}
