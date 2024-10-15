import {stringToDomHtml, submitFormAjax,debounce} from "./utils";
import ScrollTable from "./scrollTable";

/**
 * A generic base class for managing search form utilities. Provides functionality
 * for form submission via AJAX, handling success, error callbacks, and form reset behavior.
 * 
 * It is used to submit this form:
 * 
 * ```
 *   <form method="get" action="/someurl">   
 *     <input  name="searchval" class="inputSearchField" >
 *     <button class="cleanSearch" type="button">Clean search Input</button>
 *     <button type="submit">Search</button>
 *  </form>
 * ```
 * 
 * As you can see you need to provide the class inputSearchField upon the input field that is used for searching
 * 
 * @callback SuccessCallback
 * @param {any} data - The response data from the AJAX call.
 * @param {string} textStatus - The status of the AJAX request.
 * @param {JQuery.jqXHR} jqXHR - The jqXHR object from the AJAX request.
 * 
 * @callback ErrorCallback
 * @param {JQuery.jqXHR} jqXHR - The jqXHR object from the AJAX request.
 * @param {string} textStatus - The status of the AJAX request.
 * @param {string} errorThrown - The error thrown by the AJAX request.
 * 
 * @method manualSearch
 * @description Trigger search manually if needed (e.g., from external code).
 * 
 * @method reset
 * @description Reset the search form and retrieve a fresh set of data without using the provided search term data.
 * 
 * @method abortSearch
 * @description Abort the ongoing AJAX request, if any, to avoid unnecessary server load.
 * 
 */
class GenericSearchForm
{
    /**
     * Initialize a GenericSearchForm instance.
     * 
     * @param {string | HTMLElement} form_element - The form element or its HTML string.
     * @param {Function} successCallback - Callback function to be executed when the AJAX form submission is successful.
     * @param {Function} [submitErrorCallback] - Optional callback function to be executed when the AJAX form submission fails.
     * @param {boolean} [clearValueOnInit=false] - Optional flag to clear the search input value when the form is initialized.
    * 
     * @throws {Error} If no successCallback function is provided.
     */
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

    /**
     * Reset the search input field and trigger the search with an empty value.
     * 
     * @param {HTMLElement} inputSearchField - The input field to reset.
     * @private
     */
    __reset(inputSearchField) {
        inputSearchField.value=""
        this.__handleSearch()
    }

    /**
     * Abort the ongoing AJAX search request, if any.
     * @public
     */
    abortSearch(){
        this.prevAjax.abortSearch();
    }

    /**
     * Handle the search action, submit the form via AJAX, and process the results.
     * 
     * @param {HTMLElement} inputSearchField - The input field being searched.
     * @private
     */
    __handleSearch(inputSearchField){
        this.prevAjax=submitFormAjax(this.form,this.successCallback,this.submitErrorCallback,null,this.prevAjax)
    }
}

/**
 * A SearchForm class that handles form submissions via AJAX and appends the fetched
 * HTML data into a table. This class extends the GenericSearchForm and provides 
 * specific functionality to append data into a table's `<tbody>`.
 * 
 * In order for this to work you need to create this form that `GenericSearchForm` requires
 * 
 * ```
 *   <form id="searchform" method="get" action="/someurl">   
 *     <input  name="searchval" class="inputSearchField" >
 *     <button class="cleanSearch" type="button">Clean search Input</button>
 *     <button type="submit">Search</button>
 *  </form>
 * ```
 * 
 * Also provide a table in which data will be displayed upon:
 * 
 *```
 *   <table id="mytable">
 *    <thead>
 *       <!-- headers according to your needs -->
 *    </thead>
 *    <tbody>
 *       <!-- Data Displayed here -->
 *    </tbody>
 *   </table>
 * ```
 * 
 * Also you can wrap the table into a div and also work as well as long as the div contains a single table:
 *
 * ```
 * <div id="mytable"> 
 *   <table>
 *    <thead>
 *       <!-- headers according to your needs -->
 *    </thead>
 *    <tbody>
 *       <!-- Data Displayed here -->
 *    </tbody>
 *   </table>
 * </div>
 * ```
 * 
 * The data returned upon Ajax call should be returned as `application/html` containing the content that will be placed or replaced upon tbody:
 * 
 * ```
 * <tr>
 *  <td>val1</td>
 *  <td>val2</td>
 *  <td>val3</td>
 * </tr>
 * ```
 * 
 * @example
 * Using the html mentioned above do
 * 
 * ```
 * const searchForm = new SearchForm("searchform","mytable")
 * ```
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
        super(form,this.__appendDataElementToTable,submitErrorCallback,false)
        this.form = stringToDomHtml(form_element)
        this.table = table_element;
    }

    /**
     * Append the retrieved data to the table's tbody element.
     * @param {string} data - The HTML string to be inserted into the tbody.
     * @private
     */
    __appendDataElementToTable(data) {
        const tbody = this.table.querySelector('tbody')
        tbody.innerHTML=data
    }
}

/**
 * 
 * A class for handling search data displayed upon a scrollable table (a table that using pagination via Infinite Scrolling) and submitting query via AJAX.
 * This class extends GenericSearchForm and integrates with ScrollTable for handling paginated data via infinite scrolling.
 * 
 * 
 * It uses this form for searching as GenericSearchForm needs so:
 * 
 * ```
 *   <form id="seachForm" method="get" action="/someurl">   
 *     <input  name="searchval" class="inputSearchField" >
 *     <button class="cleanSearch" type="button">Clean search Input</button>
 *     <button type="submit">Search</button>
 *  </form>
 * ```
 * 
 * The the table in order to work must be wrapped into a scrollContainer
 * 
 * <div id="scroll" data-url="/someUrl?page=1&limit=10">
 * 
 *   <table>
 *    <thead>
 *       <!-- headers according to your needs -->
 *    </thead>
 *    <tbody>
 *       <!-- Data Diplayed here -->
 *    </tbody>
 *   </table>
 * 
 * </div>
 * 
 * As youy can see a Div is used for Scrollwrapper and upon `data-url` it contains the url to fetch the next page.
 * Upon the url in  data-url` you should alsom place any get parametes (url query) used for the data that will be displayed upon table's tbody
 * 
 * 
 * The data returned upon an Ajax call should be returned as `application/html`
 * containing the content that will be placed or replaced within the tbody:
 * 
 * ```
 * <tr>
 *  <td>val1</td>
 *  <td>val2</td>
 *  <td>val3</td>
 * </tr>
 * ```
 * 
 * Also the server must include the following headers:
 * - For the next page URL in the `X-NextUrl` header.
 * - As an indication whether ajax has more data the `X-HasMore` with either true or false must be provided.
 * 
 * @example
 * For the HTMl mentioned above do the following:
 * ```
 * const searchForm = ScrollTableSearchForm("seachForm","scroll")
 * ```
 * And both search functionality and scroll functionality is initialized.
 * 
 * @extends {GenericSearchForm}
 */
class ScrollTableSearchForm extends GenericSearchForm
{
    /**
     * Initialize a ScrollTableSearchForm instance.
     * 
     * @param {string | HTMLElement} form - The form element or its HTML string.
     * @param {string | HTMLElement} scrollWrapper - The scrollable wrapper for the table.
     * @param {boolean} clearFormValueOnInit - Flag indicating whether to clear the form input on initialization.
     * @param {Function} [searchErrorCallback] - Callback function to handle search errors.
     * @param {Function} [scrollAjaxErrorCallback] - Callback function to handle errors during scroll-based data retrieval.
     */
    constructor(form,scrollWrapper,clearFormValueOnInit,searchErrorCallback,scrollAjaxErrorCallback){
        super(form,(data,textStatus, jqXHR)=>{
            const url = jqXHR.getResponseHeader('X-NextUrl');
            console.log("SEARCH",url);
            this.scrollTable.overWriteData(data,url)
        },searchErrorCallback,clearFormValueOnInit);
        this.scrollTable = new ScrollTable(scrollWrapper,scrollAjaxErrorCallback)
    }

    /**
     * Handle the search action and update the scrollable table with the retrieved data.
     * @param {HTMLElement} inputSearchField - The input field used for the search query.
     * @private
     */
    __handleSearch(inputSearchField) {
        this.scrollTable.abortRefresh();

        const value = inputSearchField.value
        if(value===''){
            this.abortSearch()
            return this.__reset(inputSearchField)
        }

        super.__handleSearch();
    }

    /**
     * Reset the search input field and restore the original scrollable data.
     * 
     * @param {HTMLElement} inputSearchField - The input field to reset.
     * @private
     */
    __reset(inputSearchField){
        inputSearchField.value=""
        this.scrollTable.resetOriginalData();
    }
}

export default SearchForm
export {
    GenericSearchForm,
    ScrollTableSearchForm
}
