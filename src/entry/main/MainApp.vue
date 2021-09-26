<template>
  <div id="app">
    <div id="metadata" class="pure-u-1">
      <form class="pure-form pure-form-aligned">
        <fieldset>
          <div class="pure-control-group">
            <label for="title">Title</label>
            <input type="text" id="title" placeholder="No title" />
          </div>
          <div class="pure-control-group">
            <label for="author">Author</label>
            <input type="text" id="author" placeholder="No Author" />
          </div>
          <div class="pure-control-group">
            <label for="cover">Cover Image</label>
            <input type="text" id="cover" placeholder="Cover Image" value="https://i.imgur.com/WwWhvGT.png" />
          </div>
        </fieldset>
      </form>
    </div>
    <div class="pure-u-1">
      <div id="chapters">
        <input type="text" id="na" value="test.html" readonly />
      </div>
      <div id="compile_result"></div>
      <button id="compile_epub" v-on:click="gen_epub()">Compile</button>
    </div>
  </div>
</template>

<script lang="ts">
import { generate_epub } from "../../common/epub_generator";
import { chap_parse } from "../../common/chap_parse";
import { NovelData, Chapter } from "../../common/novel_data";
import { parse_toc_links } from "../../book_parser/toc_parser";
import browser from "webextension-polyfill";

export default {
  mounted: function() {
    if ("runtime" in browser && "onMessage" in browser.runtime) {
      browser.runtime.onMessage.addListener(this.msg_func);
    }
  },
  methods: {
    msg_func: function(request: any, sender: any) {
      console.log(request)
      // Ensure it is run only once, as we will try to message twice
      browser.runtime.onMessage.removeListener(this.msg_func);
      if (request.action == "newTabSource") {
        let chapters = document.getElementById("chapters");
        let chap_pop = parse_toc_links(request.source, request.url);
        let msg_html = "";
        let lbl_html: string;
        let cnt = 1
        for(let i=request.start-1; i<chap_pop.length; i++){
          let el = chap_pop[i];
          let lbl_html =
            '<label for="' + el.content + '">' + el.content + "</label>";
          let txt_html =
            '<input type="text" id="' +
            el.content +
            '" value="' +
            el.url +
            '" readonly /><a href="'+el.url+'">'+el.url+'</a>';
          msg_html += lbl_html + txt_html + "<br/>";
          cnt ++;
          if(cnt > request.max){
            break;
          }
        }
        chapters.innerHTML = msg_html;
      }
    },
    gen_epub: function() {
      let chapters = document.getElementById("chapters");
      let compile_epub = document.getElementById("compile_epub");
      let compile_result = document.getElementById("compile_result");
      let novdata = new NovelData();
      let metadata = document.getElementById("metadata");
      let inps = chapters.querySelectorAll("input");
      let request = new XMLHttpRequest();

      novdata.title = (<HTMLInputElement>(
        metadata.querySelector("#title")
      )).value;
      novdata.author = (<HTMLInputElement>(
        metadata.querySelector("#author")
      )).value;
      novdata.cover = (<HTMLInputElement>(
        metadata.querySelector("#cover")
      )).value;

      function loop(i: number, length: number, resultArr: NovelData) {
        if (i >= length) {
          parse_results(resultArr);
          return;
        }
        let url = inps[i].value;

        request.open("GET", url);
        request.onreadystatechange = function() {
          if (request.readyState === XMLHttpRequest.DONE) {
            if (request.status === 200) {
              resultArr.push({
                content: request.responseText,
                url: request.responseURL,
              });
              compile_result.innerHTML =
                "Parsed chapter " +
                i +
                ", (" +
                ((i / length) * 100).toFixed(1) +
                "%) <br/>";
              loop(i + 1, length, resultArr);
            } else {
              compile_result.innerHTML =
                "Invalid response " +
                request.status +
                " in chapter url: " +
                inps[i].value;
            }
          }
        };
        request.send();
      }
      loop(0, inps.length, novdata);
    },
  },
};

function parse_results(nov_data: NovelData) {
  let compile_result = document.getElementById("compile_result");
  for (let i in nov_data.chapters) {
    compile_result.innerHTML = "Compiling " + i;
    let chap = chap_parse(nov_data.chapters[i]);
    nov_data.chapter_parsed[nov_data.chapters[i].url] = chap;
  }
  generate_epub(nov_data, compile_result);
}
</script>
