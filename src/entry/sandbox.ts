window.addEventListener('message', function(event) {
    let command = event.data.command;
    let name = event.data.name || 'hello';
    switch(command) {
        case 'render':
            let output = document.getElementById("output");
            let func = Function(event.data.code);
            output.innerHTML = event.data.context;
            event.source.postMessage({
                name: name,
                html: "blah",
                message: "blah"
            }, event.origin as WindowPostMessageOptions);
            break;
    }
});