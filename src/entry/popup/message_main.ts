import browser from "webextension-polyfill";
import {ChapterInfo, NovelMetaData} from "../../common/novel_data";
import {ParserDocDef} from "../../common/parser_types";

export async function setup_main(toc: Boolean,
                          chaps: ChapterInfo[],
                          meta: NovelMetaData,
                          parser: ParserDocDef) {
    await browser.storage.local.set(
        {last_parse:{chaps:JSON.stringify(chaps), meta:JSON.stringify(meta), parser:parser.parse_doc}}
    )
    await browser.windows.create({
        url: "main.html",
        type: "popup",
    });
}
