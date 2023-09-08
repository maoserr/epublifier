import {Ref, ref} from "vue";
import {Chapter, NovelMetaData} from "../../services/novel/novel_data";

export const meta = ref({
  title: 'N/A', description: 'N/A'} as NovelMetaData)

export const chaps:Ref<Chapter[]> = ref([] as Chapter[])
export const selected_chaps =
  ref([] as Chapter[])
