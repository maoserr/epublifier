import { createApp } from 'vue'

import App from "../main/MainApp.vue";
import PrimeVue from 'primevue/config';
import VueCodemirror from 'vue-codemirror'
import {
    crosshairCursor,
    drawSelection,
    dropCursor, highlightActiveLine,
    highlightActiveLineGutter,
    highlightSpecialChars, keymap,
    lineNumbers, rectangularSelection
} from "@codemirror/view";
import {defaultKeymap, history, historyKeymap} from "@codemirror/commands";
import {
    bracketMatching, codeFolding,
    defaultHighlightStyle,
    foldGutter, foldKeymap,
    indentOnInput,
    syntaxHighlighting
} from "@codemirror/language";
import {EditorState} from "@codemirror/state";
import {autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap} from "@codemirror/autocomplete";
import {highlightSelectionMatches, searchKeymap} from "@codemirror/search";
import {lintKeymap} from "@codemirror/lint";

const app = createApp(App);
app.use(PrimeVue);
app.use(VueCodemirror, {
    // optional default global options
    autofocus: true,
    disabled: false,
    indentWithTab: true,
    tabSize: 2,
    placeholder: 'Code goes here...',
    extensions: [
        lineNumbers(),
        highlightActiveLineGutter(),
        highlightSpecialChars(),
        history(),
        codeFolding({placeholderText: '...'}),
        foldGutter({openText: "v", closedText: ">"}),
        drawSelection(),
        dropCursor(),
        EditorState.allowMultipleSelections.of(true),
        indentOnInput(),
        syntaxHighlighting(defaultHighlightStyle, { fallback: true }),
        bracketMatching(),
        closeBrackets(),
        autocompletion(),
        rectangularSelection(),
        crosshairCursor(),
        highlightActiveLine(),
        highlightSelectionMatches(),
        keymap.of([
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...searchKeymap,
            ...historyKeymap,
            ...foldKeymap,
            ...completionKeymap,
            ...lintKeymap
        ])
    ]
    // ...
})
app.mount('#app')
