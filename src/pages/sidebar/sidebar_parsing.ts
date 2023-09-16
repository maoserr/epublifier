import {MsgCommand, MsgOut} from "../../services/messaging/msg_types";
import ParserManager from "../../services/scraping/ParserMan";
import MsgWindow from "../../services/messaging/MsgWindow";
import {chaps, meta, selected_chaps, write_info} from "./sidebar_state";
import {NovelData} from "../../services/novel/novel_data";
import {generate_epub} from "../../services/novel/epub_generator";
import browser from "webextension-polyfill";
import {ref} from "vue";

let parse_man: ParserManager
let msg_win: MsgWindow

export const parse_cancel = ref<boolean>(false)
export const parse_progress = ref<number>(0)

export async function reload_parser() {
  await parse_man.load_parsers()
}

export async function init_parsing() {
  const sb_origin = window.location.href
    .split("?", 2)[1]
    .split("=", 2)[1]
  parse_man = new ParserManager(document, window)
  msg_win = new MsgWindow(window, sb_origin,
    window.parent)
  await parse_man.load_parsers()
  const doc_info: MsgOut<{ url: string; src: string }> =
    await msg_win.send_message<{}, { url: string; src: string }>({
      command: MsgCommand.ContGetSource,
      data: {}
    })
  const init_res = await parse_man.run_init_parser(
    {
      inputs: {},
      url: doc_info.data!.url,
      src: doc_info.data!.src
    }
  )
  write_info(init_res.message)
  chaps.value = init_res.data!.chaps
  meta.value = init_res.data!.meta
}

export async function parse() {
  console.log("Parsing chapters...", selected_chaps)
  await parse_man.parser_chaps(selected_chaps,
    parse_cancel, write_info, parse_progress)
}

export async function run_epub() {
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
  await browser.downloads.download({
    url: URL.createObjectURL(filecontent),
    filename: nov_data.filename,
  });
}
