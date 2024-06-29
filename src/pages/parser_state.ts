import {ref} from "vue";
import {ParseOpt, ParserLoadResult} from "../services/scraping/parser_types";

// Parser definition state
export const parsers =
  ref<Record<string, ParserLoadResult>>(
    {main: {links: {}, text: {}}})
export const curr_parse_doc =
  ref<string>('main')
export const curr_parser_txt =
  ref<Record<string, string>>({'main': 'Loading...'})

// Parse option state
export const parser = ref<ParseOpt>()
export const parser_chap = ref<ParseOpt>()
export const p_inputs_val_link =
  ref<Record<string, any>>({})
export const p_inputs_val_text =
  ref<Record<string, any>>({})
export const page_type =
  ref<string>("regular")

// Add page options
export const threads = ref<number>(3)
export const scroll = ref<boolean>(false)
export const max_chaps = ref<number>(5)
export const wait_s = ref<number>(0.5)
export const next_id = ref<string>('')
export const title_id = ref<string>('')
