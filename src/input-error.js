
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

export {
    addInputErrorMsg,
    clearInputErrorMessage,
    displayExistingErrorMessage
}
