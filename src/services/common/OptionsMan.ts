import browser from "webextension-polyfill";
import {Chapter, NovelMetaData} from "../novel/novel_data";

interface Options {
  load_saved: boolean
  max_sync_fetch: number
}

export default class OptionsManager {
  private static _instance: OptionsManager;
  options?: Options

  private constructor() {
  }

  static get Instance() {
    if (!this._instance) {
      this._instance = new this()
    }
    return this._instance;
  }

  async get_option<T>(name: keyof Options): Promise<T> {
    if (this.options === undefined) {
      this.options = (await browser.storage.sync.get("options")) as Options
    }
    return (this.options[name] as T)
  }

  /**
   * Get initial parser definition from source
   * @private
   */
  private async get_initial(): Promise<string> {
    let result = await fetch(
      browser.runtime.getURL("config/default.js"));
    return await result.text();
  }

  /**
   * Load parser definition string from storage
   * @private
   */
  async get_parsers_definitions(): Promise<Record<string, string>> {
    const load_saved = await this.get_option("load_saved")
    let config = await browser.storage.local.get("parsers")
    if (load_saved
      && config.hasOwnProperty('parsers')
      && (config["parsers"] != null)) {
      return JSON.parse(config["parsers"]);
    } else {
      return {"main": await this.get_initial()};
    }
  }

  /**
   * Caches current parsed state
   * @param chaps Chapters
   * @param meta Metadata
   */
  async cache_state(chaps: Chapter[], meta: NovelMetaData) {
    await browser.storage.local.set(
      {
        chapter: JSON.stringify(chaps),
        meta: JSON.stringify(meta)
      })
  }

  async load_state():Promise<[Chapter[],NovelMetaData]>{
    const chaps= JSON.parse(browser.storage.local.get("chapter"))
  }
}
