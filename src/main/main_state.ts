import {ref} from "vue";
import {Chapter, NovelMetaData} from "../common/novel_data";

export const meta = ref({
    title: 'N/A', description: 'N/A'} as NovelMetaData)

export const chaps = ref([] as Chapter[])
export const selected_chaps =
    ref([] as Chapter[])

export const progress = ref(0)
export const running = ref(false)
export const cancel = ref(false)
export const epub_gen = ref(false)

export const status_txt = ref("Loading...")

export const parser_txt = ref<Record<string,string>>({
    'main':'Loading...'
})
