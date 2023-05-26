// import classes and other items
import Movie from "../m/Movie.mjs";
import {fillSelectWithOptions} from "../../lib/util.mjs";
// load data
Movie.retrieveAll();

// define variables for accessing UI elements
const formEl = document.forms["Movie"],
      deleteButton = formEl["commit"],
      selectMovieEl = formEl["selectMovie"];
// set up the movie selection list
fillSelectWithOptions( Movie.instances, selectMovieEl);

deleteButton.addEventListener("click", function () {
  Movie.destroy( selectMovieEl.value);
  selectMovieEl.remove( selectMovieEl.selectedIndex);
});

window.addEventListener("beforeunload", Movie.saveAll);