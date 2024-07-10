
/**
 * Removes any input error
 * @param {HTMLElement} inputElem
 * @param {Boolean} hideDefault If true it sets `display:none` into any existing `.invalid-feedback
 */
function clearInputErrorMessage(inputElem, hideDefault=false){
    const parent = inputElem.parentNode;
    console.log(parent)

    // Remove feedback generated from js
    parent.querySelectorAll(".invalid-feedback[data-js=true]").forEach(element=>{
        element.remove();
    });

    if(hideDefault){
        parent.querySelectorAll(".invalid-feedback").forEach(element=>{
            element.setAttribute("style","display:none !important");
        });
    } else {
        parent.querySelectorAll(`.invalid-feedback[style*=\"display: none\"]`).forEach(element=>{
            element.style.deleteRule("display");
        });
    }

    inputElem.classList.remove('is-invalid');
    inputElem.form.classList.remove('was-validated');

    inputElem.blur();
    inputElem.focus();
}

/**
 * Appends a bootstrap invalid-feedback message into inputElem.
 * The function hides existing invalid-feedback and adds its own.
 *
 * @param {HTMLElement} inputElem
 * @param {String} msg
 */
function addInputErrorMsg(inputElem,msg){
    clearInputErrorMessage(inputElem,true)

    const feedbackId = inputElem.getAttribute("name")+"InvalidFeedbakcjs"

    const invalidMsgElem = document.createElement('div');
    invalidMsgElem.classList.add("invalid-feedback");
    invalidMsgElem.innerText=msg;
    invalidMsgElem.id=feedbackId
    // Mark that Js created the feedback
    invalidMsgElem.setAttribute('data-js',true)

    const parent = inputElem.parentNode;
    parent.append(invalidMsgElem);

    inputElem.classList.add('is-invalid');
}

/**
 * Display an *existing* invalid-feedback error message.
 * Compared to addInputErrorMsg it finds the existing one `invalid-feedback` div and displays it.
 * @param {HTMLElement} inputElem
 */
function displayExistingErrorMessage(inputElem){
    clearInputErrorMessage(inputElem)

    inputElem.reportValidity();
    inputElem.classList.add('is-invalid');

    const form = inputElem.form;
    form.classList.add("was-validated");

    const feedback = document.querySelector(inputElem.getAttribute("aria-describedby"))
    if(feedback){
        console.log(feedback)
        feedback.show()
    }
}

/**
 * Handles form submission errors by processing the response in a specific JSON format.
 * The response should contain a `msg` field, which can be either a string or an object.
 *
 * - If the response status is 400, `msg` should be an object where:
 *   - The keys are column names (corresponding to form input names).
 *   - The values are string of error messages for the respective inputs.
 *   - Example: 
 *       { msg: { "username": "Username is required", "email": "Invalid email address" }}
 *
 *   The function will append a Bootstrap input error message to the respective input elements.
 *
 * - For other statuses, `msg` should be a string containing the error message. For example:
 *     { "msg": "An unexpected error occurred" }
 *
 * @param {Object} xhr - The XMLHttpRequest response object.
 * @param {Function} next - The callback function to be called for further handling.
 *                           The function is called with the following arguments:
 *                           - {boolean} hasErrors - Indicates if there were validation errors (true for status 400, false otherwise).
 *                           - {Object|string} msg - The error messages object or string from the response.
 *                           - {Object} xhr - The original XMLHttpRequest response object.
 */
function errorResponseHandler(xhr,next){
    const responseJson = JSON.parse(xhr.responseText)['msg']
    if(xhr.status == 400){
        Object.keys(responseJson).forEach((key)=>{
            const msg = responseJson[key].join("<br>")
            addInputErrorMsg(document.querySelector(`input[name=${key}]`),msg)
        })
        next(true,responseJson,xhr);
        return
    }

    next(false,responseJson,xhr)
}

export {
    addInputErrorMsg,
    clearInputErrorMessage,
    displayExistingErrorMessage,
    errorResponseHandler
}
