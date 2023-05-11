//import Movie from "../m/Movie.mjs";

function isNonEmptyString(x) {
  return typeof(x) === "string" && x.trim() !== "";
}

/**
   * Create a DOM option element
   * 
   * @param {string} val
   * @param {string} txt 
   * @param {string} classValues [optional]
   * 
   * @return {object}
   */
function createOption( val, txt, classValues) {
  var el = document.createElement("option");
  el.value = val;
  el.text = txt || val;
  if (classValues) el.className = classValues;
  return el;
}

/**
 * Fill a select element with option elements created from a 
 * map of objects 
 *
 * @param {object} selectEl  A select(ion list) element
 * @param {object|array} selectionRange  A map of objects or an array list
 * @param {bool} hasDefOpt Look if it has a default value, 
 *     else create an empty (---) option
 * @param {object} optPar [optional]  An optional parameter record including
 *     optPar.displayProp and optPar.selection
 */
function fillSelectWithOptions(selectEl, selectionRange, hasDefOpt, optPar ) {
  // create option elements from object property values
  const options = Array.isArray( selectionRange) ? selectionRange :
  Object.keys( selectionRange);
  var initValue = 0;
  // delete old contents
  selectEl.innerHTML = "";
  if (!hasDefOpt) {
    initValue = 1;
    let initOptionEl = createOption( 0, "---");
    initOptionEl.selected = true;
    selectEl.add( initOptionEl);
  }
  for (let i=initValue; i < options.length + initValue; i++) {
    let optionEl=null;
    if (Array.isArray( selectionRange)) {
      optionEl = createOption( i+1, options[i-initValue]);
      if (selectEl.multiple && optPar && optPar.selection && 
          optPar.selection.includes(i+1) && hasDefOpt) {
        // flag the option element with this value as selected
        optionEl.selected = true;
      }      
    } else {
      const key = options[i-initValue];
      const obj = selectionRange[key];
      if (optPar && optPar.displayProp) {
        optionEl = createOption( key, obj[optPar.displayProp]);
      } else optionEl = createOption( key);
      // if invoked with a selection argument, flag the selected options
      if (selectEl.multiple && optPar && optPar.selection && 
          optPar.selection[key] && hasDefOpt) {
        // flag the option element with this value as selected
        optionEl.selected = true;
      }      
    }
    selectEl.add( optionEl);
  }
}

function cloneObject(movie) {
  return JSON.parse(JSON.stringify(movie));
}

function isIntegerOrIntegerString(x) {
  return typeof(x) === "number" && x.toString().search(/^-?[0-9]+$/) == 0 ||
      typeof(x) === "string" && x.search(/^-?[0-9]+$/) == 0;
}

/**
  * Create a choice control (radio button or checkbox) element
  * 
  * @param {string} t  The type of choice control ("radio" or "checkbox")
  * @param {string} n  The name of the choice control input element
  * @param {string} v  The value of the choice control input element
  * @param {string} lbl  The label text of the choice control
  * @return {object}
  */
function createLabeledChoiceControl(t,n,v,lbl) {
  var ccEl = document.createElement("input"),
      lblEl = document.createElement("label");
  ccEl.type = t;
  ccEl.name = n;
  ccEl.value = v;
  lblEl.appendChild( ccEl);
  lblEl.appendChild( document.createTextNode( lbl));
  return lblEl;
}

/**
 * Create a choice widget in a given fieldset element.
 * A choice element is either an HTML radio button or an HTML checkbox.
 * @method 
 */
function createChoiceWidget(containerEl, fld, values, 
    choiceWidgetType, choiceItems, isMandatory) {
  const choiceControls = containerEl.querySelectorAll("label");
  // remove old content
  for (let j=0; j < choiceControls.length; j++) {
    containerEl.removeChild( choiceControls[j]);
  }
  if (!containerEl.hasAttribute("data-bind")) {
    containerEl.setAttribute("data-bind", fld);
  }
// for a mandatory radio button group initialze to first value
  if (choiceWidgetType === "radio" && isMandatory && values.length === 0) {
  values[0] = 1;
  }
  if (values.length >= 1) {
    if (choiceWidgetType === "radio") {
      containerEl.setAttribute("data-value", values[0]);      
    } else {  // checkboxes
      containerEl.setAttribute("data-value", "["+ values.join() +"]");            
    }
  }
  for (let j=0; j < choiceItems.length; j++) {
    // button values = 1..n
    const el = createLabeledChoiceControl( choiceWidgetType, fld,
        j+1, choiceItems[j]);
    // mark the radio button or checkbox as selected/checked
    if (values.includes(j+1)) el.firstElementChild.checked = true;
    containerEl.appendChild( el);
    el.firstElementChild.addEventListener("click", function (e) {
      const btnEl = e.target;
      if (choiceWidgetType === "radio") {
        if (containerEl.getAttribute("data-value") !== btnEl.value) {
          containerEl.setAttribute("data-value", btnEl.value);
        } else if (!isMandatory) {
          // turn off radio button
          btnEl.checked = false;
          containerEl.setAttribute("data-value", "");
        }
      } else {  // checkbox
        let values = JSON.parse( containerEl.getAttribute("data-value")) || [];
        let i = values.indexOf( parseInt( btnEl.value));
        if (i > -1) {   
          values.splice(i, 1);  // delete from value list
        } else {  // add to value list 
          values.push( btnEl.value);
        }
        containerEl.setAttribute("data-value", "["+ values.join() +"]");            
      }
    });
  }
  return containerEl;
}

export { isNonEmptyString, fillSelectWithOptions, cloneObject, 
  isIntegerOrIntegerString, createChoiceWidget};