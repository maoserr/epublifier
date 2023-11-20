import {Chapter, NovelMetaData}
  from "../novel/novel_data";

export function get_default_inputs(parser_def: Record<string, ParserInputDef>) {
  return Object.fromEntries(Object.entries(parser_def)
    .map(([k, v]) => [k, v["default"]]))
}

export interface ParseOpt {
  doc: string
  parser: string
}

/**
 * Parser Parameters
 */
export interface ParserParams {
  inputs: Record<string, any>;
  url: string;
  src: string;
}

export interface ParserInputDef {
  type: string
  default: string
}

export interface ParserLoadResult {
  links: Record<string, { inputs: Record<string, ParserInputDef> }>
  text: Record<string, { inputs: Record<string, ParserInputDef> }>
}

/**
 * Options for add page
 */
export interface AddDetected {
  next_sel: string
  title_sel: string
  scroll_end: boolean
}

export interface ParserDetected {
  type: 'links' | 'text'
  parser: string
  parser_inputs?: Record<string, any>
}

/**
 * Results from running detector
 */
export interface ParserResultDetector {
  failed_message?: string
  webtype?: 'pages' | 'spa'
  meta?: NovelMetaData
  parser_opt?: ParserDetected
  add_opt?: AddDetected
}

/**
 * Results from running init parser
 */
export interface ParserResultInit {
  message: string
  chaps: Chapter[]
  meta?: NovelMetaData
}

export interface ParserResultLinks {
  chaps: Chapter[];
  message: string;
}

/**
 * Results from running chapter parser
 */
export interface ParserResultChap {
  title: string;
  html: string;
  message: string;
}
