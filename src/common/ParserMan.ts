import browser from "webextension-polyfill";
import {get_initial} from "./parser_manager";


export default class ParserManager {

  constructor() {
  }

  async get_parsers_definitions(): Promise<Record<string, string>> {
    // let config = await browser.storage.local.get("parsers")
    // if (config.hasOwnProperty('parsers') && (config["parsers"] != null)) {
    //     return JSON.parse(config["parsers"]);
    // } else {
    const main_parse = await this.get_initial()
    return {"main": main_parse};
    // }
  }
  private async get_initial(): Promise<string> {
    let result = await fetch(
      browser.runtime.getURL("config/default.js"));
    return await result.text();
  }
}
