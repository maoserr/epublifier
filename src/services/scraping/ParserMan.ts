import SandboxInput from ".././messaging/SandboxInput";
import {ParserLoadResult, ParserParams, ParserResultChap, ParserResultInit}
  from "./parser_types";
import {MsgCommand, SbxInRunFunc, SbxInRunFuncRes, MsgOut, MsgOutStatus}
  from ".././messaging/msg_types";
import {Chapter, NovelMetaData} from ".././novel/novel_data";
import {Ref} from "vue";
import OptionsManager from "../common/OptionsMan";
import * as Parallel from "async-parallel";


export default class ParserManager {
  private options: OptionsManager
  private sandbox: SandboxInput
  private parsers: Record<string, ParserLoadResult> = {}

  constructor(doc: Document, win: Window) {
    this.options = OptionsManager.Instance
    this.sandbox = new SandboxInput(doc, win)
  }

  /**
   * Loads a single parser definition into sandbox
   * @param key
   * @param body
   */
  async load_parser(key: string, body: string): Promise<string> {
    const func_in: SbxInRunFunc = {
      body: body + "\nreturn load()",
      res_key: key
    }
    const res =
      await this.sandbox.run_in_sandbox<SbxInRunFunc, ParserLoadResult>(
        {
          command: MsgCommand.SbxRunFunc,
          data: func_in
        })
    console.info("Parse Load", res)
    this.parsers[key] = (res.data as ParserLoadResult)
    return res.message
  }

  /**
   * Load all parser definitions into sandbox
   */
  async load_parsers(): Promise<MsgOut<Record<string, ParserLoadResult>>> {
    const parser_strs =
      await this.options.get_parsers_definitions()
    for (let k in parser_strs) {
      await this.load_parser(k, parser_strs[k])
    }
    return Promise.resolve({
      status: MsgOutStatus.Ok,
      message: 'Loaded',
      data: this.parsers
    })
  }

  /**
   * Runs initial parser
   * @param params Parameters for parser
   * @param parse_doc Parser doc
   * @param parser Parser
   */
  async run_init_parser(
    params: ParserParams, parse_doc?: string, parser?: string,
  ): Promise<MsgOut<ParserResultInit>> {
    return await this.sandbox.run_in_sandbox<SbxInRunFuncRes, ParserResultInit>(
      {
        command: MsgCommand.SbxRunFuncRes,
        data: {
          res_key: parse_doc ?? "main",
          inputs: [params.inputs, params.url, params.src],
          subkeys: ["init_parsers", parser ?? "Auto", "func"]
        }
      })
  }

  /**
   * Runs chapter parser
   * @param params Parameters for parser
   * @param parse_doc Parser doc
   * @param parser Parser
   */
  async run_chap_parser(
    params: ParserParams, parse_doc?: string, parser?: string,
  ): Promise<MsgOut<ParserResultChap>> {
    return await this.sandbox.run_in_sandbox<SbxInRunFuncRes, ParserResultChap>(
      {
        command: MsgCommand.SbxRunFuncRes,
        data: {
          res_key: parse_doc ?? "main",
          inputs: [params.inputs, params.url, params.src],
          subkeys: ["chap_parsers", parser ?? "Auto", "func"]
        }
      })
  }

  async parser_chaps(chaps_ref: Ref<Chapter[]>,
                     meta: NovelMetaData,
                     cancel: Ref<boolean>,
                     status_txt: Ref<string>,
                     progress_val: Ref<number>) {

    let cnt_slice = 100.0 / chaps_ref.value.length;
    progress_val.value = 0;
    const parse_man = this
    let extract_chap = async function (id: number) {
      if (cancel.value) {
        throw new Error('User cancelled')
      }
      if (chaps_ref.value[id].html_parsed)
      if (chaps_ref.value[id].info.url !== undefined) {
        let f_res
        let f_txt = ''
        try {
          f_res = await fetch(chaps_ref.value[id].info.url);
          f_txt = await f_res.text();
        } catch (e) {
          status_txt.value = "Can't download. Please check permissions in extension page "
            + "-> permission -> Access your data for all websites"
          return
        }
        chaps_ref.value[id].html = f_txt;
        status_txt.value = "Parsing chapter content: " + id;
        const chap_res =
          await parse_man.run_chap_parser({
            inputs: {},
            url: chaps_ref.value[id].info.url,
            src: f_txt
          }, chaps_ref.value[id].info.parse_doc, chaps_ref.value[id].info.parser)
        chaps_ref.value[id].html_parsed = chap_res.data?.html ?? ""
        chaps_ref.value[id].title = chap_res.data?.title ?? ""
      }
      progress_val.value += cnt_slice;
    }
    try {
      await Parallel.each(Array.from(Array(chaps_ref.value.length).keys()), extract_chap,
        await this.options.get_option("max_sync_fetch"));
    } catch (e) {
      status_txt.value = "Error: " + e
      console.log(e)
    }
  }
}
