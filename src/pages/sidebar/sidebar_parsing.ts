import {MsgCommand, MsgOut} from "../../services/messaging/msg_types";
import ParserManager from "../../services/scraping/ParserMan";
import MsgWindow from "../../services/messaging/MsgWindow";
import {chaps, meta, selected_chaps, write_info} from "./sidebar_state";
import {NovelData} from "../../services/novel/novel_data";
import {generate_epub} from "../../services/novel/epub_generator";
import browser from "webextension-polyfill";
import {ref} from "vue";
import {watchDebounced} from "@vueuse/core";
import SandboxInput from "../../services/messaging/SandboxInput";
import {ParserLoadResult} from "../../services/scraping/parser_types";

let parse_man: ParserManager
let msg_win: MsgWindow

// Exported references
export const parse_cancel = ref<boolean>(false)
export const parse_progress = ref<number>(0)
export const curr_parser_txt =
  ref<Record<string, string>>({'main': 'Loading...'})
export const parsers = ref<Record<string, ParserLoadResult>>(
  {main:{links:{},text:{}}})
export const curr_parse_doc = ref<string>('main')
export const p_inputs_val_link = ref<Record<string, any>>({})
export const p_inputs_val_text = ref<Record<string, any>>({})

// Exported functions

export async function reload_parser(doc: string) {
  parsers.value[doc] = await parse_man.load_parser(doc, curr_parser_txt.value[doc])
}

export function get_origin() {
  return window.location.href
    .split("?", 2)[1]
    .split("=", 2)[1]
}

export async function init_parsing() {
  const sb_origin = get_origin()
  parse_man = new ParserManager(new SandboxInput(document, window))
  msg_win = new MsgWindow(window, sb_origin,
    window.parent)
  parsers.value = await parse_man.load_all_parsers()
  curr_parser_txt.value = parse_man.get_parse_docs()
  const doc_info: MsgOut<{ url: string; src: string }> =
    await msg_win.send_message<{}, { url: string; src: string }>({
      command: MsgCommand.ContGetSource,
      data: {}
    })
  const init_res = await parse_man.run_init_parser(
    doc_info.data!.url, doc_info.data!.src, curr_parse_doc.value)
  write_info(init_res.message)
  chaps.value = init_res.data!.chaps
  meta.value = init_res.data!.detected.meta

  watchDebounced(
    curr_parser_txt,
    async () => {
      await reload_parser(curr_parse_doc.value)
      write_info("Parsers (re)loaded: " + new Date().toLocaleTimeString())
    },
    {deep: true, debounce: 1000, maxWait: 10000},
  )
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
  await browser.runtime.sendMessage(
    {
      cmd: "download",
      file: URL.createObjectURL(filecontent),
      filename: nov_data.filename
    }
  )
}
