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

A Search Form Bootstrapper. This is a js that bootstraps the event listeners for this specific form:

```html
  <form method="get" action="/someurl">   
       <input  name="searchval" class="inputSearchField" >
       <button class="cleanSearch" type="button">Clean search Input</button>
       <button type="submit">Search</button>
 </form>
```

In the form the input that performs the search should have the class `searchval`.
The reset button/form clena should have the class `cleanSearch`. 

The result is appended into a table's tbody.
Also feel free to style the form using a css framework such as bootstrap (or even icons):

```html
 
 <form id="{{$id}}" method="get" class="mt-2 mb-2" action="{{route($action)}}">
   <div class="input-group mb-3">
       <input  name="name" class="form-control inputSearchField" ">
       <button class="cleanSearch btn btn-outline-secondary" type="button"><i class="fa fa-x"></i></button>
       <button class="btn btn-secondary" type="submit"><i class="fa fa-search"></i></button>
   </div>
</form>
```