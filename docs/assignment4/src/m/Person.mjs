import Movie from "./Movie.mjs";
import { cloneObject, isNonEmptyString } from "../../lib/util.mjs";
import { NoConstraintViolation, 
  MandatoryValueConstraintViolation, 
  RangeConstraintViolation,
  UniquenessConstraintViolation,
  StringLenghtConstrainViolation,
  ReferentialIntegrityConstraintViolation } from "../../lib/errorTypes.mjs";

/**
 * The class Person
 * @class
 */
export default class Person {
  // using a single record parameter with ES6 function parameter destructuring
  constructor ({personId, name}) {
    // assign properties by invoking implicit setters
    this.personId = personId;  // number (integer)
    this.name = name;          // string
  }
  get personId() {
    return this._personId;
  }
  set personId( id) {
    const constraintViolation = Person.checkPersonIdAsId( id);
    if (constraintViolation instanceof NoConstraintViolation) {
      this._personId = parseInt( id);
    } else {
      throw constraintViolation;
    }
  }
  static checkPersonId( id) {
    if (!id) {
      return new NoConstraintViolation();  // may be optional as an IdRef
    } else {
      id = parseInt( id);  // convert to integer
      if (isNaN( id) || !Number.isInteger( id) || id < 1) {
        return new RangeConstraintViolation("The person ID must be a positive integer!");
      } else {
        return new NoConstraintViolation();
      }
    }
  }
  static checkPersonIdAsId( id) {
    var constraintViolation = Person.checkPersonId(id);
    if ((constraintViolation instanceof NoConstraintViolation)) {
      // convert to integer
      id = parseInt(id);
      if (isNaN(id)) {
        return new MandatoryValueConstraintViolation(
            "A positive integer value for the person ID is required!");
      } else if (Person.instances[String(id)]) {  // convert to string if number
        constraintViolation = new UniquenessConstraintViolation(
            "There is already a person record with this person ID!");
      } else {
        constraintViolation = new NoConstraintViolation();
      }
    }
    return constraintViolation;
  }
  static checkPersonIdAsIdRef( id) {
    var constraintViolation = Person.checkPersonId( id);
    if ((constraintViolation instanceof NoConstraintViolation) && id) {
      if (!Person.instances[String(id)]) {
        constraintViolation = new ReferentialIntegrityConstraintViolation(
            "There is no person record with this person ID!");
      }
    }
    return constraintViolation;
  }
  
  get name() {
    return this._name;
  }
  set name( n) {
    const validationResult = Person.checkName( n);
    if (validationResult instanceof NoConstraintViolation) {
      this._name = n;
    } else {
      throw validationResult;
    }
  }
  static checkName( name) {
    if (!name) {
      // is not mentioned but would only make sense
      return new MandatoryValueConstraintViolation(
        "A name for the person must be provided!");
    } else if (!isNonEmptyString(name)) {
      return new RangeConstraintViolation(
          "The title must be a non-empty string!");
    } else if (name.trim().length > 120) {
      return new StringLenghtConstrainViolation(
          "The title can have up to 120 characters!");
    } else {
      return new NoConstraintViolation();
    }
  }

  toString() {
    return `Person{ person ID: ${this.personId}, name: ${this.name} }`;
  }

  toJSON() {  // is invoked by JSON.stringify
    var rec = {};
    for (const p of Object.keys( this)) {
      // remove underscore prefix
      if (p.charAt(0) === "_") rec[p.substr(1)] = this[p];
    }
    return rec;
  }
}
/****************************************************
*** Class-level ("static") properties ***************
*****************************************************/
// initially an empty collection (in the form of a map)
Person.instances = {};

/**********************************************************
 ***  Class-level ("static") storage management methods ***
 **********************************************************/
/**
 *  Create a new person record/object
 */
Person.add = function (slots) {
  try {
    const person = new Person( slots);
    Person.instances[person.personId] = person;
    console.log(`Saved: ${person.name}`);
  } catch (e) {
    console.log(`${e.constructor.name}: ${e.message}`);
  }
};
/**
 *  Update an existing person record/object
 */
Person.update = function ({personId, name}) {
  const person = Person.instances[String( personId)],
        objectBeforeUpdate = cloneObject( person);
  var noConstraintViolated=true, ending="", updatedProperties=[];
  try {
    if (name && person.name !== name) {
      person.name = name;
      updatedProperties.push("name");
    }
  } catch (e) {
    console.log( `${e.constructor.name}: ${e.message}`);
    noConstraintViolated = false;
    // restore object to its state before updating
    Person.instances[personId] = objectBeforeUpdate;
  }
  if (noConstraintViolated) {
    if (updatedProperties.length > 0) {
      ending = updatedProperties.length > 1 ? "ies" : "y";
      console.log( `Propert${ending} ${updatedProperties.toString()} modified for person ${name}`);
    } else {
      console.log( `No property value changed for person ${name}!`);
    }
  }
};
/**
 *  Delete an person object/record
 *  Since the movie-actor association is unidirectional, a linear search on all
 *  movies is required for being able to delete the actor from the movies' actors.
 */
Person.destroy = function (personId) {
  const person = Person.instances[personId];
  // delete all dependent movie records
  for (const movieId of Object.keys( Movie.instances)) {
    const movie = Movie.instances[movieId];
    if (personId in movie.actors) delete movie.actors[personId];
  }
  // delete the person object
  delete Person.instances[personId];
  console.log( `Person ${person.name} deleted.`);
};
/**
 *  Load all person records and convert them to objects
 */
Person.retrieveAll = function () {
  var persons = {};
  if (!localStorage["persons"]) localStorage["persons"] = "{}";
  try {
    persons = JSON.parse( localStorage["persons"]);
  } catch (e) {
    console.log( "Error when reading from Local Storage\n" + e);
    persons = {};
  }
  for (const key of Object.keys( persons)) {
    try {
      // convert record to (typed) object
      Person.instances[key] = new Person( persons[key]);
    } catch (e) {
      console.log( `${e.constructor.name} while deserializing person ${key}: ${e.message}`);
    }
  }
  console.log( `${Object.keys( persons).length} person records loaded.`);
};
/**
 *  Save all person objects as records
 */
Person.saveAll = function () {
  const nmrOfPersons = Object.keys( Person.instances).length;
  try {
    /*var moviesString = JSON.stringify( Person.instances);
    moviesString = moviesString.replace(/"_/g,'"');
    localStorage["persons"] = moviesString;*/
    localStorage["persons"] = JSON.stringify( Person.instances);
    console.log( `${nmrOfPersons} person records saved.`);
  } catch (e) {
    alert( "Error when writing to Local Storage\n" + e);
  }
};