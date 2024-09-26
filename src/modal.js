import { submitFormAjax,stringToDomHtml,formEnable } from "./utils";
import { Modal } from "bootstrap";
import { clearInputErrorMessage,errorResponseHandler } from "./input-error";

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
    submitFormUponModalUsingAjax
}
