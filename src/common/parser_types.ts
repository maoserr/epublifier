import {ChapterInfo, NovelData, NovelMetaData} from "./novel_data";

export type ListenerResults = void|ParserResultAuto|ParserResultChap|NovelData

/**
 * Parser Parameters
 */
export interface ParserParams {
    inputs: Record<string, any>;
    url: string;
    src: string;
}

/**
 * Results from auto parser
 */
export interface ParserResultAuto {
    parse_doc: string;
    parser: string;
    type: "toc" | "chap";
    result: ParserResultToc | ParserResultChap
}

/**
 * Results from running toc parser
 */
export interface ParserResultToc {
    chaps: ChapterInfo[];
    message: string,
    meta: NovelMetaData;
}

/**
 * Results from running chapter parser
 */
export interface ParserResultChap {
    title?: string;
    html: string;
    message: string;
    id: number
}
