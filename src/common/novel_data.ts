export interface Chapter {
    url: string;
    url_title: string;
    title?: string;
    html?: string;
    html_parsed?: string;
}

export class NovelData {
    title: string;
    author: string;
    publisher: string;
    description: string;
    chapters: Chapter[];
    cover: Blob;
    filename: string;
    tags: string[];

    constructor(chaps: Chapter[]) {
        this.publisher = "None"
        this.description = "N/A"
        this.filename = "epublifier.epub"
        this.chapters = chaps
        this.cover = null
        this.title = "None"
        this.author = "None"
        this.tags = ["default"]
    }
}
