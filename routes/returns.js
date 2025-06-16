const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  if (!req.body.customerId)
    return res.status(400).send("Bad Request: customerId is required");
  if (!req.body.movieId)
    return res.status(400).send("Bad Request: movieId is required");
  res.status(401).send("Unauthorized: Client is not logged in");
});

module.exports = router;
