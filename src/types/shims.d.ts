declare module "webextension-polyfill" {
    export default browser
}

declare module "*.ejs" {
    const content: any;
    export default content;
}

declare module "*.xml" {
    const content: any;
    export default content;
}
