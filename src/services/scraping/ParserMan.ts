import SandboxInput from ".././messaging/SandboxInput";
import {
  get_default_inputs,
  ParserLoadResult,
  ParserParams,
  ParserResultChap,
  ParserResultDetector,
  ParserResultInit, ParserResultLinks
} from "./parser_types";
import {MsgCommand, MsgOut, MsgOutStatus, SbxInRunFunc, SbxInRunFuncRes} from "../messaging/msg_types";
import {Chapter} from "../novel/novel_data";
import {Ref} from "vue";
import OptionsManager from "../common/OptionsMan";
import * as Parallel from "async-parallel";


export default class ParserManager {
  private parsers_str: Record<string, string> = {}
  private options: OptionsManager
  private sandbox: SandboxInput
  private parsers: Record<string, ParserLoadResult> = {}

  constructor(doc: Document, win: Window) {
    this.options = OptionsManager.Instance
    this.sandbox = new SandboxInput(doc, win)
  }

  /**
   * Gets text definitions for all
   */
  get_parse_docs() {
    return this.parsers_str
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
    this.parsers[key] = (res.data as ParserLoadResult)
    return res.message
  }

  /**
   * Load all parser definitions into sandbox
   */
  async load_parsers(): Promise<MsgOut<Record<string, ParserLoadResult>>> {
    console.log("Loading parsers.")
    this.parsers_str =
      await this.options.get_parsers_definitions()
    for (let k in this.parsers_str) {
      await this.load_parser(k, this.parsers_str[k])
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
   */
  async run_init_parser(
    params: ParserParams, parse_doc: string): Promise<MsgOut<ParserResultInit>> {
    const det_res = (await this.sandbox
      .run_in_sandbox<SbxInRunFuncRes, ParserResultDetector>({
        command: MsgCommand.SbxRunFuncRes,
        data: {
          res_key: parse_doc,
          inputs: [params.inputs, params.url, params.src],
          subkeys: ["detector", "func"]
        }
      }, 2, 0))
    const det_data = det_res.data!
    const det_inputs = get_default_inputs(this.parsers[parse_doc]
      [det_data.type][det_data.parser]['inputs'])
    const parse_res =  await this.sandbox
      .run_in_sandbox<SbxInRunFuncRes, ParserResultLinks|ParserResultChap>({
      command: MsgCommand.SbxRunFuncRes,
      data: {
        res_key: parse_doc,
        inputs: [det_inputs, params.url, params.src],
        subkeys: [det_data.type, det_data.parser, 'func']
      }
    }, 2, 0)
    const msgs = det_res.message + "\n"+ parse_res.message
    let parse_chaps:Chapter[] = []
    if (det_data.type == 'links') {
      parse_chaps = (parse_res.data! as ParserResultLinks).chaps
    }
    return {
      status: MsgOutStatus.Ok,
      message: msgs,
      data: {
        detected: det_data,
        chaps: parse_chaps,
      }
    }
  }

  /**
   * Runs chapter parser
   * @param params Parameters for parser
   * @param parse_doc Parser doc
   * @param parser Parser
   */
  async run_chap_parser(
    params: ParserParams, parse_doc: string, parser: string,
  ): Promise<MsgOut<ParserResultChap>> {
    return await this.sandbox.run_in_sandbox<SbxInRunFuncRes, ParserResultChap>(
      {
        command: MsgCommand.SbxRunFuncRes,
        data: {
          res_key: parse_doc,
          inputs: [params.inputs, params.url, params.src],
          subkeys: ["text", parser, "func"]
        }
      }, 1, 0)
  }

  async parse_chaps_fetch(){

  }

  async parser_chaps(chaps_ref: Ref<Chapter[]>,
                     cancel: Ref<boolean>,
                     status_cb: Function,
                     progress_val: Ref<number>) {

    let cnt_slice = (100.0 / chaps_ref.value.length);
    progress_val.value = 0;
    const parse_man = this
    let extract_chap = async function (id: number) {
      status_cb("Chapter " + id.toString())
      if (cancel.value) {
        throw new Error('User cancelled')
      }
      if (chaps_ref.value[id].url !== undefined) {
        let f_res
        let f_txt = ''
        try {
          f_res = await fetch(chaps_ref.value[id].url);
          f_txt = await f_res.text();
        } catch (e) {
          status_cb("Can't download. Please check permissions in extension page "
            + "-> permission -> Access your data for all websites")
          return
        }
        chaps_ref.value[id].html = f_txt;
        status_cb("Parsing chapter content: " + id)
        const chap_res =
          await parse_man.run_chap_parser({
            inputs: {},
            url: chaps_ref.value[id].url,
            src: f_txt
          }, 'main', 'Readability_Ex')
        chaps_ref.value[id].html_parsed = chap_res.data?.html ?? ""
        chaps_ref.value[id].title = chap_res.data?.title ?? ""
      }
      progress_val.value += cnt_slice;
    }
    try {
      await Parallel.each(Array.from(Array(chaps_ref.value.length).keys()),
        extract_chap,
        await this.options.get_option("max_sync_fetch"));
      progress_val.value = 0
    } catch (e:any) {
      status_cb(e)
      for (let item of e.list){
        status_cb(item)
      }
    }
  }
}
