/**
 * Checks if a value is empty
 * @returns {boolean}
 */
export function isEmpty(val) {
    if (val === null) {
        return true;
    } else if (typeof val === 'string') {
        return !val.trim();
    }
    return false;
}

/**
 * Get current moment in ISO format
 * @param {Object} date
 * @returns {string} ISO date
 */
export function getISODate(date = new Date()) {
    return date.toISOString();
}

/**
 * Convert convert HTML to valid XHTML
 * @param {String} html
 * @param {String} outText return as plain text
 */
export function parseDOM(html, outText = false) {
    let doc = (new DOMParser).parseFromString(
        `<!doctype html><body>${html}`,
        'text/html');
    if (outText) return doc.body.textContent.trim();
    let docstr = (new XMLSerializer).serializeToString(doc.body);
    return docstr.replace(/(^<body\s?[^>]*>|<\/body>$)/g, '');
}

/**
 * Convert HTML to plain text
 * @param {String} html
 * @param noBr
 */
export function html2text(html, noBr = false) {
    html = html.replace(/<style([\s\S]*?)<\/style>/gi, '');
    html = html.replace(/<script([\s\S]*?)<\/script>/gi, '');
    html = html.replace(/<\/(div|p|li|dd|h[1-6])>/gi, '\n');
    html = html.replace(/<(br|hr)\s*[/]?>/gi, '\n');
    html = html.replace(/<li>/ig, '+ ');
    html = html.replace(/<[^>]+>/g, '');
    html = html.replace(/\n{3,}/g, '\n\n');
    html = parseDOM(html, true);
    if (noBr) html = html.replace(/\n+/g, ' ');
    return html;
}

/**
 * @see https://gist.github.com/dperini/729294
 * @param {String} value
 */
export function validateUrl(value) {
    return /^(?:(?:https?|ftp):\/\/)(?:\S+(?::\S*)?@)?(?:(?!(?:10|127)(?:\.\d{1,3}){3})(?!(?:169\.254|192\.168)(?:\.\d{1,3}){2})(?!172\.(?:1[6-9]|2\d|3[0-1])(?:\.\d{1,3}){2})(?:[1-9]\d?|1\d\d|2[01]\d|22[0-3])(?:\.(?:1?\d{1,2}|2[0-4]\d|25[0-5])){2}(?:\.(?:[1-9]\d?|1\d\d|2[0-4]\d|25[0-4]))|(?:(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)(?:\.(?:[a-z\u00a1-\uffff0-9]-*)*[a-z\u00a1-\uffff0-9]+)*(?:\.(?:[a-z\u00a1-\uffff]{2,}))\.?)(?::\d{2,5})?(?:[/?#]\S*)?$/i.test(value);
}

/**
 * Convert MIME type to extension
 * @param {String} mime
 */
export function mime2ext(mime) {
    let ext = null;
    switch (mime) {
    case 'image/jpg':
    case 'image/jpeg':
        ext = 'jpg';
        break;
    case 'image/svg+xml':
        ext = 'svg';
        break;
    case 'image/gif':
    case 'image/apng':
    case 'image/png':
    case 'image/webp':
    case 'image/bmp':
        ext = mime.split('/')[1];
        break;
    default:
        ext = null;
        break;
    }
    return ext;
}
