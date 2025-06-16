const { Rental } = require("../models/rental");
const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
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

  res.status(401).send("Unauthorized: Client is not logged in");
});

module.exports = router;
