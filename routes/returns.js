const express = require("express");
const router = express.Router();

router.post("/", async (req, res) => {
  res.status(401).send("Unauthorized: Client is not logged in");
});

module.exports = router;
