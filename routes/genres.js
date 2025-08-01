const mongooseValidateObjectId = require("../middleware/mongooseValidateObjId");
const authen = require("../middleware/authen");
const admin = require("../middleware/admin");
const { Genre, validate: validateGenre } = require("../models/genre");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const validate = require("../middleware/validate");

router.get("/", async (req, res) => {
  const genres = await Genre.find().sort("name");
  res.send(genres);
});

router.get("/:id", mongooseValidateObjectId, async (req, res) => {
  const genre = await Genre.findById(req.params.id);

  if (!genre)
    return res.status(404).send("The genre with the given ID was not found.");

  res.send(genre);
});

router.post("/", [authen, validate(validateGenre)], async (req, res) => {
  let genre = new Genre({ name: req.body.name });
  genre = await genre.save();

  res.send(genre);
});

router.put(
  "/:id",
  [authen, mongooseValidateObjectId, validate(validateGenre)],
  async (req, res) => {
    const genre = await Genre.findByIdAndUpdate(
      req.params.id,
      { name: req.body.name },
      {
        new: true,
      }
    );

    if (!genre)
      return res.status(404).send("The genre with the given ID was not found.");

    res.send(genre);
  }
);

router.delete(
  "/:id",
  [authen, admin, mongooseValidateObjectId],
  async (req, res) => {
    const genre = await Genre.findByIdAndDelete(req.params.id);

    if (!genre)
      return res.status(404).send("The genre with the given ID was not found.");

    res.send(genre);
  }
);

module.exports = router;
