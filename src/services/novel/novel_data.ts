export interface NovelMetaData {
    title: string;
    author: string;
    description: string;
    cover?: string;
    publisher?: string
}

export interface Chapter {
    id: number
    url: string;
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
