import {stringToDomHtml, submitFormAjax,debounce} from "./utils";
import ScrollTable from "./scrollTable";

/**
 * A SearchForm class that handles form submissions via AJAX and appends the fetched
 * HTML data into a table. This class extends the GenericSearchForm and provides 
 * specific functionality to append data into a table's `<tbody>`.
 * 
 * For usage details, see the README.md where `@techins/jsutils/searchForm` is referenced.
 * 
 * @extends {GenericSearchForm}
 */
class SearchForm extends GenericSearchForm
{
    /**
     * Initialize a SearchForm.
     * @param {string | HTMLElement} form_element - HTML string representing the form element.
     * @param {string | HTMLElement} table_element - HTML string representing the table element.
     * @param {function} submitErrorCallback - Callback function to handle submission errors.
     */
    constructor(form_element,table_element,submitErrorCallback) {
        super(form,this.appendDataElementToTable,submitErrorCallback,false)
        this.form = stringToDomHtml(form_element)
    }

    /**
     * Append the retrieved data to the table's tbody element.
     * @param {string} data - The HTML string to be inserted into the tbody.
     */
    appendDataElementToTable(data) {
        const tbody = this.table.querySelector('tbody')
        tbody.innerHTML=data
    }
}

/**
 * A generic base class for managing search form utilities. Provides functionality
 * for form submission via AJAX, handling success, error callbacks, and optional 
 * form reset behavior.
 */
class GenericSearchForm
{
    constructor(form_element,successCallback,submitErrorCallback,clearValueOnInit){
        this.form = stringToDomHtml(form_element)
        this.prevAjax=null

        if(typeof submitErrorCallback === "function"){
            this.submitErrorCallback=submitErrorCallback.bind(this)
        } else {
            this.submitErrorCallback=()=>{}
        }

        if(typeof successCallback !== "function"){
            throw new Error("Success Search function Not Submitted")
        }

        this.successCallback = successCallback.bind(this)

        this.__init(clearValueOnInit)
    }

    __init(clearValueOnInit) {
        const inputSearchField = this.form.querySelector('.inputSearchField')

        // Upon refresh form stays with its old value.
        // We can configure to be removed
        if(clearValueOnInit){
            inputSearchField.value="";
        }

        this.manualSearch=()=>{
            this.__handleSearch(inputSearchField)
        }

        this.reset=()=>{
            this.__reset(inputSearchField)
        }

        this.form.addEventListener('submit',(e)=>{
            e.preventDefault();
            e.stopPropagation();
            this.__handleSearch(inputSearchField)
        })

        inputSearchField.addEventListener('change',debounce(()=>{
            this.__handleSearch(inputSearchField)
        }))

        this.form.querySelector(".cleanSearch").addEventListener('click',debounce(()=>{
           this.__reset(inputSearchField);
        }))
    }

    __reset(inputSearchField) {
        inputSearchField.value=""
        this.handleSearch()
    }

    abortSearch(){
        this.prevAjax.abortSearch();
    }

    /**
     * Handle the search action, submit the form via AJAX, and manage the results.
     */
    __handleSearch(inputSearchField){
        this.prevAjax=submitFormAjax(this.form,this.successCallback,this.submitErrorCallback,null,this.prevAjax)
    }
}

/**
 * SearchForm Used to search data Upon a ScrollTable
 */
class ScrollTableSearchForm extends GenericSearchForm
{
    constructor(form,scrollWrapper,clearFormValueOnInit,searchErrorCallback,scrollAjaxErrorCallback){
        super(form,(data,textStatus, jqXHR)=>{
            const url = jqXHR.getResponseHeader('X-NextUrl');
            console.log("SEARCH",url);
            this.scrollTable.overWriteData(data,url)
        },searchErrorCallback,clearFormValueOnInit);
        this.scrollTable = new ScrollTable(scrollWrapper,scrollAjaxErrorCallback)
    }

    handleSearch(inputSearchField) {
        this.scrollTable.abortRefresh();

        const value = inputSearchField.value
        if(value===''){
            this.abortSearch()
            return this.__reset(inputSearchField)
        }

        super.handleSearch();
    }

    __reset(inputSearchField){
        inputSearchField.value=""
        this.scrollTable.resetOriginalData();
    }
}

export default SearchForm
export {
    GenericSearchForm
}
