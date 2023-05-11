// import classes and other items
import Movie from "../m/Movie.mjs";
import { MovieRatingEL, GenreEL} from "../../lib/Enumeration.mjs";
// load data
Movie.retrieveAll();
const tableBodyEl = document.querySelector("table#movies>tbody");

for (let key of Object.keys( Movie.instances)) {
  const row = tableBodyEl.insertRow();
  const movie = Movie.instances[key];
  row.insertCell().textContent = movie.movieId;
  row.insertCell().textContent = movie.title;
  row.insertCell().textContent = MovieRatingEL.labels[movie.rating-1];
  row.insertCell().textContent = GenreEL.convertEnumIndexes2Names(movie.genres);
}