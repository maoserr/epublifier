# Permissions Explanation

1. downloads - Generated epub needs download permission to be downloaded.
2. storage - Parser definitions are stored in local storage so modifications can be done.
3. scripting - Parser definitions are stored as javascript code for maximum flexibility, 
this allows eval of the definition upon start up.
4. <all_urls> - For background fetching of chapters.
5. clipboardRead (optional) - For setting cover image from clipboard.
6. unlimitedStorage (optional) - If you want to cache current parsed text, 
this is necessary to overcome storage limits.
7. declarativeNetRequestWithHostAccess, declarativeNetRequestFeedback (optional) - Some websites do not
allow fetching of resources without a "referer" header, this injects a referer for requests
coming from the extension.
