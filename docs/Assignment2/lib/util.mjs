//import Movie from "../m/Movie.mjs";

function isNonEmptyString(x) {
  return typeof(x) === "string" && x.trim() !== "";
}

function fillSelectWithOptions(movieInstance, selectMovieEl) {
  // populate the selection list with movies
  for (let key of Object.keys( movieInstance)) {
    const movie = movieInstance[key];
    const optionEl = document.createElement("option");
    optionEl.text = movie.title;
    optionEl.value = movie.movieId;
    selectMovieEl.add( optionEl, null);
  }
}

function cloneObject(movie) {
  return JSON.parse(JSON.stringify(movie));
}

export { isNonEmptyString, fillSelectWithOptions, cloneObject};