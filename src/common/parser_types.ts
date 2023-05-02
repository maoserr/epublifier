import {ChapterInfo, NovelData, NovelMetaData} from "./novel_data";

export type ListenerResults =
    ParserDocDef[]|ParserResultAuto|ParserResultChap|NovelData

/**
 * Parser Parameters
 */
export interface ParserParams {
    inputs: Record<string, any>;
    url: string;
    src: string;
}

export interface ParserDocDef {
    parse_doc:string;
    type:"toc"|"chap"
    parser:string
}

/**
 * Results from auto parser
 */
export interface ParserResultAuto extends ParserDocDef {
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
