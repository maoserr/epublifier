import {Ref} from "vue";

export function event_handler(status:Ref<string>, event: any) {
    console.debug(event)
    if (event.origin !== "null") {
        console.warn("Invalid origin: " + window.location.origin)
        status.value = "Invalid origin: " + window.location.origin
        return;
    }
    if (!("data" in event))
        return
    if (!("command" in event.data))
        return
    status.value = event.data.message;
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

export function parse_source(iframe: HTMLIFrameElement,
                             url: string,
                             src: string): string {
    try {
        iframe.contentWindow!.postMessage({
                command: "parse",
                data: {url, src}
            },
            '*')
    } catch (error) {
        return (error instanceof Error) ? error.message : String(error)
    }
    return "success"
}
