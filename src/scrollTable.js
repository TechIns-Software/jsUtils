import $ from "jquery";
import {stringToDomHtml} from "./utils";

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