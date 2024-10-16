# v5.0.1 - 2024-10-16

Remove console.log used for debugging.

# v5.0.0 - 2024-10-15

## Added
1. New Class for making an Infinite Scrolling table
2. A GenericSearchFormClass that all searchform Utilities are based upon
3. A new ScrollTableSearchForm that utilized Both classes mentioned Above

## Changed
1. SearchForm uses GenericSearchForm whilst maintaining old fuynctionality


# v4.0.1 - 2024-10-07
Improved Documentation


# v4.0.0 - 2024-10-04
## Changed
 - At `modal.js` I removed the `formModalHandlingFunction` and placed `AjaxModal` instead 


# v3.2.1 - 2024-10-02

## Fixed
 1. Upon modal.js do not reset the for If a non-ajax error has occured.

# v3.2.0 - 2024-10-02

## Added

### Enhanced Error Handling:
  1. Introduced ajaxFailureCallback in submitFormUponModalUsingAjax to handle AJAX failure more explicitly and modularly.
  2. Added formSubmitErrorHandleBeforeAjax parameter to provide custom error handling before making the AJAX call.
  3. Improved fallback mechanisms for formSubmitErrorHandleBeforeAjax to ensure graceful error handling if not defined by the developer.
  4. Implemented __handle to centralize submission and error handling logic.

## Changed

### Refactored submitFormUponModalUsingAjax:
 1. Simplified error handling by replacing promise-based flow with callback-based flow for easier usage and customization.
 2. The onSubmitHandle callback now expects an error argument to handle both synchronous and asynchronous code execution seamlessly.
 3. Removed Promise.resolve structure to reduce complexity and increase control over submission handling.
 4. Updated formEnable Function:
    1. Now checks for buttons outside the form by using the form's id attribute, supporting more flexible form structures.
    2. Improved error message when the submit button is not found.

# v3.1.1

## Fixed
  1. Backdrop Cleanup: Addressed an issue where the modal backdrop was not always removed properly after modal closure.
## Changed:
 1. Remove Debug console log from resetFormFeedback

# v3.1.0
New feature functions to display and remove alerts upon modal.

# v3.0.3
Place unhandled inputs upon errorResponseHandler.

# v3.0.2
Add missing errorResponseHandler method call upon modal.js

# v3.0.1
Add missing method call upon modal.js

# v3.0.0
Add Form Modal Submission method upon modal.js

# v2.3.1
Import missinf function call in input-error.js

# v2.3.0
Improved errorResponseHandler. This function now acepts an optionale Third argument with the parent element to look for inputs

# v2.2.1
1. Fix typo upon release-npm.yml
2. Improve function prependHtmlRowIntoATable. 

Upon Improvement in prependHtmlRowIntoATable include the following:

1. Check whether table is a table ot a tbody
2. Conditional detecting to a tbody
3. Clone nodes that are appended.

# v2.2.0
Add following functions:

* `toggleElementVisibility` that makes an element visible or not depending if checkbox or radio is checked
* `resetInputElement` That resets the value of an input element if element is not an input one it scans for ant input element in it:
* `resetElement` Directly reset the value of an in put element

# v2.1.0
Add function `errorResponseHandler` upon input-error.js

# v2.0.1
Fix package.json exports 

# v2.0.0
1. Utility for bootstrapping the event handlers upon a search form
2. Function to prepend a row upon a table's tbody
3. Remove `Contributing.md`

# v1.3.9
Do not use husky for releases but a manual script instead.

# v1.3.7
Improved pre-push hook that also pushes commited files.

# v1.3.1
Add error callback for 422 htt status upon utils.js at function  submitFormAjax.

# v1.3.0
Create Changelog
Add function boolInputUponCheckboxCheckedStatus at utils.js

Improve documentation.

# v1.2.0
Url Validation
Submit Checkbox via ajax. Also do the same of an input element's value as well.

# v1.1.0
Insertion of Visibility Utitilites at visibility.js

# v1.0.3
Add exports to package.json
Add documentation

# v1.0.2
Initial creation and deployment of the library
Creation of:
    - clipboard.js
    - url.js
    - utils.js
    - input-error.js
Old Export types
