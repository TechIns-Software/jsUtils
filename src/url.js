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

export {
    prependHttps,
    extractHostnameFromUrl,
    getHostnameWithoutExtention
}
