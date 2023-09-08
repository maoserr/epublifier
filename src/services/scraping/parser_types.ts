import {Chapter, NovelMetaData}
  from "../novel/novel_data";

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
  init_parsers: Record<string, { inputs: Record<string, ParserInputDef> }>
  chap_parsers: Record<string, { inputs: Record<string, ParserInputDef> }>
}

/**
 * Results from running toc parser
 */
export interface ParserResultInit {
  chaps: Chapter[];
  message: string,
  meta: NovelMetaData;
}

/**
 * Results from running chapter parser
 */
export interface ParserResultChap {
  title: string;
  html: string;
  message: string;
  id: number
}
