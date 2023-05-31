import {add_float_window} from "../sidebar/sidebar_win";

const sb_id = "epublifier_sidebar"
let prev_cont = document.getElementById(sb_id)
if (prev_cont === null) {
    add_float_window(sb_id).then()
}
