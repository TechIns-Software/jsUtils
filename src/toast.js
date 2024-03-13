import {Toaster, ToasterPosition, ToasterTimer, ToasterType} from "bs-toaster";

/**
 * Display a Toast Message.
 * @param {String} msg Error Message
 * @param {Boolean} error Indication  whether the toast displays an error message
 */
function displayToast(msg,error=true){
    const advancedToaster = new Toaster({
        position: ToasterPosition.BOTTOM_END,
        type: error?ToasterType.FAILURE:ToasterType.SUCCESS,
        delay: 5000,
        timer: ToasterTimer.COUNTDOWN,
    });

    const title = error?"Σφάμλα":"Επιτυχία"
    advancedToaster.create(title,msg)
}

export {displayToast}