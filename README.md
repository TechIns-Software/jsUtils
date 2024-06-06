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