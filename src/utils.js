import $ from "jquery";
import {Tab} from "bootstrap";
import {updateQueryParam} from 'url.js'

/**
 * Checks is element is istring if is string it fetched the nessesary HTMLElement
 * @param {String|HTMLElement} element
 * @return HTMLElement
 */
function stringToDomHtml(element)
{
    if(element instanceof HTMLElement){
        return element;
    }

    let domElement = document.getElementById(element);
    if(domElement){
       return domElement;
    }

    return document.querySelector(element);
}

/**
 * Check if 2 Fields have same value
 * @param {String|HTMLElement} field1
 * @param {String|HTMLElement} field2
 * @return {boolean}
 */
function checkFieldHavingSameValue(field1,field2)
{
    field1 = stringToDomHtml(field1);
    field2 = stringToDomHtml(field2);
    console.debug(field2.value,field1.value)
    return field2.value === field1.value;
}

/**
 * Serialize the form input associated with the given element or its ID.
 *
 * @author ChatGPT
 * @param {string|HTMLElement} elementOrId - The ID of the form element or the form element itself.
 * @returns {string|undefined} The serialized form input, or undefined if the form is not found.
 */
function serializeFormInput(elementOrId) {
    // Get the form element
    const form = (typeof elementOrId === 'string') ? document.getElementById(elementOrId) : elementOrId;

    if (!form) {
        console.error('Form not found');
        return;
    }

    // Create a FormData object passing the form element
    const formData = new FormData(form);

    // Serialize the form data
    return new URLSearchParams(formData).toString();
}


/**
 * Generic function for submitting a form via ajax
 *
 * Note beforeSend receives the following arguments:
 *  - {HTMLElement} form
 *  - {jqXHR} jqXHR,
 *  - {PlainObject} settings
 *
 * @param {String| HTMLElement} form Form element to Save
 * @param {function} successCallback Callback function if ajax call returns 20* as bootstrap 0 or 201
 * @param {function} errorCallback Callback function if ajax call returns 5XX or 4XX
 * @param {function|NULL} beforeSend Callback that runs code before an ajax call is performed
 * @param {*} previousAjax Previous AjaxCall to stop sending
 *
 */
function submitFormAjax(form,successCallback,errorCallback,beforeSend,previousAjax){


    if(typeof form == "string"){
        form = document.getElementById(form);

        if(!form){
            form = document.querySelector(form)
        }

        if(!form){
            throw "Form is not an element"
        }
    }

    if(!successCallback || !errorCallback){
        throw "Callbacks have not been Provided"
    }

    if(!form){
        throw "Form has not been provided"
    }

    if(previousAjax){
        previousAjax.abort()
    }

    const ajaxConf = {
        url: $(form).attr("action"),
        method: $(form).attr("method"),
        data: serializeFormInput(form),
        statusCode: {
            201: successCallback,
            200: successCallback,
            400: errorCallback,
            500: errorCallback
        }
    }


    if(beforeSend && typeof beforeSend === 'function'){
        ajaxConf.beforeSend = (jqXHR,settings)=> {
            beforeSend(form,jqXHR,settings)
        }
    }

    return $.ajax(ajaxConf)
}

/**
 * Debounce function as described into:
 * https://www.freecodecamp.org/news/javascript-debounce-example/
 *
 * It delays the execution of a function func after wait miliseconds (?)
 * Usefull for avoiding multiple ajax requests triggered from user Input
 *
 * @param func
 * @param wait
 * @return {(function(...[*]): void)|*}
 */
function debounce(func, wait) {
    let timeout;
    return function (...args) {
        const context = this;
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(context, args), wait);
    };
}

/**
 *
 * Scans for input in a form and upon change of every input submits the form
 *
 * @param {HTMLElement} form
 * @param {function} successCallback
 * @param {function} errorCallback
 * @param {function} beforeSendCallback
 */
function onChangeSubmitForm(form,successCallback,errorCallback,beforeSendCallback){

    // Previous Ajax Call used for canceling upon input change
    let previousAjax=null
    const inputs = form.querySelectorAll("input")

    inputs.forEach((input)=>{
        $(input).on('change',debounce(()=>{
            previousAjax=submitFormAjax(form,successCallback,errorCallback,beforeSendCallback,previousAjax)
        },250));
    });
}


/**
 * Show or hide the password value of a type="password" element.
 *
 * @param {HTMLElement|String} whatInputSee Password Input field.
 * @param {HTMLElement|String} idOfEye Html element showing the eye icon.
 */
function toogleEyePasword(whatInputSee,idOfEye){
    const input = stringToDomHtml(whatInputSee);
    const eye = stringToDomHtml(idOfEye);

    if (input.getAttribute('type') === 'password') {
        console.debug(input,eye);
        input.setAttribute('type', 'text');
        eye.classList.remove('fa-eye');
        eye.classList.add('fa-eye-slash');
    } else {
        input.setAttribute('type', 'password');
        eye.classList.remove('fa-eye-slash');
        eye.classList.add('fa-eye');
    }
}


/**
 * Scans a form and updates the url parameters from eash input.
 * @param {String | HTMLElement} form 
 */
function replaceCurrentUrlQueryWithFormInput(form)
{
    $(form).serializeArray().forEach((item)=>{
        updateQueryParam(item.name,item.value)
    })
}

/**
 * Submits a input element value via ajax. it is reccomended to call it on `onchange` event handler.
 *
 * A http GET will be used providing the element's value into `value` param.
 * The http request will be a typical application/x-www-form-urlencoded  post request.
 *
 * @param {String | HTMLElement} element
 * @param {function} successCallback
 * @param {function} failCallback
 * @param {function} beforeSend
 */
function sendElementValueUponAjax(element, successCallback,failCallback,beforeSend) {

    element = stringToDomHtml(element);
        const ajaxConf = {
            'method':'GET',
            'url': element.getAttribute('data-onchange-ajax'),
            'data': "value="+element.value,
            success:successCallback?successCallback:()=>{},
            error:failCallback?failCallback:()=>{}
        }

        if(beforeSend && typeof beforeSend === 'function'){
            ajaxConf.beforeSend = (jqXHR,settings)=> {
                beforeSend(form,jqXHR,settings)
            }
        }
        console.log(ajaxConf);
        return $.ajax(ajaxConf)
}


/**
 * This function checks if value has changed from the orinal one.
 * The Original value is provided via data-original-value attribute.
 * If not present it defaults to empty string.
 *
 * @param {HTMLElement} form
 * @return {{same: *[], empty: *[], checkedElementNum: number}}
 */
function changedFields(form){

    const formData=new FormData(form);

    const same = [];

    let checkedElementNum = 0;

    formData.forEach((value,key)=>{

        const inputElem = document.querySelector(`input[name="${key}"], textarea[name="${key}"`);

        if(inputElem.getAttribute('type') === 'hidden'){
            return;
        }

        checkedElementNum=checkedElementNum+1;

        const origvalue = inputElem.hasAttribute('data-original-value')?inputElem.getAttribute('data-original-value'):""
        if(origvalue.trim() === value){
            same.push(inputElem);
            return;
        }
    });

    return {
        same,
        checkedElementNum
    };
}

/**
 * Enable or Disable form Submit Button.
 *
 * If opted for feedback reset removes ant rule `display:none` from input
 *
 * @param {HTMLElement} form Form element
 * @param {Boolean} enable Enable or disable button
 * @param {Boolean}  resetFeedback Resets the Input feedback.
 */
function formEnable(form,enable,resetFeedback=true){
    const submitBtn = form.querySelector(`button[type="submit"]`)?? document.querySelector(`button[form="${form.id}"][type="submit"]`);
    if(enable){
        submitBtn.removeAttribute("disabled");
    } else {
        submitBtn.setAttribute("disabled",true);
    }

    if(resetFeedback){
        resetFormFeedback(form);
    }
}

/**
 * Retrieves an the html input of a form having a name into its property.
 * It looks for both textareas and normal inputs.
 * @param {HTMLElement} form
 * @param {String} name
 *
 * @return {HTMLElement | undefined }
 */
function getInputHavingName(form,name){

    name = name.trim();
    if(!name){
        throw "Name must be a value"
    }

    return form.querySelector(`input[name="${name}"], textarea[name="${name}"]`)
}

/**
 * Resets the form from changed done in addInputErrorMsg
 * @param {HTMLElement} form
 */
function resetFormFeedback(form){

    form.querySelectorAll(".invalid-feedback[data-js=true]").forEach((element)=>element.remove());
    form.querySelectorAll(`.invalid-feedback[style*="display:none"]`)
        .forEach(element=>element.style.removeProperty("display"));

    form.querySelectorAll(`input:not([type="hidden"])`).forEach(element=>{
        console.log(element)
        element.classList.remove('is-invalid')
        element.classList.remove('is-valid')
        element.setCustomValidity("");
    })

    form.classList.remove('was-validated');
}

/**
 * The following function bootsatraps the tab behaviour as follows:
 * 1. Sets default tab
 * 2. Changes the tab from url hastag
 * 3. Adds events into links to change based upon Href
 *
 * @param {String|HTMLElement} navElement Navigation Element where items are clicked
 * @param {String} tabId The id of the tab to enable
 */
function enableTabs(navElement,tabId) {

    if (typeof tabId !== 'string' && !tabId instanceof String){
        throw "Tab Id is not a string"
    }

    const hash = window.location.hash?window.location.hash:tabId;

    const triggerTabList = navElement.querySelectorAll('a.nav-link')

    triggerTabList.forEach(function (triggerEl) {

        const tabTrigger = new Tab(triggerEl)
        const href = triggerEl.getAttribute('href')
        triggerEl.addEventListener('click', function (event) {
            event.preventDefault()
            tabTrigger.show()
            window.location.hash = href;
        })

        if (hash === href) {
            tabTrigger.show();
            navElement.querySelectorAll('a.nav-link').forEach(element=>{
                element.classList.remove('active')
            })
            triggerEl.classList.add('active')
        }
    })
}

export {
    submitFormAjax,
    onChangeSubmitForm,
    checkFieldHavingSameValue,
    stringToDomHtml,
    toogleEyePasword,
    debounce,
    replaceCurrentUrlQueryWithFormInput,
    changedFields,
    formEnable,
    getInputHavingName,
    resetFormFeedback,
    enableTabs,
    sendElementValueUponAjax
}
