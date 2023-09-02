import {isProbablyReaderable, Readability} from "@mozilla/readability";
import {
  SbxCommand,
  SbxInInternal,
  SbxOut,
  SbxOutInternal,
  SbxInRunFunc,
  SbxInRunFuncRes,
  SbxOutStatus
}
  from '../services/sandbox/sandbox_types';
import {ParserParams} from "../services/scraping/parser_types";

let loaded_scripts: Record<string, any> = {}

/**
 * Runs function and stores result in key
 * @param func_body Function as string
 * @param inputs Inputs into function as array
 * @param res_key Result key, if storing
 */
async function run_func(func_body: string,
                        inputs: any[],
                        res_key?: string): Promise<SbxOut<any>> {
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
    status: SbxOutStatus.Ok,
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
                            inputs: any[]): Promise<SbxOut<any>> {
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
    status: SbxOutStatus.Ok,
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

/**
 * Sends reply to main window
 * @param source Msg source
 * @param reply Reply
 * @param id Command ID
 */
function send_reply<T>(source: MessageEventSource, reply: SbxOut<T>, id: number) {
  const reply_internal:SbxOutInternal<T> = {
    sbx_id: id,
    sbx_out: reply
  }
  source.postMessage(JSON.stringify(reply_internal), "*" as WindowPostMessageOptions);
}

/**
 * Main sandbox listener function
 * @param event Input event
 */
async function window_listener(event: MessageEvent<string>) {
  if (event.origin !== window.location.origin) {
    return
  }
  const data: SbxInInternal<any> = JSON.parse(event.data)
  console.info("Sandbox Input", data)
  if (!("sbx_id" in data)) {
    return
  }
  let id: number = data.sbx_id
  try {
    let cmd: number = data.sbx_in.command
    switch (cmd) {
      case SbxCommand.RunFunc:
        let edata_f: SbxInRunFunc = data.sbx_in.data
        const res_func = await run_func(
          edata_f.body, edata_f.inputs ?? [], edata_f.res_key)
        send_reply<any>(event.source!, res_func, id)
        break;
      case SbxCommand.RunFuncRes:
        let edata_fr: SbxInRunFuncRes = data.sbx_in.data
        const res_func_res = await run_func_res(
          edata_fr.res_key, edata_fr.subkeys ?? [], edata_fr.inputs ?? [])
        send_reply<any>(event.source!, res_func_res, id)
        break;
      default:
        send_reply<any>(event.source!,
          {
            status: SbxOutStatus.Error,
            message: "Unknown command: " + cmd.toString()
          }, id)
        break;
    }
  } catch (error) {
    console.warn(error)
    send_reply<any>(event.source!,
      {
        status: SbxOutStatus.Error,
        message: ((error instanceof Error) ? error.message : String(error))
      }, id)
  }
}

window.addEventListener('message', window_listener);
