import browser from "webextension-polyfill";
import {ChapterInfo, NovelMetaData} from "../common/novel_data";
import {ParserDocDef} from "../common/parser_types";

export async function setup_main(toc: boolean,
                                 chaps: ChapterInfo[],
                                 meta: NovelMetaData,
                                 parser: ParserDocDef) {
    if (toc) {
        let chaps_full = chaps.map((x:ChapterInfo)=>{
            return {
                info: {
                    title: x.title,
                    url: x.url,
                    parser: x.parser,
                    parse_doc: parser.parse_doc
                },
                title: x.title,
                html: '',
                html_parsed: ''
            }
        })
        await browser.storage.local.set(
            {
                last_parse: {
                    chaps: JSON.stringify(chaps_full),
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
        await browser.scripting.executeScript(
            {
                target: {tabId: curr_tab[0].id!},
                files: ["js/sb_container.js"]
            }
        )
    }
}
