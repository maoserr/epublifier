import {isProbablyReaderable, Readability} from "@mozilla/readability";
import {SbxCommand, SbxIn, SbxInRunFunc, SbxInRunFuncRes, SbxOut, SbxOutStatus}
  from '../common/sandbox_types';

let loaded_scripts: Record<string, any> = {}

/**
 * Runs function and stores result in key
 * @param id message id
 * @param func_body Function as string
 * @param inputs Inputs into function as array
 * @param res_key Result key, if storing
 */
async function run_func(id:number,
                        func_body: string,
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
    sbx_id: id,
    status: SbxOutStatus.Ok,
    message: msg,
    data: res
  }
}

/**
 * Runs a function that was generated from run_func
 * @param id message id
 * @param res_key Key of the stored result
 * @param subkeys Subkeys inside result
 * @param inputs Inputs into function
 */
async function run_func_res(id:number,
                            res_key: string,
                            subkeys: any[],
                            inputs: any[]): Promise<SbxOut<any>> {
  inputs.push(get_helpers())
  let curr_res = loaded_scripts[res_key]
  let msg = "Function ran."
  for (let i in subkeys) {
    curr_res = curr_res[i]
  }
  let res = curr_res(...inputs)
  if ("message" in res) {
    msg = res["message"]
  }
  return {
    sbx_id:id,
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
    "get_default_vals": function(parser_def) {
      return Object.fromEntries(Object.entries(parser_def.inputs)
        .map(([k, v]) => [k, v["default"]]))
    }
  }
}

/**
 * Sends reply to main window
 * @param source Msg source
 * @param reply Reply
 */
function send_reply(source: MessageEventSource, reply: SbxOut<any>) {
  source.postMessage(reply, "*" as WindowPostMessageOptions);
}

/**
 * Main sandbox listener function
 * @param event Input event
 */
async function window_listener(event: MessageEvent<SbxIn<any>>) {
  if (event.origin !== window.location.origin) {
    return
  }
  if (!("sbx_id" in event.data )){
    return
  }
  let id: number = event.data.sbx_id
  try {
    let cmd: number = event.data.command
    switch (cmd) {
      case SbxCommand.RunFunc:
        let edata_f: SbxInRunFunc = JSON.parse(event.data.data)
        const res_func = await run_func(
          id, edata_f.body, edata_f.inputs ?? [], edata_f.res_key)
        send_reply(event.source!, res_func)
        break;
      case SbxCommand.RunFuncRes:
        let edata_fr: SbxInRunFuncRes = JSON.parse(event.data.data)
        const res_func_res = await run_func_res(
          id,edata_fr.res_key, edata_fr.subkeys ?? [], edata_fr.inputs ?? [])
        send_reply(event.source!, res_func_res)
        break;
      default:
        send_reply(event.source!,
          {
            sbx_id: id,
            status: SbxOutStatus.Error,
            message: "Unknown command: " + cmd.toString()
          })
        break;
    }
  } catch (error) {
    send_reply(event.source!,
      {
        sbx_id: id,
        status: SbxOutStatus.Error,
        message: ((error instanceof Error) ? error.message : String(error))
      })
  }
}

window.addEventListener('message', window_listener);
