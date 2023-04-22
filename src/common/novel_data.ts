export interface NovelMetaData {
    title: string;
    description: string;
    cover?: string;
    publisher?: string
}


export interface Chapter {
    url: string;
    url_title: string;
    parser: string;
    title: string;
    html: string;
    html_parsed: string;
}

export interface NovelData {
    publisher: string;
    description: string;
    filename: string;
    chapters: Chapter[];
    cover?: any;
    title: string;
    author: string;
    tags?: [string];
}
