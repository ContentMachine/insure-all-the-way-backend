const mongoose = require("mongoose");

const options = {
  discriminatorKey: "insuranceType",
  collection: "insurancePolicies",
};

const InsurancePolicySchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Users",
      required: true,
    },
    createdAt: { type: Date, default: Date.now },
  },

  options
);

const InsuranceClaimsSchema = new mongoose.Schema({
  insuranceId: { type: String, required: true },
  vehicleRegistrationNumber: { type: String },
  dateAndTime: { type: String, required: true },
  location: { type: String, required: true },
  narration: { type: String, required: true },
});

module.exports = {
  InsurancePolicy: mongoose.model("InsurancePolicy", InsurancePolicySchema),
  InsuranceClaims: mongoose.model("InsuranceClaims", InsuranceClaimsSchema),
};
