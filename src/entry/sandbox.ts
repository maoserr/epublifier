import {SbxCommand, SbxIn, SbxInRunFunc, SbxOut, SbxOutStatus} from '../sandboxed/messages';

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
                            inputs: any): Promise<SbxOut<any>> {
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
    status: SbxOutStatus.Ok,
    message: msg,
    data: res
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
  try {
    if (event.origin !== window.location.origin) {
      send_reply(event.source!,
        {
          status: SbxOutStatus.Error,
          message: "Invalid origin: " + event.origin
        })
      return
    }
    let cmd: number = event.data.command
    let edata: SbxInRunFunc = JSON.parse(event.data.data)
    switch (cmd) {
      case SbxCommand.RunFunc:
        let res: SbxOut<any>
        if (edata.body !== undefined) {
          res = await run_func(edata.body, edata.inputs ?? [], edata.res_key)
        } else {
          res = await run_func_res(
            edata.res_key!, edata.subkeys ?? [], edata.inputs ?? [])
        }
        send_reply(event.source!, res)
        break;
      default:
        send_reply(event.source!,
          {
            status: SbxOutStatus.Error,
            message: "Unknown command: " + cmd.toString()
          })
        break;
    }
  } catch (error) {
    send_reply(event.source!,
      {
        status: SbxOutStatus.Error,
        message: ((error instanceof Error) ? error.message : String(error))
      })
  }
}

window.addEventListener('message', window_listener);
