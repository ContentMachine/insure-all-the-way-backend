const express = require("express");
const { isAgent, verifyToken } = require("../middleware/auth");
const router = express.Router();
const { Users } = require("../models/Users");
const bcrypt = require("bcrypt");
const sendEmail = require("../utils/email");
const jwt = require("jsonwebtoken");
const { InsurancePolicy } = require("../models/Insurance");
const { Leads } = require("../models/Lead");

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

router.post("/lead", verifyToken, isAgent, async (req, res) => {
  try {
    const agentId = req.user.userId;

    const { name, phone, numberPlate, email, remark } = req.body;

    if (!name || !phone || !numberPlate || !email) {
      return res.status(400).json({ error: "All fields must be filled" });
    }

    const existingLead = await Leads.findOne({ email });

    if (existingLead) {
      if (existingLead) {
        return res
          .status(400)
          .json({ error: "User with this email already exists." });
      }
    }

    const newLead = new Leads({
      name,
      phone,
      numberPlate,
      remark,
      email,
      agent: agentId,
    });

    await newLead.save();

    return res
      .status(200)
      .json({ message: "New Lead added successfully!", lead: newLead });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `There was an error registering lead: ${error}` });
  }
});

router.get("/lead", verifyToken, isAgent, async (req, res) => {
  try {
    const agentId = req.user.userId;

    const leads = await Leads.find({ agent: agentId });

    return res.status(200).json({ leads });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `There was an error getting leads: ${error}` });
  }
});

router.get("/lead/:id", verifyToken, isAgent, async (req, res) => {
  try {
    const agentId = req.user.userId;
    const { id } = req.params;

    const lead = await Leads.findOne({ agent: agentId, _id: id });

    return res.status(200).json({ lead });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `There was an error getting leads: ${error}` });
  }
});

router.get("/stats", isAgent, async (req, res) => {
  try {
    const agentId = req.user.id;

    const policyCount = await InsurancePolicy.countDocuments({
      agent: agentId,
    });

    const leadCount = await Users.countDocuments({
      createdBy: agentId,
      role: "lead",
    });

    const expiredPolicies = await InsurancePolicy.find({
      agent: agentId,
      expiryDate: { $lt: new Date() },
    });

    const convertedLeads = await User.countDocuments({
      createdBy: agentId,
      role: "user",
    });

    return res.json({
      totalPolicies: policyCount,
      totalLeads: leadCount,
      expiredPolicies,
      convertedLeads,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Server error" });
  }
});

router.get("/policies", verifyToken, async (req, res) => {
  try {
    const agentId = req.user.userId;

    const policies = await InsurancePolicy.find({ agent: agentId }).populate(
      "user"
    );

    return res.status(200).json({ policies });
  } catch (error) {
    return res.status(500).json({
      error: `An error occurred while retrieving policies: ${error.message}`,
    });
  }
});

router.get("/policies/:id", verifyToken, async (req, res) => {
  const { id } = req.params;
  const user = req.user?.userId;

  try {
    const policy = await InsurancePolicy.findOne({
      _id: id,
      agent: user,
    })
      .populate({
        path: "agent",
        match: { role: "agent" },
      })
      .populate({ path: "user" });

    res.status(200).json({ policy });
  } catch (error) {
    res
      .status(500)
      .json({ error: `An error occurred while retrieving policies: ${error}` });
  }
});

module.exports = router;
