const mongoose = require("mongoose");

const LeadSchema = mongoose.Schema({
  name: { type: String, required: true },
  phone: { type: String, required: true },
  numberPlate: { type: String, required: true },
  remark: { type: String, required: false },
  email: { type: String, required: true },
  agent: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Agent",
    required: true,
  },
});

module.exports = { Leads: mongoose.model("Leads", LeadSchema) };
