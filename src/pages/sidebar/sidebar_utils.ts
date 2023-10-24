import {ref} from "vue";
export const status_txt = ref<string>("Loading")
export const logs = ref<string>("")

export function write_info(msg: string) {
  console.info(msg)
  status_txt.value = msg
  logs.value += msg + "\n"
}

export function write_debug(msg: string) {
  console.debug(msg)
}
