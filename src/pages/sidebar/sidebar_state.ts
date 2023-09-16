import {Ref, ref} from "vue";
import {Chapter, NovelMetaData} from "../../services/novel/novel_data";

export const status_txt = ref<string>("Loading")

export const meta = ref({
  title: 'N/A', description: 'N/A'
} as NovelMetaData)

export const chaps: Ref<Chapter[]> = ref([] as Chapter[])
export const selected_chaps =
  ref([] as Chapter[])

export function write_info(msg: string) {
  console.info(msg)
  status_txt.value = msg
}

export function write_debug(msg: string) {
  console.debug(msg)
}
