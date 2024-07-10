import {stringToDomHtml, submitFormAjax,debounce} from "./utils";

/**
 * Class representing a search form that can be dynamically updated and handles AJAX submissions.
 * 
 * For usage read README.md where `@techins/jsutils/searchForm` is mentioned
 */
class SearchForm
{
    /**
     * Initialize a SearchForm.
     * @param {string | HTMLElement} form_element - HTML string representing the form element.
     * @param {string | HTMLElement} table_element - HTML string representing the table element.
     * @param {function} submitErrorCallback - Callback function to handle submission errors.
     */
    constructor(form_element,table_element,submitErrorCallback) {
        this.form = stringToDomHtml(form_element)
        this.table = stringToDomHtml(table_element)
        console.log(this.table)
        this.prevAjax=null
        this.submitErrorCallback=submitErrorCallback

        this.appendDataElementToTable = this.appendDataElementToTable.bind(this);
        this.handleSearch = this.handleSearch.bind(this);

        this.form.addEventListener('submit',(e)=>{
            e.preventDefault();
            e.stopPropagation();
            this.handleSearch()
        })

        const inputSearchField = this.form.querySelector('.inputSearchField')
        inputSearchField.addEventListener('change',debounce(()=>{
            this.handleSearch()
        }))

        this.form.querySelector(".cleanSearch").addEventListener('click',debounce(()=>{
            inputSearchField.value=""
            this.handleSearch()
        }))
    }

    /**
     * Append the retrieved data to the table's tbody element.
     * @param {string} data - The HTML string to be inserted into the tbody.
     */
    appendDataElementToTable(data) {
        const tbody = this.table.querySelector('tbody')
        tbody.innerHTML=data
    }

    /**
     * Handle the search action, submit the form via AJAX, and manage the results.
     */
    handleSearch(){
        this.prevAjax=submitFormAjax(this.form,this.appendDataElementToTable,this.submitErrorCallback,null,this.prevAjax)
    }

}

export default SearchForm
