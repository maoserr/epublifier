export interface Chapter {
  url: string;
  content: string;
}

export interface ChapterParsed {
  title: string;
  html: string;
}

export class NovelData {
  title: string;
  author: string;
  publisher: string;
  description: string;
  chapters: Chapter[];
  chapter_parsed: Record<string, ChapterParsed>;
  cover: string;
  filename: string;
  constructor() {
    this.publisher = "None";
    this.description = "N/A";
    this.filename = "epublifier.epub"
    this.chapters = []
    this.chapter_parsed = {}
  }
  push(chap: Chapter) {
    this.chapters.push(chap);
  }
}
