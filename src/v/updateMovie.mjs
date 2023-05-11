// import classes and other items
import Movie from "../m/Movie.mjs";
import {fillSelectWithOptions, createChoiceWidget} from "../../lib/util.mjs";
import { MovieRatingEL, GenreEL } from "../../lib/Enumeration.mjs";
// load data
Movie.retrieveAll();

// define variables for accessing UI elements
const formEl = document.forms["Movie"],
      saveButton = formEl["commit"],
      selectMovieEl = formEl["selectMovie"],
      selectGenreEl = formEl["genres"],
      selectRatingEl = formEl.querySelector(
        "fieldset[data-bind='rating']");

// set up the movie selection list
fillSelectWithOptions( selectMovieEl, Movie.instances, false, {displayProp:"title"});
createChoiceWidget( selectRatingEl, "rating", [], 
  "radio", MovieRatingEL.labels, false);
fillSelectWithOptions( selectGenreEl, GenreEL.labels, true);
// when a movie is selected, populate the form with its data
selectMovieEl.addEventListener("change", function () {
  const movieKey = selectMovieEl.value;
  if (movieKey && movieKey !== "0") {  // set form fields
    const movie = Movie.instances[movieKey];
    formEl.movieId.value = movie.movieId;
    formEl.title.value = movie.title;
    createChoiceWidget( selectRatingEl, "rating", [movie.rating], 
      "radio", MovieRatingEL.labels, false);
    fillSelectWithOptions( selectGenreEl, GenreEL.labels, true,
        {selection: movie.genres});
  } else {
    formEl.reset();
  }
  selectMovieEl.setCustomValidity(formEl.movieId.value === "" ? 
      "You need to select a movie!" : "");
});
selectGenreEl.addEventListener("change", function () {
  const genreKey = selectGenreEl.selectedOptions;
  selectGenreEl.setCustomValidity(
    (!genreKey || Array.isArray(genreKey) && genreKey.length === 0) ?
      "At least one genre must be selected!":"" );
});

formEl.title.addEventListener("input", 
    function () {formEl.title.setCustomValidity(
  Movie.checkTitle( formEl.title.value).message);
});

saveButton.addEventListener("click", function () {
  selectMovieEl.setCustomValidity(formEl.movieId.value === "" ? 
      "You need to select a movie!" : "");
  if (formEl.movieId.value !== "") {
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
    formEl.title.setCustomValidity( 
        Movie.checkTitle( slots.title).message);
    selectRatingEl.setCustomValidity( 
        Movie.checkMovieRating( slots.rating).message);
    selectGenreEl.setCustomValidity( 
        Movie.checkGenres( slots.genres).message);
    
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
  } else {
    formEl.reportValidity();
    formEl.reset();
  }
});

formEl.addEventListener("submit", function (e) {
  e.preventDefault();
  formEl.reset();
});

window.addEventListener("beforeunload", Movie.saveAll);