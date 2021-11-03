declare module "webextension-polyfill" {
    export default browser
}

declare module "jepub/dist/jepub" {
    interface metadata {
        percent: number;
        currentFile: string;
    }
    class jEpub {
        constructor();
        init(opts: unknown): jEpub;
        cover(blob: Blob): jEpub;
        notes(str: string): jEpub;
        date(date: Date): jEpub;
        add(title: string, content: string | string[]): jEpub;
        generate(
            type: string,
            updateCallback: (metadata: metadata) => unknown
        ): Promise<Blob>;
        static html2text(html: string): string;
    }
    export default jEpub;
}
