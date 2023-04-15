window.addEventListener('message',
    async function (event) {
    try {
        switch (event.data.command) {
            case "parse":
                event.source!.postMessage({
                    command: "error",
                    message: "Parser error: ",
                }, "*" as WindowPostMessageOptions);
        }
    } catch (e) {
        event.source!.postMessage({
            command: "error",
            message: "Parser error: " + e,
        }, "*" as WindowPostMessageOptions);
    }
});
