import { isNonEmptyString, cloneObject } from "../../lib/util.mjs";
import { NoConstraintViolation, 
    MandatoryValueConstraintViolation, 
    RangeConstraintViolation,
    UniquenessConstraintViolation,
    StringLenghtConstrainViolation,
    IntervalConstraintViolation } from "../../lib/errorTypes.mjs";
    
export default function Movie( slots) {
    this.movieId = 0;      // number (int)
    this.title = "";        // string
    this.releaseDate = "";  // string

    if (arguments.length > 0) {
      this.setMovieId(slots.movieId);
      this.setTitle(slots.title);
      // optional property
      if (slots.releaseDate) this.setReleaseDate(slots.releaseDate);
    }
};

Movie.instances = {};

Movie.add = function (slots) {
  try {
    const movie = new Movie( slots);
    // add movie to the Movie.instances collection
    Movie.instances[slots.movieId] = movie;
    console.log(`Movie ${slots.movieId} created!`);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
  }
}

// Convert record/row to object
Movie.convertRec2Obj = function (movieRec) {
  const movie = new Movie( movieRec);
  return movie;
};

// Load the movie table from Local Storage
Movie.retrieveAll = function () {
  var moviesString = "";  
  try {
    if (localStorage.getItem("movies")) {
      moviesString = localStorage.getItem("movies");
    }
  } catch (e) {
    alert("Error when reading from Local Storage\n" + e);
  }
  if (moviesString) {
    const movies = JSON.parse( moviesString);
    const keys = Object.keys( movies);
    console.log(`${keys.length} movies loaded.`);
    for (let i=0; i < keys.length; i++) {
      let key = keys[i];
      Movie.instances[key] = Movie.convertRec2Obj( movies[key]);
    }
  }
};

//  Update an existing movie row
Movie.update = function (slots) {
  var noConstraintViolated = true,
      updatedProperties = [];
  const movie = Movie.instances[slots.movieId], 
      objectBeforeUpdate = cloneObject( movie);
  try {
    if (movie.title !== slots.title) {
      movie.setTitle( slots.title);
      updatedProperties.push("title");
    }
    if (slots.releaseDate && movie.releaseDate !== slots.releaseDate) {
      // slots.releaseDate has a non-empty value that is new
      movie.setReleaseDate( slots.releaseDate);
      updatedProperties.push("releaseDate");
    } else if (!slots.releaseDate && movie.releaseDate !== undefined) {
      // slots.releaseDate has a empty value that is new
      delete movie.releaseDate;  // unset the property "releaseDate"
      updatedProperties.push("releaseDate");
    }
  } catch (e) {
    console.log( e.constructor.name +": "+ e.message);
    noConstraintViolated = false;
    // restore object to its state before updating
    Movie.instances[slots.movieId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      console.log(`Properties ${updatedProperties.toString()}` + 
          ` modified for movie ${slots.movieId}`);
    } else {
      console.log(`No property value changed for movie ${slots.movieId}!`);
    }
  }
};

//  Delete a movie row from persistent storage
Movie.destroy = function (movieId) {
  if (Movie.instances[movieId]) {
    console.log(`Movie ${movieId} deleted`);
    delete Movie.instances[movieId];
  } else {
    console.log(`There is no movie with MovieID ${movieId} in the database!`);
  }
};

//  Save all movie objects to Local Storage
Movie.saveAll = function () {
  var error = false;
  try {
    const moviesString = JSON.stringify( Movie.instances);
    localStorage.setItem("movies", moviesString);
  } catch (e) {
    alert("Error when writing to Local Storage\n" + e);
    error = true;
  }
  if (!error) {
    const nmrOfMovies = Object.keys( Movie.instances).length;
    console.log(`${nmrOfMovies} movies saved.`);
  }
};

//////////////// Check area //////////////////////

//  set the movieId but first validating the data
Movie.prototype.setMovieId = function (id) {
  const validationResult = Movie.checkMovieIdAsId( id);
  if (validationResult instanceof NoConstraintViolation) {
    this.movieId = id;
  } else {
    throw validationResult;
  }
};

Movie.checkMovieId = function (id) {
  if (id === undefined) {
    return new NoConstraintViolation();
  }
  const newId = parseInt(id); // transfer string to int
  if (Number.isInteger( newId)) {
    if (newId > 0) return new NoConstraintViolation();
  }
  
  return new RangeConstraintViolation(
    "The movie ID must be a positiv integer!");
};

Movie.checkMovieIdAsId = function (id) {
  var constraintViolation = Movie.checkMovieId( id);
  if ((constraintViolation instanceof NoConstraintViolation)) {
    if (!id) {
      constraintViolation = new MandatoryValueConstraintViolation(
          "A value for the movie ID must be provided!");
    } else if (Movie.instances[id]) {  
      constraintViolation = new UniquenessConstraintViolation(
          "There is already a movie record with this movie ID!");
    } else {
      constraintViolation = new NoConstraintViolation();
    } 
  }
  return constraintViolation;
};

//  set the title but first validating the data
Movie.prototype.setTitle = function (newTitle) {
  const validationResult = Movie.checkTitle( newTitle);
  if (validationResult instanceof NoConstraintViolation) {
    this.title = newTitle;
  } else {
    throw validationResult;
  }
};

Movie.checkTitle = function (newTitle) {
  if (!newTitle) {
    return new MandatoryValueConstraintViolation(
      "A name for the title must be provided!");
  } else if (!isNonEmptyString(newTitle)) {
    return new RangeConstraintViolation(
        "The title must be a non-empty string!");
  } else if (newTitle.trim().length > 120) {
    return new StringLenghtConstrainViolation(
        "The title can have up to 120 characters!");
  } else {
    return new NoConstraintViolation();
  }
};

//  set the release date but first validating the data
Movie.prototype.setReleaseDate = function (newDate) {
  const validationResult = Movie.checkReleaseDate( newDate);
  if (validationResult instanceof NoConstraintViolation) {
    this.releaseDate = newDate;
  } else {
    throw validationResult;
  }
};

Movie.checkReleaseDate = function (newDateString) {
  const newDate = new Date(newDateString);
  const baseDate = new Date("1895-12-28");

  if (newDateString === undefined) {
    return new NoConstraintViolation();
  } else if (typeof(newDateString) !== "string") {
    return new RangeConstraintViolation(
        "The release date must be a real date in the form YYYY-MM-DD!");
  } else if (newDateString.trim() === "") {
    return new NoConstraintViolation();
  } else if (isNaN(newDate) || !/\b\d{4}-\d{2}-\d{2}\b/.test(newDateString)) {
    return new RangeConstraintViolation(
        "The release date must be a real date in the form YYYY-MM-DD!");
  } else if (newDate.getTime() < baseDate.getTime()) {
    return new IntervalConstraintViolation(
      "A date must be 1895-12-28 or later!");
  } else {
    return new NoConstraintViolation();
  }
};

//////////////// Test area ///////////////////////

//  Create and save test data
Movie.createTestData = function () {
  Movie.instances["1"] = new Movie({movieId:"1", title:"Pulp Fiction",
      releaseDate:"1994-05-12"});
  Movie.instances["2"] = new Movie({movieId:"2", title:"Star Wars",
      releaseDate:"1977-05-25"});
  Movie.instances["3"] = new Movie({movieId:"3", title:"Casablanca",
      releaseDate:"1943-01-23"});
  Movie.instances["4"] = new Movie({movieId:"4", title:"The Godfather",
      releaseDate:"1972-03-15"});
  Movie.saveAll();
};

//  Clear data
Movie.clearData = function () {
  if (confirm("Do you really want to delete all movie data?")) {
    Movie.instances = {};
    localStorage.setItem("movies", "{}");
  }
};

// return a string this the property values
Movie.prototype.toString = function () {
  return `Movie{ MovieID: ${this.movieId}, title: ${this.title}, 
      releaseDate: ${this.releaseDate}`;
}