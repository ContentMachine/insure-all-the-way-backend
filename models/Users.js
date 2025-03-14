const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema(
  {
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstLogin: { type: Boolean, default: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
    phone: { type: String, required: true },
    address: { type: String, required: true },
    state: { type: String, required: true },
    createdAt: { type: Date, default: Date.now },
    role: { type: String, default: "user" },
    status: { type: String, default: "active" },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      default: null,
    },
  },
  { timestamps: true }
);

module.exports = {
  Users: mongoose.model("Users", UserSchema),
};
