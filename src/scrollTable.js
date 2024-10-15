import $ from "jquery";
import {stringToDomHtml} from "./utils";

/**
 * Class representing an infinite scrolling table.
 * This class enables infinite scrolling on a table by appending more data as the user scrolls down. 
 * The HTML structure expected for this to work is as follows:
 * 
 * ```
 * <div id="scroll" data-url="/someUrl?page=1&limit=10">
 *   <table>
 *     <thead>
 *       <!-- Table headers -->
 *     </thead>
 *     <tbody>
 *       <!-- Data rows -->
 *     </tbody>
 *   </table>
 * </div>
 * ```
 * 
 * - The `data-url` attribute of the `div` contains the API URL used to fetch the next page.
 * - The URL should include query parameters (e.g., pagination or filtering).
 * - The server should respond with `application/html`, and the response body will be appended to the `tbody` of the table.
 * - The server must also include the following headers:
 *   - `X-NextUrl`: URL for the next page of data.
 *   - `X-HasMore`: A boolean header (`true`/`false`) indicating whether there is more data to load.
 *
 * @example
 * 
 * If the html mentioned above is used then you can Initialize the class as:
 * ```
 *  const scrollTable = new ScrollTable("scroll")
 * ```
 * 
 */
class ScrollTable {


    /**
     * Initializes the ScrollTable instance.
     * @param {string|HTMLElement} scrollWrapper - The div element that contains the scroll wrapper, or its selector.
     * @param {Function} [scrollAjaxErrorCallback] - Callback function triggered if an AJAX error occurs.
     */
    constructor(scrollWrapper,scrollAjaxErrorCallback) {

        this.__scrollWrapper = stringToDomHtml(scrollWrapper)
        this.__dataContainer = this.__scrollWrapper.querySelector("tbody");
        this.__triggerElement = 'tr:last-child';

        this.__initialUrl = this.__scrollWrapper.getAttribute("data-url")
        this.currentAjax = null;

        if(typeof scrollAjaxErrorCallback === "function"){
            this.scrollAjaxErrorCallback=scrollAjaxErrorCallback;
        } else {
            this.scrollAjaxErrorCallback=()=>{}
        }

        this.__observer =new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                console.log(entry)
                if (entry.isIntersecting) {
                    this.__ajaxUpdateData(); // Your function to append more data
                }
            });
        });

        this.__observe()
    }

    /**
     * Aborts the current AJAX request if one is active.
     * @public
     */
    abortRefresh(){
        if(this.currentAjax){
            this.currentAjax.abort();
        }
    }

    /**
     * Observes the last row of the table (`tr:last-child`) and triggers data loading when it comes into view.
     * @private
     */
    __observe() {
        const trigger = this.__dataContainer.querySelector(this.__triggerElement);
        if(trigger){
            this.__observer.observe(this.__dataContainer.querySelector(this.__triggerElement));
        }
    }


    /**
     * Performs an AJAX call to fetch data from the URL specified in the `data-url` attribute.
     * On success, appends the fetched data to the table's `tbody` and updates the `data-url` for the next page.
     * @private
     */
    __ajaxUpdateData(){
        console.log("Here")
        const url =this.__scrollWrapper.getAttribute("data-url")
        console.log(url);
        if(!url){
            return;
        }

        this.currentAjax = $.ajax({
            url: url,
            type: 'GET',
            success: function(data, textStatus, jqXHR){
                const url = jqXHR.getResponseHeader('X-NextUrl');
                const hasMore = jqXHR.getResponseHeader('X-HasMore');
                this.__populateData(data,url,hasMore)
            }.bind(this),
            error:this.scrollAjaxErrorCallback
        });
    }


    /**
     * Populates the table with new data and sets up the next page URL if available.
     * @param {string} data - The HTML content for the new rows to be appended.
     * @param {string} url - The URL for the next page.
     * @param {boolean} hasMore - Whether there is more data to load.
     * @private
     */
    __populateData(data,url,hasMore){
        if(hasMore){
            if(!url){
                throw new Error("Url has not Been provided")
            }
            this.__scrollWrapper.setAttribute('data-url',url)
        } else {
            this.__scrollWrapper.removeAttribute('data-url');
        }

        this.__dataContainer.innerHTML = this.__dataContainer.innerHTML+data;
        this.__observe();
    }

    /**
     * Overwrites the current table data with new content from an external source.
     * @param {string} data - The HTML content to replace the current table rows.
     * @param {string} [url] - The URL for the next page, if any.
     * @public
     */
    overWriteData(data,url){

        if(!url){
            this.__scrollWrapper.removeAttribute('data-url')
        } else {
            this.__scrollWrapper.setAttribute('data-url',url)
        }

        this.__dataContainer.innerHTML = data
        this.__observe();
    }

    /**
     * Resets the table to its initial state by fetching the original data from the URL set at the first itme in the scroll wrapper.
     * @public
     */
    resetOriginalData(){
        this.__scrollWrapper.setAttribute('data-url',this.__initialUrl)
        this.__dataContainer.innerHTML = ""
        this.__ajaxUpdateData();
    }
}

export default ScrollTable