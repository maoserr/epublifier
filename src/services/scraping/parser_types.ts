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
  links: Record<string, { inputs: Record<string, ParserInputDef> }>
  text: Record<string, { inputs: Record<string, ParserInputDef> }>
}

/**
 * Results from running detector
 */
export interface ParserResultDetector {
  type: 'links'|'text'
  parser: string
  meta: NovelMetaData
}

/**
 * Results from running toc parser
 */
export interface ParserResultInit {
  detected: ParserResultDetector
  chaps: Chapter[];
  message: string,
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
