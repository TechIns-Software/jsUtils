import { submitFormAjax,stringToDomHtml,formEnable,debounce } from "./utils";
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
 * 
 * @example
 * 
 * const callbacks = {
 *   'submitSuccessCallback': function(form, data, modal) { ... },
 *   'ajaxFailureCallback': function(is400, responseJson, xhr) { ... },
 *   'beforeSend': function(xhr, next) { ... },
 *   'onSubmitHandle': function(event, form, modalElem, modal, next) { ... },
 *   'formSubmitErrorHandleBeforeAjax': function(error, event, form, modalElem, modal) { ... },
 *   'onModalClose': function(modalElem, modal, form) { ... }
 * };
 * 
 * const modal = new AjaxModal("#myModal",callbacks)
 * modal.show();
 * 
 * // In case you want to dismiss it:
 * modal.hide();
 * 
 */
class AjaxModal {

    /**
     * Initialize an Ajax Model Element
     * Used to handle the form inside a Modal and pace the Ajax Call triggers Upon Form Submit
     * @param {HTMLElement|string} modalElem - The modal element or a selector string to locate the modal that contains the form.
     * @param {Object} callbacks - A set of nessesasry and optional callback functions for handling different stages of the form submission and initialization.
     *  
     * - {function(HtmlElement):void} initForm - Initialize the form before showing the modal.
     * 
     * - {function(HTMLFormElement, Object|string, AjaxModal):void} submitSuccessCallback - Function executed upon successful form submission.
     *   - First argument: the form element inside the modal.
     *   - Second argument: the data received from the AJAX request.
     *   - Third argument: The AjaxModalInstance.
     * 
     * 
     * - {function(boolean, Object, XMLHttpRequest,function(error)):void} ajaxFailureCallback - Function executed when the ajax call upon form fails.
     *   - First argument: whether the AJAX call was made.
     *   - Second argument: whether the failure was a 400 (Bad Request) error.
     *   - Third argument: the response data, which should contain at least a `msg` property with an error message.
     *   - Fourth argument: the XMLHttpRequest object.
     * 
     * - {function(jqXHR, PlainObject):void):void} [beforeSend] - Optional callback function that runs before the form is submitted via AJAX. 
     *   It actualy is the beforeSend used internally upon ajax submission.
     *   
     * - {function(Event, HTMLFormElement, HTMLElement, AjaxModal, function(bool|Object|Error):void):void} [onSubmitHandle] - Optional function to handle custom form submission logic.
     *   - First argument: the form submission event.
     *   - Second argument: the form element.
     *   - Third argument: the modal element.
     *   - Fourth argument: the Bootstrap modal instance.
     *   - Fifth argument: a callback to trigger the actual form submission (with optional error handling).
     * 
     * - {function():void} [onModalClose] - Optional function executed when the modal is closed.
     * 
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
     * @param {Object} callbacks - Callback functions for handling modal and form behavior.
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
     */
    show(){
        this.__resetForm();
        this.initForm(this.modalElement);

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
