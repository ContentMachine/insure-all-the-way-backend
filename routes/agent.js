const express = require("express");
const { isAgent } = require("../middleware/auth");
const router = express.Router();
const { Users } = require("../models/Users");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/email");
const jwt = require("jsonwebtoken");

router.post("/sign-up", async (req, res) => {
  try {
    const { email, password, firstName, lastName, phone, address, state } =
      req.body;

    if (
      !email ||
      !password ||
      !firstName ||
      !lastName ||
      !phone ||
      !address ||
      !state
    ) {
      return res.status(400).json({ error: "Please fill all fields" });
    }

    const existingUser = await Users.findOne({ email, role: "agent" });

    if (existingUser) {
      return res.status(400).json({ error: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const newAgent = new Users({
      email,
      password,
      firstName,
      lastName,
      phone,
      address,
      role: "agent",
      state,
      password: hashedPassword,
    });

    await newAgent.save();

    const emailText = `
Hi ${firstName},

Welcome to Insure All the Way! We're thrilled to have you on board as a valued agent.

Your role is simple but powerful; connect with leads, guide them through their insurance needs, and help them secure the right policy. 

The best part? You earn while making a difference in people's lives.

Here’s what you need to get started:

✅ Your login credentials: 
    Email: ${email}
    Password: Please refer to the password you used to sign up.
✅ Access your dashboard: https://insure-all-the-way-agent-frontend.vercel.app

If you have any questions, our support team is here to help. Let’s get you started on turning leads into happy, insured customers!

We can’t wait to see you succeed!

Best regards,
Insure All the Way Team.
`;

    await sendEmail(
      email,
      "Welcome Aboard! Your Journey with Insure All the Way Begins 🚀",
      emailText
    );

    return res.status(200).json({
      message: "Agent Account created!",
    });
  } catch (error) {
    res.status(500).json({ error: `Error creating agent account: ${error}` });
  }
});

router.post("/sign-in", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await Users?.findOne({ email, role: "agent" });

    if (!user) return res.status(400).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user?.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user?._id, role: user?.role },
      process.env.EMAIL_PASS
    );

    return res.json({
      token,
      user: {
        email: user?.email,
        firstName: user?.firstName,
        lastName: user?.lastName,
        phone: user?.phone,
        address: user?.address,
        state: user?.state,
        role: user?.role,
      },
    });
  } catch (error) {}
});

module.exports = router;
