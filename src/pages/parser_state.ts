import {ref} from "vue";
import {ParseOpt, ParserLoadResult} from "../services/scraping/parser_types";

// Current parser state
export const parser = ref<ParseOpt>()
export const curr_parse_doc =
  ref<string>('main')
export const curr_parser_txt =
  ref<Record<string, string>>({'main': 'Loading...'})
export const parsers =
  ref<Record<string, ParserLoadResult>>(
    {main: {links: {}, text: {}}})
export const p_inputs_val_link =
  ref<Record<string, any>>({})
export const p_inputs_val_text =
  ref<Record<string, any>>({})
export const page_type =
  ref<string>("regular")
