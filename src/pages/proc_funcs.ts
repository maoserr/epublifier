import {write_info} from "./sidebar/sidebar_utils";
import {Chapter, NovelData, NovelMetaData} from "../services/novel/novel_data";
import {generate_epub} from "../services/novel/epub_generator";
import browser from "webextension-polyfill";
import {Ref} from "vue";
import {msg_sendwin} from "./win_state";
import {max_chaps, next_id, scroll, title_id, wait_s} from "./parser_state";
import {MsgCommand} from "../services/messaging/msg_types";
import {ParseOpt} from "../services/scraping/parser_types";
import ParserManager from "../services/scraping/ParserMan";


export async function add(parse_man: ParserManager,
                          chaps: Ref<Chapter[]>,
                          p_inputs_val_text: Ref<Record<string, any>>,
                          parser_chap: Ref<ParseOpt | undefined>
) {
  for (let i = 0; i < max_chaps.value; i++) {
    let doc_info =
      await msg_sendwin.send_message<{}, { url: string; src: string }>({
        command: MsgCommand.ContGetSource,
        data: {}
      })
    const res = await parse_man.run_chap_parser(
      {
        inputs: p_inputs_val_text.value,
        url: doc_info.data!.url,
        src: doc_info.data!.src
      },
      parser_chap.value!.doc,
      parser_chap.value!.parser
    )
    write_info(res.message)
    let res_sel = parse_man.get_title_res(doc_info.data!.src)
    let curr_chap = {
      id: i,
      url: doc_info.data!.url,
      title: res_sel ?? res.data!.title,
      html: doc_info.data!.src,
      html_parsed: res.data!.html
    }
    chaps.value.push(curr_chap)
    const click_res = await msg_sendwin.send_message<{ selector: string }, boolean>({
      command: MsgCommand.ContClickNext,
      data: {selector: next_id.value}
    })
    if (!click_res.data){
      break;
    }
    if (scroll.value){
      const scrollingElement = (document.scrollingElement ?? document.body);
      scrollingElement.scrollTop = scrollingElement.scrollHeight;
    }
    await new Promise(f => setTimeout(f, wait_s.value*1000));
  }
}

export async function run_epub(chaps: Ref<Chapter[]>,
                               selected_chaps: Ref<Chapter[]>,
                               meta: Ref<NovelMetaData>) {
  let epub_chaps = []
  for (let c of chaps.value) {
    if (selected_chaps.value.includes(c)) {
      epub_chaps.push(c)
    }
  }
  let nov_data: NovelData = {
    meta: meta.value,
    chapters: epub_chaps,
    filename: meta.value.title.toLowerCase().replace(/[/\\?%*:|"<>]/gi, "-") + ".epub"
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
