import MsgSendWindow from "../services/messaging/MsgSendWindow";
import {get_origin} from "../services/dom/SidebarContainer";

export let msg_sendwin: MsgSendWindow

export function init_sidebarwin() {
  const sb_origin = get_origin()
  msg_sendwin = new MsgSendWindow(window, sb_origin,
    window.parent)
}
