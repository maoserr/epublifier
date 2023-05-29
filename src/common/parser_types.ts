import {ChapterInfo, NovelData, NovelMetaData} from "./novel_data";

export type ListenerResults =
    ParserDocDef[] | ParserResultAuto | ParserResultChap | ParserResultToc | NovelData

/**
 * Parser Parameters
 */
export interface ParserParams {
    inputs: Record<string, any>;
    url: string;
    src: string;
}

export interface ParserDocDef {
    parse_doc: string;
    type: "toc" | "chap"
    parser: string;
    inputs: Record<string, any>
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
    meta?: NovelMetaData
    title?: string;
    html: string;
    message: string;
    id: number
}
