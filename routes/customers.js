const { Customer, validateCustomer } = require("../models/customer");
const mongoose = require("mongoose");
const express = require("express");
const router = express.Router();
const mongooseValidateObjectId = require("../middleware/mongooseValidateObjId");
const authen = require("../middleware/authen");
const admin = require("../middleware/admin");
const validate = require("../middleware/validate");

router.get("/", async (req, res) => {
  const customers = await Customer.find().sort("name");
  res.send(customers);
});

router.get("/:id", mongooseValidateObjectId, async (req, res) => {
  const customer = await Customer.findById(req.params.id);

  if (!customer)
    return res
      .status(404)
      .send("The customer with the given ID was not found.");

  res.send(customer);
});

router.post("/", [authen, validate(validateCustomer)], async (req, res) => {
  let customer = new Customer({
    name: req.body.name,
    isGold: req.body.isGold,
    phone: req.body.phone,
  });
  customer = await customer.save();

  res.send(customer);
});

router.put(
  "/:id",
  [authen, mongooseValidateObjectId, validate(validateCustomer)],
  async (req, res) => {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      {
        name: req.body.name,
        isGold: req.body.isGold,
        phone: req.body.phone,
      },
      { new: true }
    );

    if (!customer)
      return res
        .status(404)
        .send("The customer with the given ID was not found.");

    res.send(customer);
  }
);

router.delete(
  "/:id",
  [authen, admin, mongooseValidateObjectId],
  async (req, res) => {
    const customer = await Customer.findByIdAndDelete(req.params.id);

    if (!customer)
      return res
        .status(404)
        .send("The customer with the given ID was not found.");

    res.send(customer);
  }
);

module.exports = router;
