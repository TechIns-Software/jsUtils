/**
 * Prepend Https if url does not have it.
 * @param {string} url
 * @return {*|string}
 */
function prependHttps(url){
    if (!/^https?:\/\//i.test(url)) {
        return  'https://' + url;
    }
    return url;
}

function extractHostnameFromUrl(url){
    const parsedUrl = new URL(url);
    return parsedUrl.hostname;
}

function getHostnameWithoutExtention(url){
    const domain = extractHostnameFromUrl(url);
    const domainParts = domain.split('.');
    return domainParts[0].toLowerCase();
}

/**
 * Sets or updates the url parameter having name with value,
 * Upon Url query string (https://en.wikipedia.org/wiki/Query_string)
 * 
 * @param {String} key 
 * @param {String} value 
 */
function updateQueryParam(key, value) {
    const currentUrl = new URL(window.location.href);
    const params = new URLSearchParams(currentUrl.search);

    if(!value){
        params.delete(key)
    } else {
        params.set(key, value);
    }

    // Replace the current URL with the updated parameters
    window.history.replaceState({}, document.title, `${currentUrl.pathname}?${params.toString()}`);
}

/**
 * Checks if a given string is a valid HTTP or HTTPS URL.
 * 
 * It is based upon:
 * https://stackoverflow.com/a/3809435/4706711
 * 
 * @param {string} str - The string to be checked.
 * @returns {boolean} - Returns true if the string is a valid HTTP or HTTPS URL, false otherwise.
 */
function isValidHttpUrl(str) {
    const pattern = new RegExp(
        '^(https?:\\/\\/)?' + // Optional protocol (http or https)
        '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // Domain name (e.g., example.com)
        '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR IPv4 address (e.g., 192.168.0.1)
        '(\\:\\d+)?' + // Optional port (e.g., :8080)
        '(\\/[-a-z\\d%_.~+]*)*' + // Optional path (e.g., /path/to/resource)
        '(\\?[;&a-z\\d%_.~+=-]*)?' + // Optional query string (e.g., ?key=value)
        '(\\#[-a-z\\d_]*)?$', // Optional fragment (e.g., #section)
        'i' // Case-insensitive flag
    );
    return pattern.test(str);
}

export {
    prependHttps,
    extractHostnameFromUrl,
    getHostnameWithoutExtention,
    updateQueryParam,
    isValidHttpUrl
}
