/**
 * If not direct clipboard manipulation supported from browser, use a alternate approach
 * It is used upon copyTextToClipboard function.
 *
 * Function was seen in: https://stackoverflow.com/a/30810322/4706711
 *
 * @param {String} text
 * @param {function} callback
 */
function fallbackCopyTextToClipboard(text,callback) {
    var textArea = document.createElement("textarea");
    textArea.value = text;

    // Avoid scrolling to bottom
    textArea.style.top = "0";
    textArea.style.left = "0";
    textArea.style.position = "fixed";

    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();

    try {
        var successful = document.execCommand('copy');
        var msg = successful ? 'successful' : 'unsuccessful';
        if(successful){
            callback(null,text);
        } else {
            callback("Usucessfull copying of the value",text);
        }
        console.log('Fallback: Copying text command was ' + msg);
    } catch (err) {
        callback(err,text);
        console.error('Fallback: Oops, unable to copy', err);
    }

    document.body.removeChild(textArea);
}

/**
 * Copy text into clipboard.
 *
 * Function from: https://stackoverflow.com/a/30810322/4706711
 *
 * @param {String} text
 * @param {function} callback
 */
function copyTextToClipboard(text,callback) {
    if (!navigator.clipboard) {
        fallbackCopyTextToClipboard(text);
        return;
    }
    navigator.clipboard.writeText(text).then(function() {
        callback(null,text);
        console.log('Async: Copying to clipboard was successful!');
    }, function(err) {
        callback(err,text);
        console.error('Async: Could not copy text: ', err);
    });
}


/**
 * Upon click copy value:
 *
 * This assumes that the button will have:
 * * data-val with the value copied upon
 * * the class 'btn-copy'
 *
 * @param {function} uponCopyCallback Callback that triggers an action once value is copied
 *
 */
function copyvalueUponClickBtn(uponCopyCallback){
    $(".btn-copy").on("click",(e)=>{
       const element = e.target;
       const text =$(element).data('val');


       copyTextToClipboard(text,(err,text)=>{
           if(typeof uponCopyCallback === 'function'){
                uponCopyCallback(err,text,element)
           }
       });
    });
}

export {
    fallbackCopyTextToClipboard,
    copyTextToClipboard,
    copyvalueUponClickBtn
}