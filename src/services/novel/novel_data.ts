export interface NovelMetaData {
    title: string;
    author: string;
    description: string;
    cover?: string;
    publisher?: string
}

export interface ChapterMeta {
    title: string;
    url: string;
    parser: string;
    parse_doc: string;
}

export interface Chapter {
    info: ChapterMeta
    title: string;
    html: string;
    html_parsed: string;
}

export interface NovelData {
    meta: NovelMetaData;
    filename: string;
    chapters: Chapter[];
    cover?: any;
    tags?: [string];
}