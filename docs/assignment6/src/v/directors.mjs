/***************************************************************
 Import classes, datatypes and utility procedures
 ***************************************************************/
 import Person from "../m/Person.mjs";
 import Movie from "../m/Movie.mjs";
 import Director from "../m/Director.mjs";
 import { fillSelectWithOptions, createListFromMap } from "../../lib/util.mjs";
 
 /***************************************************************
  Load data
  ***************************************************************/
 Person.retrieveAll();
 Movie.retrieveAll();
 
 /***************************************************************
  Set up general, use-case-independent UI elements
  ***************************************************************/
 // set up back-to-menu buttons for all use cases
 for (const btn of document.querySelectorAll("button.back-to-menu")) {
   btn.addEventListener('click', function () {refreshManageDataUI();});
 }
 // neutralize the submit event for all use cases
 for (const frm of document.querySelectorAll("section > form")) {
   frm.addEventListener("submit", function (e) {
     e.preventDefault();
     frm.reset();
   });
 }
 // save data when leaving the page
 window.addEventListener("beforeunload", function () {
   Person.saveAll();
   for (const Subtype of Person.subtypes) {
    Subtype.saveAll();
   }
   // also save movies because movies may be deleted when an firector is deleted
   Movie.saveAll();
 });
 
 /**********************************************
  Use case Retrieve and List All Directors
  **********************************************/
 document.getElementById("RetrieveAndListAll")
     .addEventListener("click", function () {
   const tableBodyEl = document.querySelector("section#Director-R > table > tbody");
   tableBodyEl.innerHTML = "";
   for (const key of Object.keys( Director.instances)) {
     const director = Director.instances[key];
     const row = tableBodyEl.insertRow();
     const dirMoviesListEl = createListFromMap( director.directedMovies, "title");
     row.insertCell().textContent = director.personId;
     row.insertCell().textContent = director.name;
     row.insertCell().appendChild(dirMoviesListEl);
   }
   document.getElementById("Director-M").style.display = "none";
   document.getElementById("Director-R").style.display = "block";
 });
 
 /**********************************************
  Use case Create Director
  **********************************************/
 const createFormEl = document.querySelector("section#Director-C > form");
 document.getElementById("Create").addEventListener("click", function () {
   document.getElementById("Director-M").style.display = "none";
   document.getElementById("Director-C").style.display = "block";
   // reset red box and error messages
   createFormEl.personId.setCustomValidity("");
   createFormEl.name.setCustomValidity("");
   createFormEl.reportValidity();
   createFormEl.reset();
 });
 // set up event handlers for responsive constraint validation
 createFormEl.personId.addEventListener("input", function () {
   createFormEl.personId.setCustomValidity(
       Person.checkPersonIdAsId( createFormEl.personId.value).message);
 });
 // set up event handlers for responsive constraint validation
 createFormEl.name.addEventListener("input", function () {
   createFormEl.name.setCustomValidity(
       Person.checkName( createFormEl.name.value).message);
 });
 
 // handle Save button click events
 createFormEl["commit"].addEventListener("click", function () {
   const slots = {
     personId: createFormEl.personId.value,
     name: createFormEl.name.value
   };
   // check all input fields and show error messages
   createFormEl.personId.setCustomValidity(
       Person.checkPersonIdAsId( slots.personId).message);
   createFormEl.name.setCustomValidity(
       Person.checkName( slots.name).message);
   // save the input data only if all form fields are valid
   if (createFormEl.reportValidity()) Director.add( slots);
 });
 
 /**********************************************
  Use case Update Director
  **********************************************/
 const updateFormEl = document.querySelector("section#Director-U > form");
 const updSelDirectorEl = updateFormEl.selectDirector;
 // handle click event for the menu item "Update"
 document.getElementById("Update").addEventListener("click", function () {
   // reset selection list (drop its previous contents)
   updSelDirectorEl.innerHTML = "";
   // populate the selection list
   fillSelectWithOptions( updSelDirectorEl, Director.instances,
       "personId", {displayProp:"name"});
   document.getElementById("Director-M").style.display = "none";
   document.getElementById("Director-U").style.display = "block";
   // reset red box and error messages
   updateFormEl.name.setCustomValidity("");
   updateFormEl.reportValidity();
   updateFormEl.reset();
 });
 updSelDirectorEl.addEventListener("change", handleDirectorSelectChangeEvent);
 
 // set up event handlers for responsive constraint validation
 updateFormEl.name.addEventListener("input", function () {
  updateFormEl.name.setCustomValidity(
       Person.checkName( updateFormEl.name.value).message);
 });
 
 // handle Save button click events
 updateFormEl["commit"].addEventListener("click", function () {
   const personIdRef = updSelDirectorEl.value;
   if (!personIdRef) return;
   const slots = {
     personId: updateFormEl.personId.value,
     name: updateFormEl.name.value
   }
   // check all property constraints
   updateFormEl.name.setCustomValidity(
    Person.checkName(slots.name).message);

   // save the input data only if all of the form fields are valid
   if (updateFormEl.reportValidity()) {
     Director.update( slots);
     // update the director selection list's option element
     updSelDirectorEl.options[updSelDirectorEl.selectedIndex].text = slots.name;
   }
 });
 /**
  * handle director selection events
  * when a director is selected, populate the form with the data of the selected director
  */
 function handleDirectorSelectChangeEvent () {
   const key = updateFormEl.selectDirector.value;
   if (key) {
     const director = Director.instances[key];
     updateFormEl.personId.value = director.personId;
     updateFormEl.name.value = director.name;
   } else {
     updateFormEl.reset();
   }
 }
 
 /**********************************************
  Use case Delete Director
  **********************************************/
 const deleteFormEl = document.querySelector("section#Director-D > form");
 const delSelDirectorEl = deleteFormEl.selectPerson;
 document.getElementById("Delete").addEventListener("click", function () {
   document.getElementById("Director-M").style.display = "none";
   document.getElementById("Director-D").style.display = "block";
   // reset selection list (drop its previous contents)
   delSelDirectorEl.innerHTML = "";
   // populate the selection list
   fillSelectWithOptions( delSelDirectorEl, Director.instances,
       "personId", {displayProp:"name"});
   deleteFormEl.reset();
 });
 // handle Delete button click events
 deleteFormEl["commit"].addEventListener("click", function () {
   const personIdRef = delSelDirectorEl.value;
   if (!personIdRef) return;
   if (confirm("Do you really want to delete this director?")) {
     Director.destroy( personIdRef);
     delSelDirectorEl.remove( delSelDirectorEl.selectedIndex);
   }
 });
 
 /**********************************************
  * Refresh the Manage Persons Data UI
  **********************************************/
 function refreshManageDataUI() {
   // show the manage person UI and hide the other UIs
   document.getElementById("Director-M").style.display = "block";
   document.getElementById("Director-R").style.display = "none";
   document.getElementById("Director-C").style.display = "none";
   document.getElementById("Director-U").style.display = "none";
   document.getElementById("Director-D").style.display = "none";
 }
 
 // Set up Manage Persons UI
 refreshManageDataUI();
 