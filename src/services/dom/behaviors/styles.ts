
export function set_float_win_style(cont:HTMLDivElement) {
  cont.style.all = "initial"
  if (cont.style.display == "flex") {
    cont.style.display = "none"
  } else {
    cont.style.display = "flex";
  }
  cont.style.flexDirection = "column";
  cont.style.margin = "0";
  cont.style.padding = "0";
  cont.style.resize = "both";
  cont.style.overflow = "hidden";
  cont.style.height = "600px";
  cont.style.width = "600px";
  cont.style.position = "fixed";
  cont.style.top = "20px";
  cont.style.left = "20px";
  cont.style.zIndex = "9000000000000000000";
  cont.style.background = "#D3D3D3";
  cont.style.borderRadius = "5px";
  cont.style.border = "1px solid black";
}

export function set_titlebar_style(titlebar:HTMLDivElement) {
  titlebar.style.all = "initial"
  titlebar.style.height = "1.2rem";
  titlebar.style.color = "black";
  titlebar.style.padding = "5px";
  titlebar.textContent = "";
}

export function set_closebtn_style(closebtn:HTMLDivElement) {
  closebtn.style.all = "initial"
  closebtn.style.float = "right";
  closebtn.style.borderRadius = "50%";
  closebtn.style.marginRight = "8px";
  closebtn.style.opacity = "1";
  closebtn.style.height = "20px";
  closebtn.style.width = "20px";
  closebtn.style.backgroundColor = "#E96E4C";
  closebtn.style.border = "1px solid red"
}

export function set_iframe_style(ifram:HTMLDivElement) {
  ifram.style.all = "initial"
  ifram.style.background = "white"
  ifram.style.flexGrow = "1";
  ifram.style.margin = "6px";
  ifram.style.padding = "0";
  ifram.style.borderRadius = "5px";
  ifram.style.border = "1px solid black";
}
