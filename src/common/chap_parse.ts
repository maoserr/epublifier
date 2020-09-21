import { Chapter, ChapterParsed } from "./../common/novel_data";
import { parse_wordpress } from "../chap_parsers/wordpress";
import { parse_lnt } from "../chap_parsers/lightnoveltran";

export function chap_parse(chap: Chapter): ChapterParsed {
  let url = new URL(chap.url);
  switch (url.hostname) {
    case "lightnovelstranslations.com":
      return parse_lnt(chap);
    case "isekailunatic.com":
      return parse_wordpress(chap);
  }
  throw new RangeError("Invalid hostname");
}
