const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const { Users } = require("../models/Users");
const sendEmail = require("../utils/email");
const jwt = require("jsonwebtoken");

router.post("/sign-up", async (req, res) => {
  try {
    const { email, firstName, lastName, phone, address, state } = req.body;

    if (!email || !firstName || !lastName || !phone || !address || !state) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists." });
    }

    const defaultPassword = `${firstName
      .substring(0, 4)
      ?.toLowerCase()}${lastName.substring(0, 4)?.toLowerCase()}`;
    const hashedPasword = await bcrypt.hash(defaultPassword, 10);

    const newUser = new Users({
      email,
      password: hashedPasword,
      firstLogin: true,
      firstName,
      lastName,
      phone,
      address,
      state,
    });

    await newUser.save();

    const emailText = `Welcome!
Your account has been activated. 

Email: ${email}
Temporary Password: ${defaultPassword}

Please make sure to log in and reset your pasword
`;
    await sendEmail(
      email,
      "Your Insure All The Way Account Details",
      emailText
    );

    res.status(200).json({
      message: "Account created. Check your email for your login details",
    });
  } catch (err) {
    console.log("Error", err);
    res.status(500).json({ error: `Error creating user account: ${err}` });
  }
});

router.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Users.findOne({ email });

    if (!user) return res.status(404).json({ error: "user not found" });

    const isMatch = await bcrypt.compare(password, user?.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    if (user.firstLogin) {
      return res.status(403).json({ message: "Reset your password first" });
    }

    const token = jwt.sign({ userId: user?._id }, process.env.EMAIL_PASS);

    res.json({ token });
  } catch (err) {
    res.status(500).json({ error: "Login error." });
  }
});

router.post("/reset-password", async (req, res) => {
  try {
    const { email, newPassword } = req.body;

    const user = await Users.findOne({ email });

    if (!user) return res.status(404).json({ error: "User not found" });

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.firstLogin = false;

    await user.save();

    res.json({ message: "Passsword Reset Successful. You can now login" });
  } catch (error) {
    res.status(500).json({ error: `Error reseting Password: ${error}` });
  }
});

module.exports = router;
