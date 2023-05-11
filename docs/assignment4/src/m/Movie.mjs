import { isNonEmptyString, cloneObject, isIntegerOrIntegerString } from "../../lib/util.mjs";
import { NoConstraintViolation, 
    MandatoryValueConstraintViolation, 
    RangeConstraintViolation,
    UniquenessConstraintViolation,
    StringLenghtConstrainViolation } from "../../lib/errorTypes.mjs";
import { MovieRatingEL, GenreEL} from "../../lib/Enumeration.mjs";

export default class Movie {
  constructor (slots) {
    // assign default values to mandatory properties
    this._movieId = 0;      // number (int)
    this._title = "";       // string
    this._rating = 0;       // number (MovieRatingEL)
    this._genres = [];      // number (GenreEL)
    // is constructor invoked with a non-empty slots argument?
    if (typeof slots === "object" && Object.keys( slots).length > 0) {
      // assign properties by invoking implicit setters
      this.movieId = slots.movieId;
      this.title = slots.title;
      this.rating = slots.rating;
      this.genres = slots.genres;
    }
  }

  get movieId() {
    return this._movieId;
  }
  //  set the movieId but first validating the data
  set movieId( id) {
    const validationResult = Movie.checkMovieIdAsId( id);
    if (validationResult instanceof NoConstraintViolation) {
      this._movieId = id;
    } else {
      throw validationResult;
    }
  }
  static checkMovieId( id) {
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
  static checkMovieIdAsId( id) {
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
  get title() {
    return this._title;
  }
  set title( newTitle) {
    const validationResult = Movie.checkTitle( newTitle);
    if (validationResult instanceof NoConstraintViolation) {
      this._title = newTitle;
    } else {
      throw validationResult;
    }
  }
  static checkTitle( newTitle) {
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
  }

  get rating() {
    return this._rating;
  }
  set rating( newRating) {
    const validationResult = Movie.checkMovieRating( newRating);
    if (validationResult instanceof NoConstraintViolation) {
      this._rating = newRating;
    } else {
      throw validationResult;
    }
  }
  static checkMovieRating( ol) {
    if (ol === undefined || ol === "") {
      return new NoConstraintViolation();
    } else if (!isIntegerOrIntegerString( ol) ||
        parseInt(ol) < 1 || parseInt(ol) > MovieRatingEL.MAX) {
      return new RangeConstraintViolation(
          `Invalid value for movie rating: ${ol}`);
    } else {
      return new NoConstraintViolation();
    }
  }

  get genres() {
    return this._genres;
  }
  set genres( newGenres) {
    const validationResult = Movie.checkGenres( newGenres);
    if (validationResult instanceof NoConstraintViolation) {
      this._genres = newGenres;
    } else {
      throw validationResult;
    }
  }
  static checkGenre( p) {
    if (p == undefined) {
      return new MandatoryValueConstraintViolation(
          "No genre provided!");
    } else if (!Number.isInteger( p) || p < 1 ||
        p > GenreEL.MAX) {
      return new RangeConstraintViolation(
          `Invalid value for genre: ${p}`);
    } else {
      return new NoConstraintViolation();
    }
  }
  static checkGenres( genres) {
    if (!genres || (Array.isArray( genres) &&
      genres.length === 0)) {
      return new MandatoryValueConstraintViolation(
        "No genre provided!");
    } else if (!Array.isArray( genres)) {
      return new RangeConstraintViolation(
        "The value of genres must be an array!");
    } else {
      for (let i of genres.keys()) {
        const validationResult = Movie.checkGenre( genres[i]);
        if (!(validationResult instanceof NoConstraintViolation)) {
          return validationResult;
        }
      }
      return new NoConstraintViolation();
    }
  }
  toString() {
    return `Movie{ MovieID: ${this.movieId}, Title: ${this.title},
    MovieRating: ${this.rating},
    Genres: ${this.genres.toString()} }`;
  }
}

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
  var movie = {};
  try {
    movie = new Movie( movieRec);
  } catch (e) {
    console.log(e.constructor.name + 
      " while deserializing a movie row: " + e.message);
  }
  return movie;
};

// Load the movie table from Local Storage
Movie.retrieveAll = function () {
  var moviesString = "";  
  try {
    if (localStorage["movies"]) {
      moviesString = localStorage["movies"];
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
      movie.title = slots.title;
      updatedProperties.push("title");
    }
    if (!movie.genres.isEqualTo( slots.genres)) {
      movie.genres = slots.genres;
      updatedProperties.push("genres");
    }
    if (movie.rating !== slots.rating) {
      // slots.rating has a non-empty value that is new
      movie.rating = slots.rating;
      updatedProperties.push("rating");
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
    var moviesString = JSON.stringify( Movie.instances);
    moviesString = moviesString.replace(/"_/g,'"');
    localStorage["movies"] = moviesString;
  } catch (e) {
    alert("Error when writing to Local Storage\n" + e);
    error = true;
  }
  if (!error) {
    const nmrOfMovies = Object.keys( Movie.instances).length;
    console.log(`${nmrOfMovies} movies saved.`);
  }
};

//////////////// Test area ///////////////////////

//  Create and save test data
Movie.createTestData = function () {
  try {
    Movie.instances["1"] = new Movie({movieId:"1", title:"Pulp Fiction",
        rating: MovieRatingEL.R, genres: [GenreEL.CRIME, GenreEL.DRAMA]});
    Movie.instances["2"] = new Movie({movieId:"2", title:"Star Wars",
        rating: MovieRatingEL.PG, genres: [GenreEL.ACTION, GenreEL.ADVENTURE,
            GenreEL.FANTASY, GenreEL.SCI_FI]});
    Movie.instances["3"] = new Movie({movieId:"3", title:"Casablanca",
        rating: MovieRatingEL.PG, genres: [GenreEL.DRAMA, GenreEL.FILM_NOIR, 
            GenreEL.ROMANCE, GenreEL.WAR]});
    Movie.instances["4"] = new Movie({movieId:"4", title:"The Godfather",
        rating: MovieRatingEL.R, genres: [GenreEL.CRIME, GenreEL.DRAMA]});
    Movie.saveAll();
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
  }
};

//  Clear data
Movie.clearData = function () {
  if (confirm("Do you really want to delete all movie data?")) {
    Movie.instances = {};
    localStorage.setItem("movies", "{}");
  }
};