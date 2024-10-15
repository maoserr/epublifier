import {parse} from "content-type"
import SandboxInput from ".././messaging/SandboxInput";
import {
  get_default_inputs, ParserDetected,
  ParserLoadResult,
  ParserParams,
  ParserResultChap,
  ParserResultDetector,
  ParserResultLinks
} from "./parser_types";
import {MsgCommand, MsgOut, SbxInRunFunc, SbxInRunFuncRes} from "../messaging/msg_types";
import {Chapter} from "../novel/novel_data";
import {Ref} from "vue";
import OptionsManager from "../common/OptionsMan";
import * as Parallel from "async-parallel";
import {
  next_id,
  p_inputs_val_link,
  p_inputs_val_text,
  page_type,
  parser,
  parser_chap, scroll,
  title_id
} from "../../pages/parser_state";
import {chaps, meta} from "../../pages/novel_state";
import {write_info} from "../../pages/sidebar/sidebar_utils";


export default class ParserManager {
  private parsers_str: Record<string, string> = {}
  private options: OptionsManager
  private sandbox: SandboxInput
  private parsers: Record<string, ParserLoadResult> = {}

  constructor(sandbox: SandboxInput) {
    this.options = OptionsManager.Instance
    this.sandbox = sandbox
  }

  /**
   * Gets text definitions for all
   */
  get_parse_docs() {
    return this.parsers_str
  }

  /**
   * Loads a single parser definition into sandbox
   * @param key
   * @param body
   */
  async load_parser(key: string, body: string): Promise<ParserLoadResult> {
    const func_in: SbxInRunFunc = {
      body: body + "\nreturn main_def",
      res_key: key
    }
    const res = await this.sandbox
      .run_in_sandbox<SbxInRunFunc, ParserLoadResult>(
        {
          command: MsgCommand.SbxRunFunc,
          data: func_in
        })
    this.parsers[key] = (res.data as ParserLoadResult)
    return res.data!
  }

  /**
   * Load all parser definitions into sandbox
   */
  async load_all_parsers(): Promise<Record<string, ParserLoadResult>> {
    console.log("Loading parsers.")
    this.parsers_str =
      await this.options.get_parsers_definitions()
    for (let k in this.parsers_str) {
      await this.load_parser(k, this.parsers_str[k])
    }
    return Promise.resolve(this.parsers)
  }

  get_title_res(source: string) {
    const parser = new DOMParser()
    const dom = parser.parseFromString(source, "text/html");
    let title_res = null
    if (title_id.value != '') {
      const title_el = dom.querySelector(title_id.value)
      if (title_el == null) {
        write_info("Unable to find title element")
      } else {
        title_res = title_el.textContent
      }
    }
    return title_res
  }

  /**
   * Runs initial detector and then detected parser
   * @param url URL of page
   * @param src Source of page
   * @param parse_doc Parser doc
   */
  async run_init_parser(url: string, src: string, parse_doc: string
  ) {
    // Run detector
    const det_res = (await this.sandbox
      .run_in_sandbox<SbxInRunFuncRes, ParserResultDetector>({
        command: MsgCommand.SbxRunFuncRes,
        data: {
          res_key: parse_doc,
          inputs: [{}, url, src],
          subkeys: ["detector", "func"]
        }
      }, 2, 0))
    const det_data = det_res.data!

    if (det_data.meta !== undefined) {
      meta.value = det_data.meta
    }

    page_type.value = det_data.webtype ?? "pages"
    next_id.value = det_data.add_opt?.next_sel ?? ''
    title_id.value = det_data.add_opt?.title_sel ?? ''
    scroll.value = det_data.add_opt?.scroll_end ?? false

    let parser_opt: ParserDetected = det_data.parser_opt ?? {
      type: 'links',
      parser: Object.keys(this.parsers[parse_doc]['links'])[0]
    }

    let det_inputs = parser_opt.parser_inputs ?? get_default_inputs(
      this.parsers[parse_doc][parser_opt.type][parser_opt.parser]['inputs'])


    // Set detected option
    if (parser_opt.type == "links") {
      parser.value = {
        doc: parse_doc,
        parser: parser_opt.parser,
      }
      p_inputs_val_link.value = det_inputs

      parser_chap.value = {
        doc: parse_doc,
        parser: Object.keys(this.parsers[parse_doc].text)[0]
      }
      p_inputs_val_text.value = get_default_inputs(this.parsers[parse_doc]
        .text[parser_chap.value.parser]['inputs'])
    } else {
      parser_chap.value = {
        doc: parse_doc,
        parser: parser_opt.parser
      }
      p_inputs_val_text.value = det_inputs

      parser.value = {
        doc: parse_doc,
        parser: Object.keys(this.parsers[parse_doc].links)[0]
      }
      p_inputs_val_link.value = get_default_inputs(this.parsers[parse_doc]
        .links[parser.value.parser]['inputs'])
    }

    if (det_data.failed_message !== undefined) {
      throw new Error(det_data.failed_message)
    }

    if (parser_opt.type == 'links') {
      // Run detected parser
      const parse_res = await this.sandbox
        .run_in_sandbox<SbxInRunFuncRes, ParserResultLinks | ParserResultChap>({
          command: MsgCommand.SbxRunFuncRes,
          data: {
            res_key: parse_doc,
            inputs: [det_inputs, url, src],
            subkeys: [parser_opt.type, parser_opt.parser, 'func']
          }
        }, 2, 0)
      write_info(det_res.message + "\n" + parse_res.message)
      chaps.value = (parse_res.data! as ParserResultLinks).chaps
    } else {
      write_info(det_res.message)
    }
  }

  /**
   * Runs link parser
   * @param params Parameters fro parser
   * @param parse_doc Parser doc
   * @param parser Parser
   */
  async run_links_parse(params: ParserParams, parse_doc: string, parser: string)
    : Promise<MsgOut<ParserResultLinks>> {
    return await this.sandbox
      .run_in_sandbox<SbxInRunFuncRes, ParserResultLinks>({
        command: MsgCommand.SbxRunFuncRes,
        data: {
          res_key: parse_doc,
          inputs: [params.inputs, params.url, params.src],
          subkeys: ["links", parser, 'func']
        }
      }, 2, 0)
  }

  /**
   * Runs chapter parser
   * @param params Parameters for parser
   * @param parse_doc Parser doc
   * @param parser Parser
   */
  async run_chap_parser(
    params: ParserParams, parse_doc: string, parser: string,
  ): Promise<MsgOut<ParserResultChap>> {
    return await this.sandbox.run_in_sandbox<SbxInRunFuncRes, ParserResultChap>(
      {
        command: MsgCommand.SbxRunFuncRes,
        data: {
          res_key: parse_doc,
          inputs: [params.inputs, params.url, params.src],
          subkeys: ["text", parser, "func"]
        }
      }, 1, 0)
  }

  parseContentType(contentType: string):string|undefined {
    try {
      return parse(contentType).parameters.charset;
    } catch {
      return undefined;
    }
  }

  getCharset(content: ArrayBuffer, headers?: Headers):string {
    // See http://www.w3.org/TR/2011/WD-html5-20110113/parsing.html#determining-the-character-encoding
    const decoder = new TextDecoder('utf-8');

    // Try to extract content-type header
    const contentType = headers?.get('content-type');
    if (contentType) {
      const hdr_charset = this.parseContentType(contentType);
      if (hdr_charset) {
        return hdr_charset;
      }
    }

    // No charset in content type, peek at response body for at most 1024 bytes
    const data = decoder.decode(content.slice(0, 1024))

    // HTML5, HTML4 and XML
    if (data) {

      const rawdom = new DOMParser().parseFromString(data, "text/html")
      const html5_cs = rawdom.querySelector('meta[charset]')
        ?.getAttribute('charset') ?? null
      if (html5_cs !== null){
        const res = this.parseContentType(html5_cs)
        if (res)
          return res
      }

      const html4_cs = rawdom.querySelector('meta[http-equiv=Content-Type]')
        ?.getAttribute('content') ?? null
      if (html4_cs !== null){
        const res = this.parseContentType(html4_cs)
        if (res)
          return res
      }
    }

    return 'utf-8'
  }


  async fix_html(htmlRaw:ArrayBuffer,cs:string, url: string): Promise<string> {
    console.log(cs)
    const decoder = new TextDecoder(cs);
    const html = decoder.decode(htmlRaw);
    console.log(html)
    let parser = new DOMParser();
    let s = new XMLSerializer();
    let html_node = parser.parseFromString(html, "text/html");


    if (html_node.head.getElementsByTagName('base').length == 0) {
      let baseEl = html_node.createElement('base');
      baseEl.setAttribute('href', url);
      html_node.head.appendChild(baseEl)
    }
    return s.serializeToString(html_node);
  }

  async parser_chaps(parse_doc: string,
                     parser: string,
                     chaps_ref: Ref<Chapter[]>,
                     threads: number,
                     wait_s: number,
                     cancel: Ref<boolean>,
                     status_cb: Function,
                     progress_val: Ref<number>) {

    let cnt_slice = (100.0 / chaps_ref.value.length);
    progress_val.value = 0;
    const parse_man = this
    let extract_chap = async function (id: number) {
      status_cb("Chapter " + id.toString())
      if (cancel.value) {
        throw new Error('User cancelled')
      }
      if (chaps_ref.value[id].url !== undefined) {
        let f_res: Response
        let f_raw: ArrayBuffer
        try {
          f_res = await fetch(chaps_ref.value[id].url);
          f_raw = await f_res.arrayBuffer();
        } catch (e) {
          status_cb("Can't download. Please check permissions in extension page "
            + "-> permission -> Access your data for all websites")
          return
        }
        const chars = parse_man.getCharset(f_raw,f_res.headers)
        const fixed_html = await parse_man.fix_html(f_raw,chars, f_res.url);
        chaps_ref.value[id].html = fixed_html
        status_cb("Parsing chapter content: " + id)
        const chap_res =
          await parse_man.run_chap_parser({
            inputs: {},
            url: chaps_ref.value[id].url,
            src: fixed_html
          }, parse_doc, parser)
        chaps_ref.value[id].html_parsed = chap_res.data?.html ?? ""
        chaps_ref.value[id].title = chap_res.data?.title ?? ""
      }
      progress_val.value += cnt_slice;
      await new Promise(f => setTimeout(f, wait_s * 1000));
    }
    try {
      await Parallel.each(Array.from(Array(chaps_ref.value.length).keys()),
        extract_chap,
        threads);
      progress_val.value = 0
    } catch (e: any) {
      status_cb(e)
      for (let item of e.list) {
        status_cb(item)
      }
    }
  }
}
