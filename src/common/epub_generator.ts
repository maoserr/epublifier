import jEpub from "jepub/dist/jepub";
import { NovelData } from "../common/novel_data";

export function generate_epub(nov_data: NovelData, status:HTMLElement) {
    status.innerHTML = "Fetching cover image...";
    fetch(nov_data.cover)
      .then((response) => {
        if (response.ok) return response.blob();
        throw "Network response was not ok.";
      })
      .then((blob) => {
        const jepub = new jEpub();
        jepub.init({
          i18n: "en",
          title: nov_data.title,
          author: nov_data.author,
          publisher: nov_data.publisher,
          description: nov_data.description,
        });
  
        jepub.cover(blob);
  
        for (let i in nov_data.chapters) {
          let id = nov_data.chapters[i].url;
          jepub.add(
            nov_data.chapter_parsed[id].title,
            nov_data.chapter_parsed[id].html
          );
        }
  
        status.innerHTML = "Generating ePub";
        jepub
          .generate("blob", function updateCallback(metadata) {
            status.innerHTML =
              "Zip: " + metadata.percent.toFixed(2) + " %";
            if (metadata.currentFile) {
                status.innerHTML +=
                "current file = " + metadata.currentFile;
            }
          })
          .then((filecontent: Blob) => {
            let url = URL.createObjectURL(filecontent);
  
            chrome.downloads.download({
              url: url,
              filename: nov_data.filename,
            });
          })
          .catch((err: ExceptionInformation) => {
            console.error(err);
          });
      });
  }