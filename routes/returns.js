const Joi = require("joi");
const moment = require("moment");
const { Rental } = require("../models/rental");
const { Movie } = require("../models/movie");
const autho = require("../middleware/authen"); // Ensure auth middleware is loaded
const validate = require("../middleware/validate"); // Ensure validate middleware is loaded
const express = require("express");
const router = express.Router();

router.post("/", [autho, validate(validateReturn)], async (req, res) => {
  const { error } = validateReturn(req.body);
  if (error) return res.status(400).send(error.details[0].message);

  const rental = await Rental.findOne({
    "customer._id": req.body.customerId,
    "movie._id": req.body.movieId,
  });

  if (!rental)
    return res
      .status(404)
      .send("Not Found: Rental not found for the given customer and movie");

  if (rental.dateReturned)
    return res
      .status(400)
      .send("Bad Request: Rental has already been returned");

  rental.dateReturned = new Date();
  const daysRented = moment().diff(rental.dateOut, "days");
  rental.rentalFee = daysRented * rental.movie.dailyRentalRate;
  await rental.save();

  await Movie.updateOne(
    { _id: rental.movie._id },
    {
      $inc: { numberInStock: 1 },
    }
  );

  return res.status(200).send(rental);
});

function validateReturn(req) {
  const schema = Joi.object({
    customerId: Joi.objectId().required(),
    movieId: Joi.objectId().required(),
  });

  return schema.validate(req); //新写法，和Mosh过时的不同
}

module.exports = router;
