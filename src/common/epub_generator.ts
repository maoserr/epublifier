import {NovelData} from "./novel_data";
import {TsEpub} from "tsepub"

export async function generate_epub(nov_data: NovelData, update_cb: CallableFunction): Promise<Blob | undefined> {
    try {
        const tsepub = new TsEpub({
            i18n: "en",
            title: nov_data.meta.title ?? "N/A",
            author: nov_data.meta.author ?? "N/A",
            publisher: nov_data.meta.publisher ?? "N/A",
            description: nov_data.meta.description ?? "N/A",
            tags: nov_data.tags
        });

        if (nov_data.cover != null) {
            tsepub.cover(nov_data.cover);
        }
        tsepub.date(new Date());

        let img_id = 0;
        let parser = new DOMParser();
        let s = new XMLSerializer();
        for (let i in nov_data.chapters) {
            let html_node = parser.parseFromString(nov_data.chapters[i].html_parsed, "text/html");
            let imgs = html_node.querySelectorAll("img");
            for (const img of imgs) {
                update_cb(`Fetching image ${img_id}`)
                try {
                    let img_resp = await fetch(img.src)
                    if (img_resp.ok) {
                        let img_dat = await img_resp.blob();
                        await tsepub.image(img_dat, img_id.toString())
                        let sp = html_node.createElement("span")
                        sp.innerText = `{{{ image[${img_id.toString()}] }}}`
                        img.replaceWith(sp)
                        img_id++;
                    }
                } catch (err) {
                    update_cb(`Unable to embed image ${img_id} - ${img.src}: ${err}`);
                    console.log(err)
                }
            }
            let s_html = s.serializeToString(html_node);
            let fixed_html = s_html.replaceAll(/{{{/g, "<%=").replaceAll(/}}}/g, "%>")
            tsepub.add(
                nov_data.chapters[i].title,
                fixed_html
            );
        }
        update_cb("Generating ePub");
        return await tsepub.generate(function updateCallback(metadata) {
            let cf = ""
            if (metadata.currentFile) {
                cf = ", current file = " + metadata.currentFile;
            }
            update_cb("Zip: " + metadata.percent.toFixed(2) + " %" + cf);
        });
    } catch (err) {
        update_cb(err);
    }
}
