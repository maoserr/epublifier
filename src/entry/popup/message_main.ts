import browser from "webextension-polyfill";
import {ChapterInfo, NovelMetaData} from "../../common/novel_data";
import {ParserDocDef} from "../../common/parser_types";

function add_float_window(){
    let iframe = document.createElement('iframe');
    iframe.style.background = "green";
    iframe.style.height = "300px";
    iframe.style.width = "100px";
    iframe.style.position = "fixed";
    iframe.style.top = "0px";
    iframe.style.right = "0px";
    iframe.style.zIndex = "9000000000000000000";
    iframe.style.border = "0";

    document.body.appendChild(iframe);
    browser.runtime.sendMessage({cmd:"test"})
}

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
        await browser.tabs.create({
            url: "main.html",
            active: false
        });
        await browser.scripting.executeScript(
            {
                target: {tabId: curr_tab[0].id!},
                func: add_float_window
            }
        )
        window.close()
    }
}
