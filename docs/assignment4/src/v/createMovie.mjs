// import classes and other items
import Movie from "../m/Movie.mjs";
import { fillSelectWithOptions, createChoiceWidget } from "../../lib/util.mjs";
import { MovieRatingEL, GenreEL } from "../../lib/Enumeration.mjs";
// load data
Movie.retrieveAll();
// define variables for accessing UI elements
const formEl = document.forms["Movie"],
      saveButton = formEl["commit"],
      selectGenreEl = formEl["genres"],
      selectRatingEl = formEl.querySelector(
        "fieldset[data-bind='rating']");

createChoiceWidget( selectRatingEl, "rating", [], 
      "radio", MovieRatingEL.labels, false);
fillSelectWithOptions( selectGenreEl, GenreEL.labels, true);

formEl.movieId.addEventListener("input", function () {formEl.movieId.setCustomValidity(
  Movie.checkMovieIdAsId( formEl.movieId.value).message);
});
formEl.title.addEventListener("input", function () {formEl.title.setCustomValidity(
  Movie.checkTitle( formEl.title.value).message);
});

selectGenreEl.addEventListener("change", function () {
  selectGenreEl.setCustomValidity( 
      (selectGenreEl.selectedOptions.length === 0) ? 
          "At least one value must be selected!":"" );
});

saveButton.addEventListener("click", function () {
  const slots = { movieId: formEl.movieId.value,
          title: formEl.title.value,
          rating: formEl.rating.value,
          genres: []};
  // construct the list of selected genres 
  for (let i=0; i < selectGenreEl.selectedOptions.length; i++) {
    slots.genres.push( parseInt( selectGenreEl.selectedOptions[i].value));
  }
  if (slots.rating !== "") {
    slots.rating = parseInt(slots.rating);
  }
  // set error messages in case of constraint violations
  formEl.movieId.setCustomValidity( 
      Movie.checkMovieIdAsId( slots.movieId).message);
  formEl.title.setCustomValidity( 
      Movie.checkTitle( slots.title).message);
  selectRatingEl.setCustomValidity( 
      Movie.checkMovieRating( slots.rating).message);
  selectGenreEl.setCustomValidity( 
      Movie.checkGenres( slots.genres).message);
  // save the input data only if all of the form fields are valid
  if (formEl.reportValidity()) {
    Movie.add( slots);
    formEl.reset();
  } 
});

formEl.addEventListener("submit", function (e) {
  e.preventDefault();
  formEl.reset();
});

window.addEventListener("beforeunload", Movie.saveAll);