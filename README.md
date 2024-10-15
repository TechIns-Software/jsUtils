# JS Utility functions
Miscelanous utility functions used upon our projects. Read comments upon each js located in `src` in order to get each functionality.

## Requirements
Library uses Bootstrap 5.3 and Jquery 3.7 and is intended for frontend projects using these libraries.

## Install the package in your project

```
npm i --save @techins/jsutils
```

## Use it

Just import any nerssesary file via doing:

```
import {*} from "@techins/jsutils/utils";
import {*} from "@techins/jsutils/clipboard";
import {*} from "@techins/jsutils/url";
import {*} from "@techins/jsutils/input-error";
import {*} from "@techins/jsutils/visibility";
```

You can speficy each specific function for a specific module. Each module is a seperate file in `./src` folder of this current repository where you can consult it for more info about it. The library has been tested using [vite](https://vitejs.dev/).

# Utility Modules

## @techins/jsutils/utils

Miscelanout utilities

## @techins/jsutils/clipboard

Clipboard managed utilities

## @techins/jsutils/url

Utilities for browser url management

## @techins/jsutils/input-error

Utilities for managing the bootstrap's input error (Message shown uindernetath input)


## @techins/jsutils/visibility

Utilities for managing the element's visibility upon DOM


## @techins/jsutils/searchForm

Variosu search form Implementations look into `./src/searchForm.js` that each class is throughfully documented with usecase examples.

## @techins/jsutils/modal

This file contains a single function named `submitFormUponModalUsingAjax` that one bootstraps the submission of a form that resides inside a modal for example:

```

<button role="button" onclick="showmodal(this)">Show Modal</button>

<div class="modal fade" id="someId" tabindex="-1" aria-labelledby="myModal" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h1 class="modal-title fs-5">Modal With a form</h1>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <form method="POST" action="#">
                <div class="modal-body">
                    <div class="mb-3">
                        <label for="name" class="col-form-label">Name:</label>
                        <input type="text" class="form-control" name="name" id="name" required>
                    </div>
                    <!--- Extra Inputs here -->
                </div>
                <div class="modal-footer">
                    <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                    <button type="submit" class="btn btn-success">Save</button>
                </div>
            </form>
        </div>
    </div>
</div>
```

```
import {submitFormUponModalUsingAjax} from "@techins/jsutils/modal"


const callbacks = {
  'submitSuccessCallback':(form,data,modal)=>{
      // Upon Success DO stuff
   },
   'ajaxFailureCallback':(ajaxCalled,is400,responseJson,xhr)=>{
        if(ajaxCalled && is400){
        // The form has been submitted upon server and error 400 is retuend
        }

        if(ajaxCalled){
        // The form has been submitted upon server and error is returned but not witth 400 Http Status
        }

        // responseJson is the ajax Response
    }
}

let modal=null

function showmodal(button){
    if(!modal){
        modal = new AjaxModal("#someId", callbacks);
    }

    modal.show(button)
}

```

Regarding the callbacks and full arghuments look upon src/modal.js in this project.

## @techins/jsutils/scrollTable

An Infinite Scrolling table. More info at `src/scrollTable.js` file in this project.
