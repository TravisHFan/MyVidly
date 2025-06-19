const { Movie, validateMovie } = require("../models/movie");
const { Genre } = require("../models/genre");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const mongooseValidateObjectId = require("../middleware/mongooseValidateObjId");
const authen = require("../middleware/authen");
const admin = require("../middleware/admin");
const validate = require("../middleware/validate");

router.get("/", async (req, res) => {
  const movies = await Movie.find().sort("name");
  res.send(movies);
});

router.post("/", [authen, validate(validateMovie)], async (req, res) => {
  const genre = await Genre.findById(req.body.genreId);
  if (!genre) return res.status(400).send("Invalid genre.");

  const movie = new Movie({
    title: req.body.title,
    genre: {
      _id: genre._id,
      name: genre.name,
    },
    numberInStock: req.body.numberInStock,
    dailyRentalRate: req.body.dailyRentalRate,
  });
  await movie.save();

  res.send(movie);
});

router.put(
  "/:id",
  [authen, mongooseValidateObjectId, validate(validateMovie)],
  async (req, res) => {
    const genre = await Genre.findById(req.body.genreId);
    if (!genre) return res.status(400).send("Invalid genre.");

    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      {
        title: req.body.title,
        genre: {
          _id: genre._id,
          name: genre.name,
        },
        numberInStock: req.body.numberInStock,
        dailyRentalRate: req.body.dailyRentalRate,
      },
      { new: true }
    );

    if (!movie)
      return res.status(404).send("The movie with the given ID was not found.");

    res.send(movie);
  }
);

router.delete(
  "/:id",
  [authen, admin, mongooseValidateObjectId],
  async (req, res) => {
    const movie = await Movie.findByIdAndRemove(req.params.id);

    if (!movie)
      return res.status(404).send("The movie with the given ID was not found.");

    res.send(movie);
  }
);

router.get("/:id", mongooseValidateObjectId, async (req, res) => {
  const movie = await Movie.findById(req.params.id);

  if (!movie)
    return res.status(404).send("The movie with the given ID was not found.");

  res.send(movie);
});

module.exports = router;
