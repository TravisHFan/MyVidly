const moment = require("moment");
const { Rental } = require("../models/rental");
const { Movie } = require("../models/movie");
const autho = require("../middleware/autho"); // Ensure auth middleware is loaded
const express = require("express");
const router = express.Router();

router.post("/", autho, async (req, res) => {
  if (!req.body.customerId)
    return res.status(400).send("Bad Request: customerId is required");

  if (!req.body.movieId)
    return res.status(400).send("Bad Request: movieId is required");

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

  return res.status(200).send();
});

module.exports = router;
