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
 * Bootstraps and handles the submission of a form inside a modal, using AJAX for form submission.
 * Upon Close also handles the form cleanup
 *
 * @param {HTMLElement|string} modalElem - The modal element (or its selector) containing the form.
 * 
 * @param {function(HTMLFormElement, Object|string, Modal):void} submitSuccessCallback - Callback function to execute on successful form submission.
 * - First Argument is the form Element that resides inside the modal
 * - The Second one is the Data receved from ajax
 * - The third one is the Bootstrap Modal
 * 
 * @param {function(boolean, boolean, Object, XMLHttpRequest):void} submitFailureCallback - Callback function to execute on form submission failure.
 * 
 *   - First argument is whether ajax has performed, 
 *   - Second is if it’s a 400 error, 
 *   - third is response data. The ajax data should contain at least a `msg` element containing the error message 
 *   - fourth is the XMLHttpRequest.
 * 
 * @param {function(XMLHttpRequest):void} [beforeSend] - Optional callback function to execute before the form is sent. Arguments are the same used upon submitFormAjax
 * 
 * @param {function(Event, HTMLFormElement, HTMLElement, Object, function(Event):void):void} [onSubmitHandle] - Optional callback function to handle form submission.
 *  This function should receive event, form element, modal element, modal instance, and a callback to trigger form submission.
 * 
 * @param {function(HTMLElement, Object, HTMLFormElement):void} [onModalClose] - Optional callback to execute when the modal is closed.
 */
function submitFormUponModalUsingAjax(modalElem,submitSuccessCallback,submitFailureCallback,beforeSend,onSubmitHandle,onModalClose) {
    const modalElement = stringToDomHtml(modalElem)

    const form = modalElement.querySelector('form');
    const modal= Modal.getOrCreateInstance(modalElement);

    modalElem.addEventListener('hidden.bs.modal',(e)=>{
        formEnable(form,true,true)
        form.reset();

        if(typeof onModalClose === 'function'){
            onModalClose(modalElem,modal,form);
        }
    });

    const finalBeforeSend = (jqXHR,settings)=>{
        formEnable(form,false)
        if(typeof beforeSend === 'function'){
            beforeSend(jqXHR,settings)
        }
    }
    
    // Callback function upon submit
    const formSubmitAjaxCallback = (e)=>{
        submitFormAjax(form,(data)=>submitSuccessCallback(form,data,modal),(jqxhr)=>{
            errorResponseHandler(jqxhr,(is400,responseJson,xhr,unhandledInputs)=>{
                
                if(typeof submitFailureCallback === 'function'){
                    Promise.resolve(submitFailureCallback(true,is400,responseJson,xhr,unhandledInputs)).then(()=>{
                        formEnable(form,true,true)
                        if(!is400) {
                            modal.hide();
                        }
                    }).catch(e=>{
                        formEnable(form,true,true)
                        console.error(e)
                    })
                }
            },form)
        },finalBeforeSend)
    }


    form.addEventListener('submit',(e)=>{
        e.preventDefault();
        e.stopPropagation();

        if(typeof onSubmitHandle === 'function'){
            // I do not know whether `onSubmitHandle` contains Syncronous or asyncronous function 
            // Thus I use promise to always ensure that ajax call is submited 
            Promise.resolve(onSubmitHandle(e, form, modalElem, modal)).then(()=>{
                formSubmitAjaxCallback(e);
                formEnable(form,true,true)
            }).catch((error)=>{
                if (typeof submitFailureCallback === 'function') {
                    submitFailureCallback(false, error);
                }
                formEnable(form,true,true)
            })
        } else {
            formSubmitAjaxCallback(e);
            formEnable(form,true,true)
        }
    });
}

export {
    submitFormUponModalUsingAjax,
    addAlertUpoModal,
    removeAlertsFromModal
}
