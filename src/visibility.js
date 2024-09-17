import { stringToDomHtml } from "./utils";

/**
 * Check whether element is visible.
 *
 * Is it reccomended to use this one instead of `checkVisibility` one,
 * because the latter one is not supported on all browsers.
 *
 * @param {String | HTMLElement} element The element to check whether is visible or not
 * @return {boolean}
 */
function isVisible(element) {
    const style = window.getComputedStyle(stringToDomHtml(element));
    return style.display !== 'none' && style.visibility !== 'hidden' && style.opacity !== '0';
}

/**
 * Toggles the visibility between two HTML elements.
 *
 * This function ensures that only one of the two provided elements is visible at any time.
 * If both elements are initially in the same visibility state (either both visible or both hidden),
 * the function throws an error.
 *
 * @param {string|HTMLElement} elem1 - A string representing the first HTML element or its selector.
 * @param {string|HTMLElement} elem2 - A string representing the second HTML element or its selector.
 *
 * @throws {Error} If both elements have the same visibility state.
 */
function toggleVisibilityBetween2Elements(elem1,elem2){
    // Convert string selectors to DOM elements
    elem1=stringToDomHtml(elem1)
    elem2=stringToDomHtml(elem2)

    // Check visibility of both elements using the custom isVisible function
    const elem1IsVisible = isVisible(elem1);
    const elem2IsVisible = isVisible(elem2);

    // Ensure only one element is visible at any given time
    if(elem1IsVisible == elem2IsVisible){
        throw "Both elements are visible only one should be visible"
    }

    // Swap visibility states
    if (elem1IsVisible) {
        elem1.style.display = 'none';
        elem2.style.display = '';
    } else {
        elem1.style.display = '';
        elem2.style.display = 'none';
    }
}

/**
 * Toggles the visibility of an element based on the checked state of a checkbox or radio input.
 * Calls the appropriate callback functions when the element is shown or hidden.
 *
 * @param {String|HTMLElement} radioCheckboxInput Checkbox or radio input element (or its selector).
 * @param {String|HTMLElement} element The element to show or hide (or its selector).
 * @param {Function} [hideCallback] Function to execute when the element is hidden.
 * @param {Function} [showCallback] Function to execute when the element is shown.
 */
function toggleElementVisibility(radioCheckboxInput, element, hideCallback, showCallback) {
    const inputElement = stringToDomHtml(radioCheckboxInput);
    const targetElement = stringToDomHtml(element);

    if (!inputElement || !targetElement) return;

    if (inputElement.checked) {
        targetElement.hidden = false;
        if (typeof showCallback === "function") {
            showCallback(targetElement);
        }
    } else {
        targetElement.hidden = true;
        if (typeof hideCallback === "function") {
            hideCallback(targetElement);
        }
    }
}

/**
 * Resets the value of an input element or all input elements within a container.
 *
 * @param {String|HTMLElement} element A single input element or a container with input elements.
 */
function resetInputElement(element) {
    const targetElement = stringToDomHtml(element);

    if (!targetElement) return;

    if (targetElement instanceof HTMLInputElement) {
        resetElement(targetElement);
    } else {
        targetElement.querySelectorAll('input').forEach((input) => {
            resetElement(input);
        });
    }
}

/**
 * Reset the Input element into default values.
 * @param {HTMLInputElement|HTMLTextAreaElement|String} el
 */
function resetElement(el){
    const element = stringToDomHtml(el)
    if (element instanceof HTMLInputElement) {
        if (element.type === 'checkbox' || element.type === 'radio') {
            element.checked = false;
        } else {
            element.value = "";
        }
    } else if (element instanceof HTMLTextAreaElement) {
        element.value = "";
    }
}


export {
    isVisible,
    toggleVisibilityBetween2Elements,
    toggleElementVisibility,
    resetInputElement,
    resetElement
}