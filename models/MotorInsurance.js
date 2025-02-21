const mongoose = require("mongoose");
const { InsurancePolicy } = require("../models/Insurance");

const ThirdPartyPolicySchema = new mongoose.Schema({
  registrationNumber: { type: String, required: true },
  chasisNumber: { type: String, required: true },
  roadWorthiness: { type: String, required: true },
  plan: { type: String, required: true },
});

const EnhancedThirdPartyPolicySchema = new mongoose.Schema({
  makeOfVehicle: { type: String, required: true },
  yearOfMake: { type: String, required: true },
  modelOfVehicle: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  registrationNumber: { type: String, required: true },
  engineNumber: { type: String, required: true },
  chasisNumber: { type: String, required: true },
  color: { type: String, required: true },
  vehicleType: { type: String, required: true },
  proofOfOwnership: { type: String, required: true },
  id: { type: String, required: true },
  plan: { type: String, required: true },
});

const ComprehensivePolicySchema = new mongoose.Schema({
  carValue: { type: String, required: true },
  premium: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
});

const FleetPolicySchema = new mongoose.Schema({
  propertyType: { type: String, required: true },
  comments: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
});

const ThirdPartyPolicy = InsurancePolicy.discriminator(
  "third-party-motor-insurance",
  ThirdPartyPolicySchema
);
const EnhancedThirdPartyPolicy = InsurancePolicy.discriminator(
  "enhanced-third-party-motor-insurance",
  EnhancedThirdPartyPolicySchema
);
const ComprehensivePolicy = InsurancePolicy.discriminator(
  "comprehensive-motor-insurance",
  ComprehensivePolicySchema
);
const FleetPolicy = InsurancePolicy.discriminator(
  "fleet-motor-insurance",
  FleetPolicySchema
);

module.exports = {
  ThirdPartyPolicy,
  EnhancedThirdPartyPolicy,
  ComprehensivePolicy,
  FleetPolicy,
};
