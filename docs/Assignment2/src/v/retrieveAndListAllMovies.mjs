// import classes and other items
import Movie from "../m/Movie.mjs";
// load data
Movie.retrieveAll();
const tableBodyEl = document.querySelector("table#movies>tbody");

for (let key of Object.keys( Movie.instances)) {
  const row = tableBodyEl.insertRow();
  row.insertCell().textContent = Movie.instances[key].movieId;
  row.insertCell().textContent = Movie.instances[key].title;
  row.insertCell().textContent = Movie.instances[key].releaseDate;
}