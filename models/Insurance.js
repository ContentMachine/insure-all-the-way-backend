const mongoose = require("mongoose");

const options = {
  discriminatorKey: "insuranceType",
  collection: "insurancePolicies",
};

const InsurancePolicySchema = new mongoose.Schema(
  {
    policyNumber: { type: String, required: true },
    effectiveDate: { type: Date, required: true },
    expirationDate: { type: Date, required: true },
  },
  options
);
