import {ref} from "vue";
import {ParserLoadResult} from "./scraping/parser_types";
import SandboxInput from "./messaging/SandboxInput";
import ParserManager from "./scraping/ParserMan";
import {MsgCommand, MsgOut} from "./messaging/msg_types";
import {write_info} from "../pages/sidebar/sidebar_state";
import {watchDebounced} from "@vueuse/core";
import MsgWindow from "./messaging/MsgWindow";

// Current parser state
export let parse_man:ParserManager
export const curr_parse_doc =
  ref<string>('main')
export const curr_parser_txt =
  ref<Record<string, string>>({'main': 'Loading...'})
export const parsers =
  ref<Record<string, ParserLoadResult>>(
    {main: {links: {}, text: {}}})
const p_inputs_val_link =
  ref<Record<string, any>>({})
const p_inputs_val_text =
  ref<Record<string, any>>({})
export const page_type =
  ref<string>("regular")


export async function init_parseman(
  this_sbx: SandboxInput, msg_win: MsgWindow) {
  parse_man = new ParserManager(this_sbx)

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
      const doc = curr_parse_doc.value
      parsers.value[doc] = await parse_man.load_parser(doc, curr_parser_txt.value[doc])
      write_info("Parsers (re)loaded: " + new Date().toLocaleTimeString())
    },
    {deep: true, debounce: 1000, maxWait: 10000},
  )
}
