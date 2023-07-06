import browser from "webextension-polyfill";
import SandboxInput from "./SandboxInput";
import {ParserLoadResult, ParserResultChap, ParserResultToc} from "./parser_types";
import {SbxCommand, SbxInRunFunc, SbxInRunFuncRes, SbxOut, SbxOutStatus} from "./sandbox_types";


export default class ParserManager {
  private sandbox: SandboxInput
  private parsers: Record<string, ParserLoadResult> = {}

  constructor(doc: Document, win: Window) {
    this.sandbox = new SandboxInput(doc, win)
  }

  /**
   * Get initial parser definition from source
   * @private
   */
  private async get_initial(): Promise<string> {
    let result = await fetch(
      browser.runtime.getURL("config/default.js"));
    return await result.text();
  }

  /**
   * Load parser definition string from storage
   * @private
   */
  private async get_parsers_definitions(): Promise<Record<string, string>> {
    const load_saved = false
    let config = await browser.storage.local.get("parsers")
    if (load_saved
      && config.hasOwnProperty('parsers')
      && (config["parsers"] != null)) {
      return JSON.parse(config["parsers"]);
    } else {
      return {"main": await this.get_initial()};
    }
  }

  /**
   * Loads a single parser definition into sandbox
   * @param key
   * @param body
   */
  async load_parser(key: string, body: string): Promise<string> {
    const res =
      await this.sandbox.SendSandboxCmdWReply<SbxInRunFunc, ParserLoadResult>(
        {
          command: SbxCommand.RunFuncRes,
          data: {
            body: body + "\nreturn load()",
            res_key: key
          }
        })
    this.parsers[key] = res.data
    return res.message
  }

  /**
   * Load all parser definitions into sandbox
   */
  async load_parsers(): Promise<SbxOut<Record<string, ParserLoadResult>>> {
    const parser_strs = await this.get_parsers_definitions()
    for (let k in parser_strs) {
      await this.load_parser(k, parser_strs[k])
    }
    return Promise.resolve({
      status: SbxOutStatus.Ok,
      message: 'Loaded',
      data: this.parsers
    })
  }

  /**
   * Runs the initial page parser
   */
  async run_init_parser(
    parse_doc: string, parser: string, inputs: any[]
  ): Promise<SbxOut<ParserResultToc>> {
    return await this.sandbox.SendSandboxCmdWReply<SbxInRunFuncRes, ParserResultToc>({
      command: SbxCommand.RunFuncRes,
      data: {
        res_key: parse_doc,
        inputs: inputs,
        subkeys: ["toc_parsers", parser, "func"]
      }
    })
  }

  async run_chap_parser(parse_doc: string, parser: string, inputs: any[]
  ):Promise<SbxOut<ParserResultChap>> {
    return await this.sandbox.SendSandboxCmdWReply<SbxInRunFuncRes, ParserResultChap>({
      command: SbxCommand.RunFuncRes,
      data: {
        res_key: parse_doc,
        inputs: inputs,
        subkeys: ["chap_parsers", parser, "func"]
      }
    })
  }
}
