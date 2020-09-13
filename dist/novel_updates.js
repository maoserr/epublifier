if ("runtime" in chrome && "onMessage" in chrome.runtime) {
  function getChaps(dom_str) {
    let parser = new DOMParser();
    let dom = parser.parseFromString(dom_str, "application/xml");
    let chap_popup = dom.querySelector("#my_popupreading");
    let chap_lis = chap_popup.querySelectorAll("a");
    let chaps = [];
    chap_lis.forEach((element) => {
      if (element.href.includes("extnu")) {
        chaps.unshift({
          text: element.innerText,
          link: element.href.replace("chrome-extension", "https"),
        });
      }
    });
    return chaps;
  }

  chrome.runtime.onMessage.addListener(function (request, sender) {
    if (request.action == "getSource") {
      let chap_pop = getChaps(request.source);
      let msg_html = "";
      chap_pop.forEach((el) => {
        lbl_html = '<label for="' + el.text + '">' + el.text + "</label>";
        txt_html =
          '<input type="text" id="' +
          el.text +
          '" value="' +
          el.link +
          '" readonly />';
        msg_html += lbl_html + txt_html + "<br/>";
      });
      message.innerHTML = msg_html;
    }
  });

  function onWindowLoad() {
    let message = document.querySelector("#message");

    chrome.tabs.executeScript(
      null,
      {
        file: "getPageSource.js",
      },
      function () {
        // If you try and inject into an extensions page or the webstore/NTP you'll get an error
        if (chrome.runtime.lastError) {
          message.innerText =
            "There was an error injecting script : \n" +
            chrome.runtime.lastError.message;
        }
      }
    );
  }
}

window.onload = onWindowLoad;

function parse_results(arr) {
  let chaps = [];
  for (let i in arr) {
    let parser = new DOMParser();
    let dom = parser.parseFromString(arr[i].text, "text/html");
    let chapt_hdr = dom.querySelector(".entry-title").innerText;
    let chapt_html = dom.querySelector(".entry-content").innerText;
    chaps.push(chapt_html);
  }
  fetch("https://i.imgur.com/SEQutaS.jpg")
    .then((response) => {
      if (response.ok) return response.blob();
      throw "Network response was not ok.";
    })
    .then((blob) => {
      const jepub = new jEpub();
      jepub.init({
        title: "Lorem Ipsum",
        author: "Cicero",
        publisher: "lipsum.com",
        description:
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
      });

      jepub
        .cover(blob)
        .notes(
          '<p class="no-indent">Dịch sang Tiếng Việt bởi <strong>Đỗ Việt</strong> - www.doviet.net</p>'
        );

      jepub.add("Lorem Ipsum là gì?", [
        "Lorem Ipsum chỉ đơn giản là một đoạn văn bản giả, được dùng vào việc trình bày và dàn trang phục vụ cho in ấn. Lorem Ipsum đã được sử dụng như một văn bản chuẩn cho ngành công nghiệp in ấn từ những năm 1500, khi một họa sĩ vô danh ghép nhiều đoạn văn bản với nhau để tạo thành một bản mẫu văn bản. Đoạn văn bản này không những đã tồn tại năm thế kỉ, mà khi được áp dụng vào tin học văn phòng, nội dung của nó vẫn không hề bị thay đổi. Nó đã được phổ biến trong những năm 1960 nhờ việc bán những bản giấy Letraset in những đoạn Lorem Ipsum, và gần đây hơn, được sử dụng trong các ứng dụng dàn trang, như Aldus PageMaker.",
        'Trái với quan điểm chung của số đông, Lorem Ipsum không phải chỉ là một đoạn văn bản ngẫu nhiên. Người ta tìm thấy nguồn gốc của nó từ những tác phẩm văn học la-tinh cổ điển xuất hiện từ năm 45 trước Công Nguyên, nghĩa là nó đã có khoảng hơn 2000 tuổi. Một giáo sư của trường Hampden-Sydney College (bang Virginia - Mỹ) quan tâm tới một trong những từ la-tinh khó hiểu nhất, "consectetur", trích từ một đoạn của Lorem Ipsum, và đã nghiên cứu tất cả các ứng dụng của từ này trong văn học cổ điển, để từ đó tìm ra nguồn gốc không thể chối cãi của Lorem Ipsum. Thật ra, nó được tìm thấy trong các đoạn 1.10.32 và 1.10.33 của "De Finibus Bonorum et Malorum" (Đỉnh tối thượng của Cái Tốt và Cái Xấu) viết bởi Cicero vào năm 45 trước Công Nguyên. Cuốn sách này là một luận thuyết đạo lí rất phổ biến trong thời kì Phục Hưng. Dòng đầu tiên của Lorem Ipsum, "Lorem ipsum dolor sit amet..." được trích từ một câu trong đoạn thứ 1.10.32.',
        'Trích đoạn chuẩn của Lorem Ipsum được sử dụng từ thế kỉ thứ 16 và được tái bản sau đó cho những người quan tâm đến nó. Đoạn 1.10.32 và 1.10.33 trong cuốn "De Finibus Bonorum et Malorum" của Cicero cũng được tái bản lại theo đúng cấu trúc gốc, kèm theo phiên bản tiếng Anh được dịch bởi H. Rackham vào năm 1914.',
      ]);

      jepub.add(
        "Tại sao lại sử dụng nó?",
        '<p class="indent">Chúng ta vẫn biết rằng, làm việc với một đoạn văn bản dễ đọc và rõ nghĩa dễ gây rối trí và cản trở việc tập trung vào yếu tố trình bày văn bản. Lorem Ipsum có ưu điểm hơn so với đoạn văn bản chỉ gồm nội dung kiểu "Nội dung, nội dung, nội dung" là nó khiến văn bản giống thật hơn, bình thường hơn. Nhiều phần mềm thiết kế giao diện web và dàn trang ngày nay đã sử dụng Lorem Ipsum làm đoạn văn bản giả, và nếu bạn thử tìm các đoạn "Lorem ipsum" trên mạng thì sẽ khám phá ra nhiều trang web hiện vẫn đang trong quá trình xây dựng. Có nhiều phiên bản khác nhau đã xuất hiện, đôi khi do vô tình, nhiều khi do cố ý (xen thêm vào những câu hài hước hay thông tục).</p>'
      );

      jepub.add("Làm thế nào để có nó?", [
        "Có rất nhiều biến thể của Lorem Ipsum mà bạn có thể tìm thấy, nhưng đa số được biến đổi bằng cách thêm các yếu tố hài hước, các từ ngẫu nhiên có khi không có vẻ gì là có ý nghĩa. Nếu bạn định sử dụng một đoạn Lorem Ipsum, bạn nên kiểm tra kĩ để chắn chắn là không có gì nhạy cảm được giấu ở giữa đoạn văn bản. Tất cả các công cụ sản xuất văn bản mẫu Lorem Ipsum đều được làm theo cách lặp đi lặp lại các đoạn chữ cho tới đủ thì thôi, khiến cho lipsum.com trở thành công cụ sản xuất Lorem Ipsum đáng giá nhất trên mạng. Trang web này sử dụng hơn 200 từ la-tinh, kết hợp thuần thục nhiều cấu trúc câu để tạo ra văn bản Lorem Ipsum trông có vẻ thật sự hợp lí. Nhờ thế, văn bản Lorem Ipsum được tạo ra mà không cần một sự lặp lại nào, cũng không cần chèn thêm các từ ngữ hóm hỉnh hay thiếu trật tự.",
      ]);

      console.log(jepub);

      jepub
        .generate()
        .then((filecontent) => {
          console.log(filecontent);

          const url = URL.createObjectURL(filecontent),
            filename = "lorem-ipsum.epub";

          let link = document.createElement("a");
          document.body.appendChild(link);
          link.href = url;
          link.textContent = "Download EPUB";
          link.download = filename;

          saveAs(filecontent, filename);
        })
        .catch((err) => {
          console.error(err);
        });
    });
}
compile_epub.onclick = function () {
  let inps = message.querySelectorAll("input");
  let request = new XMLHttpRequest();
  (function loop(i, length, resultArr) {
    if (i >= length) {
      parse_results(resultArr);
      return;
    }
    let url = inps[i].value;

    request.open("GET", url);
    request.onreadystatechange = function () {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          resultArr.push({
            text: request.responseText,
            url: request.responseURL,
          });
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
  })(0, inps.length, []);
};
