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
    agent: {
      id: { type: mongoose.Schema.Types.ObjectId, required: true },
      name: { type: String, required: true },
      phoneNumber: { type: String, required: true },
    },
    certificate: { type: String, default: "none" },
  },

  options
);

const InsuranceClaimsSchema = new mongoose.Schema({
  insuranceId: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: "InsurancePolicy",
  },
  vehicleRegistrationNumber: { type: String },
  dateAndTime: { type: String, required: true },
  location: { type: String, required: true },
  narration: { type: String, required: true },
  status: { type: String, default: "unresolved" },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Users",
    required: true,
  },
});

module.exports = {
  InsurancePolicy: mongoose.model("InsurancePolicy", InsurancePolicySchema),
  InsuranceClaims: mongoose.model("InsuranceClaims", InsuranceClaimsSchema),
};
