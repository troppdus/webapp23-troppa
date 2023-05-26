// import classes and other items
import Movie from "../m/Movie.mjs";
import {fillSelectWithOptions} from "../../lib/util.mjs";
// load data
Movie.retrieveAll();

// define variables for accessing UI elements
const formEl = document.forms["Movie"],
      saveButton = formEl["commit"],
      selectMovieEl = formEl["selectMovie"];
// set up the movie selection list
fillSelectWithOptions( Movie.instances, selectMovieEl);
// when a movie is selected, populate the form with its data
selectMovieEl.addEventListener("change", function () {
  const movieKey = selectMovieEl.value;
  if (movieKey) {  // set form fields
    const movie = Movie.instances[movieKey];
    ["movieId","title","releaseDate"].forEach( function (p) {
      formEl[p].value = movie[p] ? movie[p] : "";
      // delete previous custom validation error message
      formEl[p].setCustomValidity("");
    });
  } else {
    formEl.reset();
  }
});

formEl.title.addEventListener("input", 
    function () {formEl.title.setCustomValidity(
  Movie.checkTitle( formEl.title.value).message);
});
formEl.releaseDate.addEventListener("input", 
    function () {formEl.releaseDate.setCustomValidity(
  Movie.checkReleaseDate( formEl.releaseDate.value).message);
});

saveButton.addEventListener("click", function () {
  const slots = { movieId: selectMovieEl.value,
          title: formEl.title.value};
  // set error messages in case of constraint violations
  formEl.title.setCustomValidity( 
      Movie.checkTitle( slots.title).message);
  if (formEl.releaseDate.value) {
    slots.releaseDate = formEl.releaseDate.value;
    formEl.releaseDate.setCustomValidity( 
        Movie.checkReleaseDate( slots.releaseDate).message);
  }
  
  // save the input data only if all of the form fields are valid
  if (formEl.reportValidity()) {
    Movie.update( slots);
    selectMovieEl.remove( selectMovieEl.selectedIndex);
    const optionEl = document.createElement("option");
    optionEl.text = slots.title;
    optionEl.value = slots.movieId;
    selectMovieEl.add( optionEl, null);
    formEl.reset();
  }
});

formEl.addEventListener("submit", function (e) {
  e.preventDefault();
  formEl.reset();
});

window.addEventListener("beforeunload", Movie.saveAll);