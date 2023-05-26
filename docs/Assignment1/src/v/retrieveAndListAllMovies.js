mdb.v.retrieveAndListAllMovies = {
  setupUserInterface: function () {
    const tableBodyEl = document.querySelector("table#movies>tbody");
    // load all movie objects
    Movie.retrieveAll();
    // for each movie, create a table row with a cell for each attribute
    for (let key of Object.keys( Movie.instances)) {
      const row = tableBodyEl.insertRow();
      row.insertCell().textContent = Movie.instances[key].movieId;
      row.insertCell().textContent = Movie.instances[key].title;
      row.insertCell().textContent = Movie.instances[key].releaseDate;
    }
  }
};