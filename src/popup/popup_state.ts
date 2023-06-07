import {ref, Ref} from "vue";
import {ParserDocDef} from "../common/parser_types";


export const parser: Ref<ParserDocDef | undefined> = ref()

export const status_txt: Ref<string> = ref("Loading...")
