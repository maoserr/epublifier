export enum SbxCommand {
    LoadParsers,
    ParseSource,
}

export enum SbxReply {
    Error,
}

export function ChkIsSandboxReply(event:MessageEvent, reject:any){
    console.debug(event)
    if (!("data" in event))
        reject("No data")
    if (!("command" in event.data))
        reject("No command")
}

/**
 * Sends a message to the sandbox (from non-sandbox window)
 * @param cmd Command
 * @param data Data
 * @constructor
 */
export function SendSandboxCmd(cmd:SbxCommand, data:any):void {
    let iframe = document.getElementById("sandbox") as HTMLIFrameElement;
    iframe.contentWindow!.postMessage(
        {command: cmd, data: data},'*' as WindowPostMessageOptions)
}
