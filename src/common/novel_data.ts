export interface Chapter {
    url: string;
    content: string;
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
    chapter_parsed: Record<string, Chapter>;
    cover: string;
    filename: string;

    constructor() {
        this.publisher = "None";
        this.description = "N/A";
        this.filename = "epublifier.epub"
        this.chapters = []
        this.chapter_parsed = {}
        this.cover = ""
        this.title = ""
        this.author = ""
    }

    push(chap: Chapter) {
        this.chapters.push(chap);
    }
}
