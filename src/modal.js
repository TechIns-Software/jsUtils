import { submitFormAjax,stringToDomHtml,formEnable } from "./utils";
import { Modal } from "bootstrap";
import { clearInputErrorMessage,errorResponseHandler } from "./input-error";

/**
 * Display a Bootstrap 5 alert inside a modal.
 * 
 * This function inserts a Bootstrap 5 "danger" alert at the top of the modal body. 
 * It can accept either a string (selector) or an HTMLElement for the modalElement parameter.
 * 
 * @param {String|HTMLElement} modalElement - The modal element or a string selector of the modal in which the alert should be displayed.
 * @param {String} alertMsg - The message to display inside the alert.
 * 
 * @example
 * // Using a string selector
 * addAlertUpoModal('#myModal', 'An error has occurred!');
 * 
 * // Using an HTMLElement
 * const modal = document.getElementById('myModal');
 * addAlertUpoModal(modal, 'An error has occurred!');
 * 
 */
function addAlertUpoModal(modalElement,alertMsg)
{
    const alert=document.createElement('div')
    alert.classList.add('alert');
    alert.classList.add('alert-danger');
    alert.setAttribute('role','alert');
    alert.setAttribute('data-js','true');

    alert.innerHTML=alertMsg;

    modalElement = stringToDomHtml(modalElement)
    const alertContainer = modalElement.querySelector('.modal-body');
    alertContainer.insertBefore(alert,alertContainer.firstChild)
}

/**
 * Remove all Bootstrap 5 alerts created by JavaScript from a modal.
 * 
 * This function removes any alert elements with the `data-js="true"` attribute
 * from the modal body, which were previously added by JavaScript.
 * 
 * It can be used to revert the effect of addAlertUpoModal
 * 
 * @param {String|HTMLElement} modalElement - The modal element or a string selector of the modal from which alerts should be removed.
 * 
 * @example
 * // Using a string selector
 * removeAlertsFromModal('#myModal');
 * 
 * // Using an HTMLElement
 * const modal = document.getElementById('myModal');
 * // Add alert
 * addAlertUpoModal(modal, 'An error has occurred!');
 * 
 * // Remove alert
 * removeAlertsFromModal(modal);
 * 
 * 
 */
function removeAlertsFromModal(modalElement){
    modalElement = stringToDomHtml(modalElement)
    const alertContainer = modalElement.querySelector('.modal-body');
    alertContainer.querySelectorAll('.alert[data-js=true]').forEach(el=>{
        console.log(el)
        el.remove();
    })
}

/**
 * Handles the submission of a form inside a modal using AJAX, with optional customization for success, failure, and submission handling.
 * Cleans up the form and modal upon closing.
 *
 * @param {HTMLElement|string} modalElem - The modal element or a selector string to locate the modal that contains the form.
 * 
 * @param {function(HTMLFormElement, Object|string, Modal):void} submitSuccessCallback - Function executed upon successful form submission.
 * - First argument: the form element inside the modal.
 * - Second argument: the data received from the AJAX request.
 * - Third argument: the Bootstrap modal instance.
 * 
 * @param {function(boolean, boolean, Object, XMLHttpRequest,function(error)):void} ajaxFailureCallback - Function executed when the ajax call upon form fails.
 * - First argument: whether the AJAX call was made.
 * - Second argument: whether the failure was a 400 (Bad Request) error.
 * - Third argument: the response data, which should contain at least a `msg` property with an error message.
 * - Fourth argument: the XMLHttpRequest object.
 * 
 * @param {function(XMLHttpRequest, function(error: Error|boolean, event: Event, HTMLElement, HTMLElement, Modal):void):void} [beforeSend] - Optional callback function that runs before the form is submitted via AJAX.
 * - First argument: the XMLHttpRequest object.
 * - Second argument: a callback to handle errors or proceed with form submission.
 * 
 * @param {function(Event, HTMLFormElement, HTMLElement, Modal, function(Error|boolean, Event, HTMLFormElement, HTMLElement, Modal):void):void} [onSubmitHandle] - Optional function to handle custom form submission logic.
 * - First argument: the form submission event.
 * - Second argument: the form element.
 * - Third argument: the modal element.
 * - Fourth argument: the Bootstrap modal instance.
 * - Fifth argument: a callback to trigger the actual form submission (with optional error handling).
 * 
 * @param {function(HTMLElement, Modal, HTMLFormElement):void} [onModalClose] - Optional function executed when the modal is closed.
 * - First argument: the modal element.
 * - Second argument: the Bootstrap modal instance.
 * - Third argument: the form element inside the modal.
 */
function submitFormUponModalUsingAjax(modalElem,submitSuccessCallback,ajaxFailureCallback,beforeSend,onSubmitHandle,onModalClose,formSubmitErrorHandleBeforeAjax) {
    const modalElement = stringToDomHtml(modalElem)

    const form = modalElement.querySelector('form');
    const modal= Modal.getOrCreateInstance(modalElement);

    modalElem.addEventListener('hidden.bs.modal',(e)=>{
        formEnable(form,true,true)
        form.reset();

        // Sometimes Backdrop may not be removed upon modal closure So I chack for it and I manually remove it as a workaround.
        const backdrop = document.querySelector(".modal-backdrop");
        if(backdrop){
            backdrop.remove();
        }
        
        if(typeof onModalClose === 'function'){
            onModalClose(modalElem,modal,form);
        }
    });

    const __beforeSend = (jqXHR,settings)=>{
        formEnable(form,false)
        if(typeof beforeSend === 'function'){
            beforeSend(jqXHR,settings)
        }
    }
    
    const __ajaxError = (is400,error)=>{
        formEnable(form,true,true)
        if(error){
            console.error(error)
            return;
        }
        
        if(!is400) {
            modal.hide();
        }
    }

    // Ajax Handler
    const __formSubmitAjaxCallback = (e)=>{
        submitFormAjax(form,(data)=>{
            formEnable(form,true,true)
            submitSuccessCallback(form,data,modal)
        },
        (jqxhr)=>{
            errorResponseHandler(jqxhr,(is400,responseJson,xhr,unhandledInputs)=>{
                if(typeof submitFailureCallback === 'function'){
                    ajaxFailureCallback(true,null,is400,responseJson,xhr,unhandledInputs,(error)=>{
                        __ajaxError(is400,error)
                    });
                }
            },form)
        },__beforeSend)
    }

    if (typeof formSubmitErrorHandleBeforeAjax !== 'function') {
        formSubmitErrorHandleBeforeAjax=(error,event, form, modalElem, modal)=>{
            formEnable(form,true,true)
        }
    }

    // Submit
    const __handle = (error, event, form, modalElem, modal)=>{
        if(error){
            formSubmitErrorHandleBeforeAjax(error,event, form, modalElem, modal)
            return
        }

        __formSubmitAjaxCallback(e);
    }


    form.addEventListener('submit',(e)=>{
        e.preventDefault();
        e.stopPropagation();

        if(typeof onSubmitHandle === 'function'){
            try{
                onSubmitHandle(e, form, modalElem, modal,(error) => {
                    __handle(error,e,form, modalElem, modal)
                });
            } catch(error){
                // Upon onSubmitHandle developer may also throw an error I need to handle it as well 
                __handle(error,e,form, modalElem, modal)
            }
        } else {
           __handle(false,form, modalElem, modal)
        }
    });
}

export {
    submitFormUponModalUsingAjax,
    addAlertUpoModal,
    removeAlertsFromModal
}
