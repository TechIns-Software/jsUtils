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
 * Updates the 
 * @param {*} key 
 * @param {*} value 
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

export {
    prependHttps,
    extractHostnameFromUrl,
    getHostnameWithoutExtention,
    updateQueryParam
}
