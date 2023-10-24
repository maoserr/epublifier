import {write_info} from "./sidebar/sidebar_utils";
import {Chapter, NovelData, NovelMetaData} from "../services/novel/novel_data";
import {generate_epub} from "../services/novel/epub_generator";
import browser from "webextension-polyfill";
import {Ref} from "vue";


export async function run_epub(chaps:Ref<Chapter[]>,
                        selected_chaps:Ref<Chapter[]>,
                        meta:Ref<NovelMetaData>) {
  let epub_chaps = []
  for (let c of chaps.value) {
    if (selected_chaps.value.includes(c)) {
      epub_chaps.push(c)
    }
  }
  let nov_data: NovelData = {
    meta: meta.value,
    chapters: epub_chaps,
    filename: meta.value.title.toLowerCase().replace(/[\W_]+/g, "_") + ".epub"
  }
  if (meta.value.cover != null) {
    let response = await fetch(meta.value.cover);
    if (response.ok) {
      nov_data.cover = await response.blob();
    }
  }
  const filecontent = await generate_epub(nov_data, (msg: string) => {
    write_info(msg)
  })
  if (filecontent === undefined) {
    write_info("No file generated.")
    return
  }
  await browser.runtime.sendMessage(
    {
      cmd: "download",
      file: URL.createObjectURL(filecontent),
      filename: nov_data.filename
    }
  )
}
