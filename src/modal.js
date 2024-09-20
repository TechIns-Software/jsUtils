import { submitFormAjax } from "./utils";
import { Modal } from "bootstrap";
import { clearInputErrorMessage } from "./input-error";

/**
 * Bootstraps and handles the submission of a form inside a modal, using AJAX for form submission.
 * Upon Close also handles the form cleanup
 *
 * @param {HTMLElement|string} modalElem - The modal element (or its selector) containing the form.
 * 
 * @param {function(HTMLFormElement, Object|string, Object):void} submitSuccessCallback - Callback function to execute on successful form submission.
 * - First Argument is the form Element that resides inside the modal
 * - The Second one is the Data receved from ajax
 * - The thirsd one is the Bootstrap Modal
 * 
 * @param {function(boolean, boolean, Object, XMLHttpRequest):void} submitFailureCallback - Callback function to execute on form submission failure.
 *  First argument is whether ajax has performed, second is if it’s a 400 error, third is response data, fourth is the XMLHttpRequest.
 * @param {function(XMLHttpRequest):void} [beforeSend] - Optional callback function to execute before the form is sent.
 * @param {function(Event, HTMLFormElement, HTMLElement, Object, function(Event):void):void} [onSubmitHandle] - Optional callback function to handle form submission.
 *  This function should receive event, form element, modal element, modal instance, and a callback to trigger form submission.
 * @param {function(HTMLElement, Object, HTMLFormElement):void} [onModalClose] - Optional callback to execute when the modal is closed.
 */
function submitFormUponModalUsingAjax(modalElem,submitSuccessCallback,submitFailureCallback,beforeSend,onSubmitHandle,onModalClose) {
    const modalElement = stringToDomHtml(modalElem)

    const form = modalElement.querySelector('form');
    const modal= Modal.getOrCreateInstance(modalElement);

    modalElem.addEventListener('hidden.bs.modal',(e)=>{
        form.querySelectorAll('input').forEach(input=>{clearInputErrorMessage(input)});
        form.reset();

        if(typeof onModalClose === 'function'){
            onModalClose(modalElem,modal,form);
        }
    });


    const formSubmitAjaxCallback = (e)=>{
        submitFormAjax(form,(data)=>submitSuccessCallback(form,data,modal),(jqxhr)=>{
            errorResponseHandler(jqxhr,(is400,responseJson,xhr)=>{
                if(is400) {
                    if(typeof submitFailureCallback === 'function'){submitFailureCallback(true,is400,responseJson,xhr);}
                    return;
                }
                modal.hide();
                if(typeof submitFailureCallback === 'function'){submitFailureCallback(true,is400,responseJson,xhr)}
            },form)
        },beforeSend)
    }


    form.addEventListener('submit',(e)=>{
        e.preventDefault();
        e.stopPropagation();

        if(typeof onSubmitHandle === 'function'){
            Promise.resolve(onSubmitHandle(e, form, modalElem, modal)).then(()=>{
                formSubmitAjaxCallback(e);
            }).catch((error)=>{
                if (typeof submitFailureCallback === 'function') {
                    submitFailureCallback(false, error);
                }
            })
        } else {
            formSubmitAjaxCallback(e);
        }
    });
}

export {
    submitFormUponModalUsingAjax
}
