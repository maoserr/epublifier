import browser from "webextension-polyfill";
import {Chapter, NovelMetaData} from "../common/novel_data";

export async function onLoadGetChapters(): Promise<[Chapter[], NovelMetaData]> {
    const load_config = await browser.storage.local.get('last_parse')
    const last_parse = load_config.last_parse
    return [JSON.parse(last_parse.chaps), JSON.parse(last_parse.meta)]
}
