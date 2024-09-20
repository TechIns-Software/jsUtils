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
