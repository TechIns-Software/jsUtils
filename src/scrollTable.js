import $ from "jquery";
import {stringToDomHtml} from "./utils";


/**
 * An infinite scrolling table it provided infinite scrolling upon a table using the following this html markup
 * 
 * ```
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
 * ```
 * 
 * As youy can see a Div is used for Scrollwrapper and upon `data-url` it contains the url to fetch the next page.
 * Upon the url in  data-url` you should alsom place any get parametes (url query) used for the data that will be displayed upon table's tbody
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
 * - As an indication whether ajax has more data the `X-HasMore` with either true or false must be provided. True indicated that the current page retrieved is not the last one.
 * 
 */
class ScrollTable {


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

    abortRefresh(){
        if(this.currentAjax){
            this.currentAjax.abort();
        }
    }

    __observe() {
        const trigger = this.__dataContainer.querySelector(this.__triggerElement);
        if(trigger){
            this.__observer.observe(this.__dataContainer.querySelector(this.__triggerElement));
        }
    }

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
                this.populateData(data,url,hasMore)
            }.bind(this),
            error:this.scrollAjaxErrorCallback
        });
    }


    populateData(data,url,hasMore){

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

    overWriteData(data,url){

        if(!url){
            this.__scrollWrapper.removeAttribute('data-url')
        } else {
            this.__scrollWrapper.setAttribute('data-url',url)
        }

        this.__dataContainer.innerHTML = data
        this.__observe();
    }

    resetOriginalData(){
        console.log("RESET")
        this.__scrollWrapper.setAttribute('data-url',this.__initialUrl)
        this.__dataContainer.innerHTML = ""
        this.__ajaxUpdateData();
    }
}

export default ScrollTable