// import classes and other items
import Movie from "../m/Movie.mjs";
// load data
Movie.retrieveAll();
// define variables for accessing UI elements
const formEl = document.forms["Movie"],
      saveButton = formEl["commit"];

formEl.movieId.addEventListener("input", function () {formEl.movieId.setCustomValidity(
  Movie.checkMovieIdAsId( formEl.movieId.value).message);
});
formEl.title.addEventListener("input", function () {formEl.title.setCustomValidity(
  Movie.checkTitle( formEl.title.value).message);
});
formEl.releaseDate.addEventListener("input", function () {formEl.releaseDate.setCustomValidity(
  Movie.checkReleaseDate( formEl.releaseDate.value).message);
});

saveButton.addEventListener("click", function () {
  const slots = { movieId: formEl.movieId.value,
          title: formEl.title.value};
  // set error messages in case of constraint violations
  formEl.movieId.setCustomValidity( 
      Movie.checkMovieIdAsId( slots.movieId).message);
  formEl.title.setCustomValidity( 
      Movie.checkTitle( slots.title).message);
  if (formEl.releaseDate.value) {
    slots.releaseDate = formEl.releaseDate.value;
    formEl.releaseDate.setCustomValidity( 
        Movie.checkReleaseDate( slots.releaseDate).message);
  }
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