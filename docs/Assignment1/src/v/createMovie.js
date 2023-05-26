mdb.v.createMovie = {
  setupUserInterface: function () {
    const saveButton = document.forms["Movie"].commit;
    // load all movie objects
    Movie.retrieveAll();
    // set an event handler for the submit/save button
    saveButton.addEventListener("click", 
        mdb.v.createMovie.handleSaveButtonClickEvent);
    // set a handler for the event when the browser window/tab is closed
    window.addEventListener("beforeunload", Movie.saveAll);
  },

  // save user input data
  handleSaveButtonClickEvent: function () {
    const formEl = document.forms["Movie"];
    const slots = { movieId: formEl.movieId.value,
        title: formEl.title.value, 
        releaseDate: formEl.releaseDate.value};
    Movie.add( slots);
    formEl.reset();
  }
};