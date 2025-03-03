const mongoose = require("mongoose");
const { InsurancePolicy } = require("../models/Insurance");

const CorporateAndGroupHmoSchema = new mongoose.Schema({
  nameOfOrganization: { type: String, required: true },
  numberOfPeopleInOrganization: { type: String, required: true },
  comments: { type: String, required: true },
  status: { type: String, default: "pending" },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
});

const CorporateAndGroupHmo = InsurancePolicy.discriminator(
  "corporate-and-group-hmo",
  CorporateAndGroupHmoSchema
);

module.exports = {
  CorporateAndGroupHmo,
};
