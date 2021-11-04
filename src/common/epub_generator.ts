import {NovelData} from "./novel_data";
import browser from "webextension-polyfill";

interface metadata {
    percent: number;
    currentFile: string;
}
declare class jEpub {
    constructor();
    init(opts: unknown): jEpub;
    cover(blob: Blob): jEpub;
    notes(str: string): jEpub;
    date(date: Date): jEpub;
    add(title: string, content: string | string[]): jEpub;
    generate(
        type: string,
        updateCallback: (metadata: metadata) => unknown
    ): Promise<Blob>;
    static html2text(html: string): string;
}

export async function generate_epub(nov_data: NovelData, update_cb: CallableFunction) {
    try {
        const jepub = new jEpub();
        jepub.init({
            i18n: "en",
            title: nov_data.title,
            author: nov_data.author,
            publisher: nov_data.publisher,
            description: nov_data.description,
            tags: nov_data.tags
        });
        if (nov_data.cover != null) {
            jepub.cover(nov_data.cover);
        }
        jepub.date(new Date());

        for (let i in nov_data.chapters) {
            jepub.add(
                nov_data.chapters[i].title,
                nov_data.chapters[i].html_parsed
            );
        }
        update_cb("Generating ePub");
        let filecontent: Blob = await jepub.generate("blob", function updateCallback(metadata) {
            let cf = ""
            if (metadata.currentFile) {
                cf = ", current file = " + metadata.currentFile;
            }
            update_cb("Zip: " + metadata.percent.toFixed(2) + " %" + cf);
        })
        let url = URL.createObjectURL(filecontent);
        await browser.downloads.download({
            url: url,
            filename: nov_data.filename,
        });
    } catch (err) {
        update_cb(err);
        console.log(err)
    }
}