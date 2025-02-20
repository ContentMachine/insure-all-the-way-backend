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

module.exports = {
  InsurancePolicy: mongoose.model("InsurancePolicy", InsurancePolicySchema),
};
