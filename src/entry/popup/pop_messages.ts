

export function event_handler(event: any) {
    if (event.origin !== window.location.origin)
        return;
    let command = event.data.command;
    switch (command) {
        case 'toc':
            break;
        case 'fetch':
            break;
        default:
            break;
    }
}

export async function parse_source(iframe: HTMLIFrameElement) {
    try {
        iframe.contentWindow!.postMessage({
                command: "parse",

            },
            window.location.origin)
    } catch (e) {
        // status_txt.value = "Unable to parse content: " + e;
    }
}
