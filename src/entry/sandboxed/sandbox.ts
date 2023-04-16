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
    } catch (error) {
        event.source!.postMessage({
            command: "error",
            message: ((error instanceof Error) ? error.message : String(error))
        }, "*" as WindowPostMessageOptions);
    }
});
