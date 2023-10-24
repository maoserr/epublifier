import {Chapter, NovelMetaData} from "../services/novel/novel_data";
import { Ref, ref} from "vue";

// Current novel info
export const meta = ref({
  title: 'N/A', description: 'N/A'
} as NovelMetaData)
export const chaps: Ref<Chapter[]> = ref([] as Chapter[])
export const selected_chaps =
  ref([] as Chapter[])
