import { submitFormAjax,stringToDomHtml,formEnable } from "./utils";
import { Modal } from "bootstrap";
import { errorResponseHandler } from "./input-error";

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
 * @class
 * @classdesc AjaxModal is a class designed to handle modal form submission using AJAX, with customizable callbacks for different stages of the form lifecycle.
 * This class provides several optional and required callbacks to handle various parts of the form lifecycle, including initialization, submission success, and failure handling.
 *
 * @example
 * // Basic Usage Example
 * const callbacks = {
 *   'submitSuccessCallback': function(form, data, modal) { ... },   // Callback when form submission is successful
 *   'ajaxFailureCallback': function(is400, responseJson, xhr) { ... }, // Callback when AJAX submission fails
 *   'beforeSend': function(xhr, next) { ... },   // Callback before the AJAX request is sent
 *   'onSubmitHandle': function(event, form, modalElem, modal, next) { ... },   // Custom form submission logic
 *   'formSubmitErrorHandleBeforeAjax': function(error, event, form, modalElem, modal) { ... }, // Handles form validation errors before AJAX
 *   'onModalClose': function(modalElem, modal, form) { ... }   // Callback when the modal is closed
 * };
 *
 * const modal = new AjaxModal("#myModal", callbacks);  // Initialize the modal with callbacks
 * modal.show();  // Show the modal
 *
 * @example
 * // Using a button
 * // Initialize a modal when a button or DOM element is clicked
 * <button role="button" onclick="showModal(this)">Open Modal</button>
 *
 * let modalHandler = null;
 *
 * // Object with callbacks as mentioned in the constructor method
 * const callbacks = {
 *     'initForm': (modalElement, buttonElement) => {
 *         // Initialization of the form when the modal is shown
 *     },
 *     'submitSuccessCallback': function(form, data, modal) { ... },
 *     'ajaxFailureCallback': function(is400, responseJson, xhr) { ... }
 * };
 *
 * function showModal(button){
 *     if(!modalHandler){
 *         modalHandler = new AjaxModal("#myModal", callbacks);
 *     }
 *     modalHandler.show(button);  // Show the modal and pass the clicked button
 * }
 *
 * @param {String|HTMLElement} modalElement - The selector or DOM element for the modal.
 * @param {Object} callbacks - Object containing callback functions for handling modal behavior. Optional.
 *
 * @callback [initForm] Optional callback to initialize the form before showing the modal.
 * @param {HTMLElement} modalElement - The modal element.
 * @param {HTMLElement} [buttonElement] - The button or DOM element that triggered the modal. This may be `undefined` if no button triggered it.
 *
 * @callback submitSuccessCallback Function executed upon successful form submission.
 * @param {HTMLFormElement} form - The form element within the modal.
 * @param {Object|string} data - The data received from the successful AJAX request.
 * @param {AjaxModal} modal - The instance of the AjaxModal class.
 *
 * @callback ajaxFailureCallback Function executed when the AJAX call fails.
 * @param {boolean} is400 - Whether the failure was a 400 error (Bad Request).
 * @param {Object} [responseJson] - The JSON object received from the response. Optional.
 * @param {XMLHttpRequest} xhr - The XMLHttpRequest object.
 * @param {Object} [unhandledInputs] - Object containing unhandled input errors. Optional.
 * @param {function(Error|boolean)} next - Callback to signal the end of failure handling.
 *
 * @callback [beforeSend] Optional callback function executed before the AJAX request is sent.
 * @param {XMLHttpRequest} jqXHR - The XHR object before the request is sent.
 * @param {Object} [settings] - AJAX request settings. Optional.
 *
 * @callback [onSubmitHandle] Optional function to handle custom form submission logic.
 * @param {Event} event - The form submission event.
 * @param {HTMLFormElement} form - The form element being submitted.
 * @param {HTMLElement} modalElement - The modal element.
 * @param {AjaxModal} modal - The AjaxModal instance.
 * @param {function(boolean|Object|Error)} next - A callback to trigger the form submission.
 *
 * @callback [formSubmitErrorHandleBeforeAjax] Optional callback executed before AJAX submission in case of form validation errors.
 * @param {Error|boolean} error - Validation error or false if no error.
 * @param {Event} event - The form submission event.
 * @param {HTMLFormElement} form - The form element.
 * @param {HTMLElement} modalElement - The modal element.
 * @param {AjaxModal} modal - The instance of the AjaxModal class.
 *
 * @callback [onModalClose] Optional callback executed when the modal is closed.
 * @param {HTMLElement} modalElement - The modal element.
 * @param {AjaxModal} modal - The instance of the AjaxModal class.
 * @param {HTMLFormElement} [form] - The form element inside the modal. Optional.
 *
 * @method show
 * @description Displays the modal. Can optionally take a trigger element (e.g., a button) that was clicked to open the modal.
 * @param {HTMLElement} [triggeredElement] - The element that triggered the modal display (e.g., a button). Optional.
 *
 * @method hide
 * @description Hides the modal and triggers the `onModalClose` callback if provided.
 *
 * @method close
 * @description Alias of hide() for compatibility with Bootstrap's modal behavior.
 */

class AjaxModal {

    /**
     * @param {Object} callbacks - Callback functions for handling modal and form behavior. For More Info look above.
     * @param {String|HTMLElement} modalElement
     */
    constructor(modalElement,callbacks) {
        this.modalElement = stringToDomHtml(modalElement);
        this.modal = null;

        this.form = this.modalElement.getElementsByTagName('form')[0];

        if(!this.form){
            throw new Error('Modal Has not a Form');
        }

        this.__init(callbacks);
    }

    /**
     * Initializes necessary callback functions.
     * @param {Object} callbacks - Callback functions for handling modal and form behavior. For More Info look above.
     * @private
     */
    __initCallbacks(callbacks){
        if(!callbacks){
            throw new Error("Callbacks not provided");
        }

        if(callbacks.initForm){
            if(typeof callbacks.initForm !== 'function'){
                throw new Error('initForm Callback is not a valid function');
            }
            this.initForm=callbacks.initForm;
        } else {
            this.initForm=()=>{};
        }

        if(!callbacks.submitSuccessCallback || typeof callbacks.submitSuccessCallback!=='function'){
            throw new Error('submitSuccessCallback is not a valid function');
        }

        this.submitSuccessCallback = callbacks.submitSuccessCallback;

        if(!callbacks.ajaxFailureCallback){
            this.ajaxFailureCallback=(is400,responseJson,xhr,unhandledInputs,next)=>{
                this.__ajaxError(is400,error)
            }
        } else {
            this.ajaxFailureCallback = callbacks.ajaxFailureCallback;
        }

        if(typeof this.ajaxFailureCallback !== 'function'){
            throw new Error('ajaxFailureCallback is not a valid function');
        }

        if(callbacks.beforeSend && typeof callbacks.beforeSend !== 'function'){
            throw new Error('beforeSendCallback is not a valid function');
        }else if(callbacks.beforeSend) {
            this.beforeSend=callbacks.beforeSend;
        } else {
            this.beforeSend=()=>{}
        }

        if(callbacks.formSubmitErrorHandleBeforeAjax && typeof callbacks.formSubmitErrorHandleBeforeAjax !== 'function'){
            throw new Error('formSubmitErrorHandleBeforeAjax is not a valid function');
        }else if(callbacks.formSubmitErrorHandleBeforeAjax ){
            this.formSubmitErrorHandleBeforeAjax=callbacks.formSubmitErrorHandleBeforeAjax;
        } else {
            this.formSubmitErrorHandleBeforeAjax=(error,event, form, modalElem, modal)=>{}
        }

        if(callbacks.onModalClose && typeof callbacks.onModalClose !== 'function'){
            throw new Error('onModalClose is not a valid function');
        }else if(callbacks.onModalClose){
            this.onModalClose=callbacks.onModalClose;
        } else {
            this.onModalClose=()=>{}
        }
    }

    /**
     * Initializes the form and sets up event listeners.
     * @param {Object} callbacks - Callback functions for form and modal behavior.
     * @private
     */
    __init(callbacks){
        this.__initCallbacks(callbacks);
        this.__initFormListeners();
    }


    /**
     * Adds event listeners to handle form submission.
     * @private
     */
    __initFormListeners() {
        this.form.addEventListener('submit', (e) => {
            e.preventDefault();
            if (typeof this.onSubmitHandle === 'function') {
                try {
                    this.onSubmitHandle(e, this.form, this.modalElem, this, (error) => this.__handle(error, e));
                } catch (error) {
                    // Upon onSubmitHandle developer may also throw an error I need to handle it as well
                    return this.__handle(error, e)
                }
            } else {
                return this.__handle(false, e)
            }
        })
    }

    /**
     * Handles form submission and errors.
     * @param {Error|boolean} error - Error object or false if no error.
     * @param {Event} event - The form submission event.
     * @private
     */
    __handle(error, event){
        if(error){
            this.formSubmitErrorHandleBeforeAjax(error,event, this.form, this.modalElem, this)
            return false;
        }

        this.__formSubmitAjaxCallback(event);
    }



    /**
     * Handles the AJAX form submission.
     * @param {Event} e - The form submission event.
     * @private
     */
    __formSubmitAjaxCallback(e){
        submitFormAjax(this.form,(data)=>{
                formEnable(this.form,true,true)
                this.submitSuccessCallback(this.form,data,this)
            },
            (jqxhr)=>{
                errorResponseHandler(jqxhr,(is400,responseJson,xhr,unhandledInputs)=>{
                    if(typeof this.ajaxFailureCallback === 'function'){
                        console.log(this.ajaxFailureCallback)
                        this.ajaxFailureCallback(is400,responseJson,xhr,unhandledInputs,(error)=>{
                            this.__ajaxError(is400,error)
                        });
                    }
                },this.form)

            }, this.__beforeSend.bind(this))
    }

    /**
     * Handles AJAX errors.
     * @param {boolean} is400 - Whether the error is a 400 status code.
     * @param {Error|boolean} error - The error object or false.
     * @private
     */
    __ajaxError(is400,error){
        if(error){
            formEnable(this.form,true,true)
            console.error(error)
            return;
        }

        if(!is400) {
            console.log("Before Hide");
            this.close();
        }
    }

    /**
     * Function that triggers the beforeSendCallbackUponAjax.
     * it disables the Form
     * @param jqXHR
     * @param settings
     * @private
     */
    __beforeSend(jqXHR,settings){
        formEnable(this.form,false)
        this.beforeSend(jqXHR,settings)
    }

    /**
     * Resets the form.
     * @private
     */
    __resetForm(){
        formEnable(this.form,true);
        this.form.reset();
    }

    /**
     * Displays The Modal
     * @param {String|HTMLElement} triggeredElement Html Element that triggers the modal Initialization (forexample upon an event).
     * It is used upon initForm callback.
     */
    show(triggeredElement){
        this.__resetForm();

        this.initForm(this.modalElement,stringToDomHtml(triggeredElement));

        this.modal = Modal.getOrCreateInstance(this.modalElement);
        this.modal.show();
    }

    /**
     * Closes The Modal
     */
    close() {
        this.onModalClose();
        this.modal.hide();
    }

    /**
     * Alias of close();
     * Used for compartibility with Bootstrap's modal
     */
    hide(){
        this.close();
    }
}


export {
    AjaxModal,
    addAlertUpoModal,
    removeAlertsFromModal
}
