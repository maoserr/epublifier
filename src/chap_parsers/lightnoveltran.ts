import { Chapter, ChapterParsed } from "./../common/novel_data";

export function parse_lnt(chap: Chapter): ChapterParsed {
    let parser = new DOMParser();
    let dom = parser.parseFromString(chap.content, "text/html");

    return {title: "", html: ""}
}