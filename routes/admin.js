const express = require("express");
const router = express.Router();
const { InsurancePolicy, InsuranceClaims } = require("../models/Insurance");
const { Users } = require("../models/Users");
const Agent = require("../models/Agent");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { isAdmin, verifyToken } = require("../middleware/auth");
const sendEmail = require("../utils/email");
const multer = require("multer");
const { uploadFile } = require("../helpers/uploadFile");
const { insurances } = require("../data/insurance");

const upload = multer({ storage: multer.memoryStorage() });

router.post("/sign-up", async (req, res) => {
  try {
    const {
      email,
      firstName,
      lastName,
      phone,
      address,
      state,
      role,
      password,
    } = req.body;

    if (
      !email ||
      !firstName ||
      !lastName ||
      !phone ||
      !address ||
      !state ||
      !role ||
      !password
    ) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const existingUser = await Users.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ error: "User with this email already exists." });
    }

    const hashedPasword = await bcrypt.hash(password, 10);

    const newUser = new Users({
      email,
      password: hashedPasword,
      firstName,
      lastName,
      phone,
      address,
      state,
      role,
    });

    await newUser.save();

    const emailText = `
Hi ${firstName},

We’re excited to inform you that your new admin account has been successfully created! You now have access to our secure admin portal, where you can manage settings, monitor activities, and oversee various administrative tasks.

To get started, please sign in using the following link: https://insure-all-the-way-admin-frontend.vercel.app/

Should you have any questions or need assistance, feel free to reach out to our support team at info@insurealltheway.com.

Welcome aboard, and we look forward to your contributions!

Best regards,
      `;

    await sendEmail(
      email,
      "Your Insure All The Way Admin Account Has Been Created!",
      emailText
    );

    return res.status(200).json({
      message: "Account created.",
    });
  } catch (err) {
    res.status(500).json({ error: `Error creating user account: ${err}` });
  }
});

router.post("/sign-in", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await Users.findOne({ email, role: "admin" });

    if (!user) return res.status(404).json({ error: "User not found" });

    const isMatch = await bcrypt.compare(password, user?.password);
    if (!isMatch) return res.status(400).json({ error: "Invalid credentials" });

    const token = jwt.sign(
      { userId: user?._id, role: user.role },
      process.env.EMAIL_PASS
    );

    res.json({
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
  } catch (err) {
    res.status(500).json({ error: `Login error: ${err}` });
  }
});

router.get("/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const [policies, claims, users] = await Promise.all([
      InsurancePolicy.find({}),
      InsuranceClaims.find({}),
      Users.find({ role: "user" }),
    ]);

    const data = {
      policies: policies.length,
      claims: claims.length,
      users: users.length,
    };

    return res.status(200).json({ data });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `An error occured while gettinng summary: ${error}` });
  }
});

router.get("/users", verifyToken, isAdmin, async (req, res) => {
  try {
    const { search } = req.query;

    let users = await Users.find({ role: "user" }).select("-password");

    if (search) {
      const searchLower = search?.toLowerCase();
      users = users?.filter((data) => {
        const firstName = data?.firstName ? data?.firstName?.toLowerCase() : "";
        const lastName = data?.lastName ? data?.lastName?.toLowerCase() : "";
        const email = data?.email ? data?.email?.toLowerCase() : "";

        return (
          firstName.includes(search) ||
          lastName?.includes(searchLower) ||
          email?.includes(searchLower)
        );
      });
    }

    return res.status(200).json({ users });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `An error occured while gettinng users: ${error}` });
  }
});

router.get("/users/:id", verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    const user = await Users.findOne({ role: "user", _id: id }).select(
      "-password"
    );

    return res.status(200).json({ user });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `An error occured while gettinng summary: ${error}` });
  }
});

router.get("/users/user/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const users = await Users.find({ role: "user" }).select("-password");
    const allUsers = users?.length;
    const activeUsers = users?.filter(
      (data) => data?.status === "active"
    )?.length;
    const inActiveUsers = users?.filter(
      (data) => data?.status === "inactive"
    )?.length;

    return res.status(200).json({ allUsers, activeUsers, inActiveUsers });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `An error occured while gettinng summary: ${error}` });
  }
});

router.patch(
  "/users/:id/toggle-status",
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const user = await Users.findById(id);

      if (!user) return res.status(404).json({ error: "User not found." });

      user.status = user.status === "active" ? "inactive" : "active";

      await user.save();
      return res
        .status(200)
        .json({ message: `User status toggled to ${user.status}.` });
    } catch (error) {
      return res.status(500).json({
        error: `An error occurred while toggling status: ${error.message}`,
      });
    }
  }
);

router.get("/policies", verifyToken, isAdmin, async (req, res) => {
  try {
    let policies = await InsurancePolicy.find({})
      .populate("user")
      .sort({ endDate: 1 });

    const { insuranceType, search } = req.query;

    if (insuranceType) {
      const insuranceMapping = insurances.reduce((acc, insurance) => {
        const key = insurance.id;
        acc[key] = insurance.types.map((type) => type.id.toLowerCase());
        return acc;
      }, {});

      const typeKey = insuranceType.toLowerCase();
      const validTypes = insuranceMapping[typeKey];

      if (validTypes) {
        policies = policies.filter((policy) =>
          validTypes.includes(policy.insuranceType.toLowerCase())
        );
      } else {
        return res.status(400).json({ error: "Invalid insurance type" });
      }
    }

    if (search) {
      const searchLower = search.toLowerCase();
      policies = policies.filter((policy) => {
        const user = policy.user || {};
        const firstName = user.firstName ? user.firstName.toLowerCase() : "";
        const lastName = user.lastName ? user.lastName.toLowerCase() : "";
        const endDate = policy.endDate
          ? new Date(policy.endDate).toISOString()
          : "";

        return (
          firstName.includes(searchLower) ||
          lastName.includes(searchLower) ||
          endDate.includes(searchLower)
        );
      });
    }

    const today = new Date();
    const policiesWithDaysLeft = policies.map((policy) => {
      const endDate = new Date(policy.endDate);
      const diffTime = endDate - today;
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      return {
        ...policy.toObject(),
        daysLeft,
      };
    });

    return res.status(200).json({ policies: policiesWithDaysLeft });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `An error occurred while getting policies: ${error}` });
  }
});

router.get("/policies/:id", verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const policy = await InsurancePolicy.findOne({ _id: id }).populate("user");
    return res.status(200).json({ policy });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `An error occured while getting policies: ${error}` });
  }
});

router.get("/policies/policy/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    let policies = await InsurancePolicy.find({});
    const { insuranceType } = req.query;

    if (insuranceType) {
      const insuranceMapping = insurances.reduce((acc, insurance) => {
        const key = insurance.id;
        acc[key] = insurance.types.map((type) => type.id.toLowerCase());
        return acc;
      }, {});

      const typeKey = insuranceType.toLowerCase();
      const validTypes = insuranceMapping[typeKey];

      if (validTypes) {
        policies = policies.filter((policy) =>
          validTypes.includes(policy.insuranceType.toLowerCase())
        );
      } else {
        return res.status(400).json({ error: "Invalid insurance type" });
      }
    }

    const policiesLength = policies.length;
    const pendingPolicies = policies.filter(
      (data) => data.status === "pending"
    ).length;
    const activePolicies = policies.filter(
      (data) => data.status === "active"
    ).length;

    const today = new Date();
    const expiredPolicies = policies.filter((policy) => {
      const endDate = new Date(policy.endDate);
      const diffTime = endDate - today;
      const daysLeft = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
      return daysLeft < 1;
    }).length;

    return res.status(200).json({
      policiesLength,
      pendingPolicies,
      activePolicies,
      expiredPolicies,
    });
  } catch (error) {
    return res.status(500).json({
      error: `An error occurred while getting policies: ${error}`,
    });
  }
});

router.post("/agents", verifyToken, isAdmin, async (req, res) => {
  try {
    const { name, phoneNumber, email } = req.body;

    if (!name || !phoneNumber) {
      return res
        .status(400)
        .json({ error: "Name and phone number are required" });
    }

    const newAgent = new Agent({ name, phoneNumber, email });
    await newAgent.save();

    const emailText = `Good day, ${name}!
    You have been added as an agent on Insure All the Way. 
    
    Email: ${email}
    Full Name: ${name}
    Phone: ${phoneNumber}

    
    You will be notified when policies are assigned to you! 

    Best regards, 
    `;

    await sendEmail(
      email,
      "Your Are Now An Agent On Insure All The Way",
      emailText
    );

    return res
      .status(201)
      .json({ message: "Agent created successfully", agent: newAgent });
  } catch (error) {
    res
      .status(500)
      .json({ error: `An error occurred while creating the agent: ${error}` });
  }
});

router.get("/agents", verifyToken, isAdmin, async (req, res) => {
  try {
    const agents = await Agent.find({});

    res.status(200).json({ agents });
  } catch (error) {
    res
      .status(500)
      .json({ error: `An error occurred while getting agents: ${error}` });
  }
});

router.patch(
  "/policies/:policyId/reassign-agent",
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {
      const { policyId } = req.params;
      const { agentId } = req.body;

      if (!agentId) {
        return res.status(400).json({ error: "Agent ID is required" });
      }

      const agent = await Agent.findById(agentId);
      if (!agent) {
        return res.status(404).json({ error: "Agent not found" });
      }

      const updatedPolicy = await InsurancePolicy.findByIdAndUpdate(
        policyId,
        {
          agent: {
            id: agent._id,
            name: agent.name,
            phoneNumber: agent.phoneNumber,
          },
        },
        { new: true }
      );

      if (!updatedPolicy) {
        return res.status(404).json({ error: "Policy not found" });
      }

      res.status(200).json({
        message: "Agent reassigned successfully",
        policy: updatedPolicy,
      });
    } catch (error) {
      res.status(500).json({
        error: "An error occurred while reassigning the agent.",
      });
    }
  }
);

router.patch(
  "/policies/:policyId",
  upload.fields([{ name: "certificate", maxCount: 1 }]),
  verifyToken,
  isAdmin,
  async (req, res) => {
    const { policyId } = req.params;
    const files = req.files;

    try {
      if (!policyId) {
        return res.status(400).json({ message: "Policy Id is Missing" });
      }

      if (!files) {
        return res.status(400).json({ message: "Please select a valid file" });
      }

      const [certificate] = await Promise.all([
        uploadFile(
          files?.certificate[0].buffer,
          "insuranceCertificates",
          "raw"
        ),
      ]);

      const policy = await InsurancePolicy.findById(policyId);

      if (!policy) {
        return res.status(200).json({ error: "Policy not found" });
      }

      policy.certificate = certificate?.secure_url;

      await policy.save();

      return res
        .status(200)
        .json({ message: "Policy Certificate uploaded successfully!", policy });
    } catch (error) {
      res.status(500).json({
        error: `An error occurred while uploading policy certificate: ${error}`,
      });
    }
  }
);

router.patch(
  "/policies/:id/toggle-status",
  verifyToken,
  isAdmin,
  async (req, res) => {
    try {
      const { id } = req.params;
      const policy = await InsurancePolicy.findById(id);

      if (!policy) return res.status(404).json({ error: "User not found." });

      policy.status = policy.status === "pending" ? "active" : "pending";

      await policy.save();
      return res
        .status(200)
        .json({ message: `Policy status toggled to ${policy.status}.` });
    } catch (error) {
      return res.status(500).json({
        error: `An error occurred while toggling status: ${error.message}`,
      });
    }
  }
);

router.get("/claims", verifyToken, isAdmin, async (req, res) => {
  try {
    const claims = await InsuranceClaims.find({})
      .populate("user")
      .populate("insuranceId");

    res.status(200).json({ claims });
  } catch (error) {
    res
      .status(500)
      .json({ error: `An error occurred while getting claims: ${error}` });
  }
});

router.get("/claims/:id", verifyToken, isAdmin, async (req, res) => {
  const { id } = req.params;
  try {
    const claim = await InsuranceClaims.findOne({ _id: id })
      .populate("insuranceId")
      .populate("user");

    res.status(200).json({ claim });
  } catch (error) {
    res
      .status(500)
      .json({ error: `An error occurred while getting claims: ${error}` });
  }
});

router.get("/claims/claim/stats", verifyToken, isAdmin, async (req, res) => {
  try {
    const claims = await InsuranceClaims.find({});
    const claimsLength = claims?.length;
    const pendingClaims = claims?.filter(
      (data) => data?.status === "unresolved"
    )?.length;
    const activeClaims = claims?.filter(
      (data) => data?.status === "resolved"
    )?.length;

    return res.status(200).json({ claimsLength, pendingClaims, activeClaims });
  } catch (error) {
    return res
      .status(500)
      .json({ error: `An error occured while getting claims: ${error}` });
  }
});

router.patch(
  "/claims/:id/toggle-status",
  verifyToken,
  isAdmin,
  async (req, res) => {
    const { id } = req.params;
    try {
      const claim = await InsuranceClaims.findById(id);

      if (!claim) return res.status(404).json({ error: "Claim not found." });

      claim.status = claim.status === "unresolved" ? "resolved" : "unresolved";

      await claim.save();

      res
        .status(200)
        .json({ message: `Claim status toggled to ${claim.status}.` });
    } catch (error) {
      res
        .status(500)
        .json({ error: `An error occurred while updating claim: ${error}` });
    }
  }
);

router.get("/analytics/combined", verifyToken, isAdmin, async (req, res) => {
  try {
    const currentYear = new Date().getFullYear();
    const startOfYear = new Date(currentYear, 0, 1);
    const startOfNextYear = new Date(currentYear + 1, 0, 1);
    const monthNames = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    const fillMonthlyData = (aggregationResult) => {
      const monthlyData = {};
      for (let m = 1; m <= 12; m++) {
        monthlyData[m] = 0;
      }
      aggregationResult.forEach((doc) => {
        monthlyData[doc._id] = doc.count;
      });
      return monthlyData;
    };

    const usersAgg = await Users.aggregate([
      { $match: { createdAt: { $gte: startOfYear, $lt: startOfNextYear } } },
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
    ]);
    const usersPerMonth = fillMonthlyData(usersAgg);

    const policiesAgg = await InsurancePolicy.aggregate([
      { $match: { createdAt: { $gte: startOfYear, $lt: startOfNextYear } } },
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
    ]);
    const policiesPerMonth = fillMonthlyData(policiesAgg);

    const claimsAgg = await InsuranceClaims.aggregate([
      { $match: { createdAt: { $gte: startOfYear, $lt: startOfNextYear } } },
      { $group: { _id: { $month: "$createdAt" }, count: { $sum: 1 } } },
    ]);
    const claimsPerMonth = fillMonthlyData(claimsAgg);

    const monthlyData = [];
    for (let m = 1; m <= 12; m++) {
      monthlyData.push({
        name: monthNames[m - 1],
        policies: policiesPerMonth[m],
        claims: claimsPerMonth[m],
        users: usersPerMonth[m],
      });
    }

    const topUsersAgg = await InsuranceClaims.aggregate([
      {
        $group: {
          _id: "$user",
          totalClaims: { $sum: 1 },
        },
      },
      { $sort: { totalClaims: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "users",
          localField: "_id",
          foreignField: "_id",
          as: "userDetails",
        },
      },
      { $unwind: "$userDetails" },
    ]);

    const insuranceTypesAgg = await InsurancePolicy.aggregate([
      {
        $group: {
          _id: "$insuranceType",
          count: { $sum: 1 },
        },
      },
    ]);
    const insuranceTypes = {};
    insuranceTypesAgg.forEach((doc) => {
      insuranceTypes[doc._id] = doc.count;
    });

    return res.status(200).json({
      monthlyData,
      topUsers: topUsersAgg,
      insuranceTypes,
    });
  } catch (error) {
    console.error("Error generating combined analytics:", error);
    return res.status(500).json({
      error: `Error generating combined analytics: ${error.message}`,
    });
  }
});

module.exports = router;
