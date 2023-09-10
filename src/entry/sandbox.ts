import {isProbablyReaderable, Readability} from "@mozilla/readability";
import {
  MsgCommand,
  MsgOut,
  SbxInRunFunc,
  SbxInRunFuncRes,
  MsgOutStatus
} from '../services/messaging/msg_types';
import {ParserParams} from "../services/scraping/parser_types";
import MsgWindow from "../services/messaging/MsgWindow";

let loaded_scripts: Record<string, any> = {}

/**
 * Runs function and stores result in key
 * @param func_body Function as string
 * @param inputs Inputs into function as array
 * @param res_key Result key, if storing
 */
async function run_func(func_body: string,
                        inputs: any[],
                        res_key?: string): Promise<MsgOut<any>> {
  inputs.push(get_helpers())
  let res = new Function(func_body)(...inputs)
  let msg = "Function ran."
  if (res_key !== undefined) {
    loaded_scripts[res_key] = res
    msg = `Function results stored for ${res_key}`
  }
  if ("message" in res) {
    msg = res["message"]
  }
  return {
    status: MsgOutStatus.Ok,
    message: msg,
    data: res
  }
}

/**
 * Runs a function that was generated from run_func
 * @param res_key Key of the stored result
 * @param subkeys Subkeys inside result
 * @param inputs Inputs into function
 */
async function run_func_res(res_key: string,
                            subkeys: any[],
                            inputs: any[]): Promise<MsgOut<any>> {
  inputs.push(get_helpers())
  let curr_res = loaded_scripts[res_key]
  let msg = "Function ran."
  for (let i of subkeys) {
    curr_res = curr_res[i]
  }
  let res = curr_res(...inputs)
  if ("message" in res) {
    msg = res["message"]
  }
  return {
    status: MsgOutStatus.Ok,
    message: msg,
    data: res
  }
}

/**
 * Get helper functions
 */
function get_helpers() {
  return {
    "readability": function (dom: Document) {
      return new Readability(dom).parse();
    },
    "readerable": isProbablyReaderable,
    "get_default_vals": function (parser_def: ParserParams) {
      return Object.fromEntries(Object.entries(parser_def.inputs)
        .map(([k, v]) => [k, v["default"]]))
    }
  }
}

new MsgWindow(window, window.location.origin,undefined,
  async (cmd: MsgCommand, data: SbxInRunFunc | SbxInRunFuncRes
  ): Promise<MsgOut<any>> => {
    switch (cmd) {
      case MsgCommand.SbxRunFunc:
        let edata_f: SbxInRunFunc = data as SbxInRunFunc
        return await run_func(
          edata_f.body, edata_f.inputs ?? [], edata_f.res_key)
      case MsgCommand.SbxRunFuncRes:
        let edata_fr: SbxInRunFuncRes = data as SbxInRunFuncRes
        return await run_func_res(
          edata_fr.res_key, edata_fr.subkeys ?? [], edata_fr.inputs ?? [])
    }
    return {
      status: MsgOutStatus.Error,
      message: "Unknown command: " + cmd.toString()
    }
  })
