const mongoose = require("mongoose");
const { InsurancePolicy } = require("../models/Insurance");

const BuildingSchema = new mongoose.Schema({
  locationOfProperty: { type: String, required: true },
  valueOfProperty: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  status: { type: String, default: "pending" },
});

const AllRisksSchema = new mongoose.Schema({
  deviceType: { type: String, required: true },
  valueOfDevice: { type: String, required: true },
  quantityOfDevice: { type: String, required: true },
  premium: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  status: { type: String, default: "pending" },
});

const BuildingPolicy = InsurancePolicy.discriminator(
  "building",
  BuildingSchema
);
const AllRisksPolicy = InsurancePolicy.discriminator(
  "all-risk",
  AllRisksSchema
);

module.exports = { BuildingPolicy, AllRisksPolicy };
