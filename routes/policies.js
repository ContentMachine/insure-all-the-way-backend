const express = require("express");
const router = express.Router();
const authMiddleware = require("../middleware/auth");
const multer = require("multer");
const {
  ThirdPartyPolicy,
  EnhancedThirdPartyPolicy,
  FleetPolicy,
  ComprehensivePolicy,
} = require("../models/MotorInsurance");
const { Users } = require("../models/Users");
const sendEmail = require("../utils/email");
const bcrypt = require("bcrypt");
const streamifier = require("streamifier");
const cloudinary = require("../config/cloudinary");
const upload = multer({ storage: multer.memoryStorage() });
const { insurances } = require("../data/insurance");
const { capitalizeEachWord } = require("../helpers/capitalize");
const { InsurancePolicy, InsuranceClaims } = require("../models/Insurance");
const axios = require("axios");

router.post(
  "/policy/:type/:subType",
  upload.fields([
    { name: "proofOfOwnership", maxCount: 1 },
    { name: "id", maxCount: 1 },
  ]),
  async (req, res) => {
    const { type, subType } = req.params;
    const {
      email,
      firstName,
      lastName,
      phone,
      address,
      state,
      registrationNumber,
      chasisNumber,
      roadWorthiness,
      plan,
      makeOfVehicle,
      yearOfMake,
      modelOfVehicle,
      startDate,
      endDate,
      engineNumber,
      color,
      vehicleType,
      carValue,
      premium,
      propertyType,
      comments,
      inspectionState,
      inspectionAddress,
      dateForInspection,
      contactName,
      contactPhone,
    } = req.body;

    try {
      let user = await Users.findOne({ email });

      if (!user) {
        const defaultPassword = `${firstName
          .substring(0, 4)
          ?.toLowerCase()}${lastName.substring(0, 4)?.toLowerCase()}`;
        const hashedPasword = await bcrypt.hash(defaultPassword, 10);

        user = new Users({
          email,
          password: hashedPasword,
          firstLogin: true,
          firstName,
          lastName,
          phone,
          address,
          state,
        });

        await user.save();

        const emailText = `Welcome, ${firstName}!
      Your account has been activated. 
      
      Email: ${email}
      Default Password: ${defaultPassword}
      
      Please make sure to log in and reset your pasword
      `;
        await sendEmail(
          email,
          "Your Insure All The Way Account Details",
          emailText
        );
      }

      if (type === "motor-insurance") {
        if (subType === "third-party-motor-insurance") {
          const insurancePolicy = new ThirdPartyPolicy({
            user: user._id,
            registrationNumber,
            chasisNumber,
            roadWorthiness,
            plan,
            status: "active",
            startDate,
            endDate,
          });

          await insurancePolicy.save();
        } else if (subType === "enhanced-third-party-motor-insurance") {
          const files = req.files;
          if (!files || !files.proofOfOwnership || !files.id) {
            return res
              .status(400)
              .json({ message: "Both files are required." });
          }

          const uploadFile = (fileBuffer) =>
            new Promise((resolve, reject) => {
              const stream = cloudinary.uploader.upload_stream(
                { folder: "enhanced-third-party-motor-insurance" },
                (error, result) => {
                  if (error) return reject(error);
                  resolve(result);
                }
              );
              streamifier.createReadStream(fileBuffer).pipe(stream);
            });

          const [proofResult, idResult] = await Promise.all([
            uploadFile(files.proofOfOwnership[0].buffer),
            uploadFile(files.id[0].buffer),
          ]);

          const insurancePolicy = new EnhancedThirdPartyPolicy({
            user: user?._id,
            makeOfVehicle,
            yearOfMake,
            modelOfVehicle,
            startDate,
            endDate,
            registrationNumber,
            engineNumber,
            chasisNumber,
            color,
            vehicleType,
            proofOfOwnership: proofResult.secure_url,
            id: idResult.secure_url,
            plan,
            status: "active",
            inspectionState,
            inspectionAddress,
            dateForInspection,
            contactName,
            contactPhone,
          });

          await insurancePolicy.save();
        } else if (subType === "comprehensive-motor-insurance") {
          const insurancePolicy = new ComprehensivePolicy({
            user: user?._id,
            carValue,
            premium,
            startDate,
            endDate,
            registrationNumber,
            status: "active",
          });

          await insurancePolicy.save();
        } else if (subType === "fleet-motor-insurance") {
          const insurancePolicy = new FleetPolicy({
            user: user?._id,
            propertyType,
            comments,
            startDate,
            endDate,
            status: "pending",
          });

          await insurancePolicy.save();
        } else {
          return res.status(400).json({
            error: `This insurance type does not exist under ${type}`,
          });
        }
      }

      res.status(200).json({ message: "Policy Created successfully" });
    } catch (error) {
      res.status(500).json({
        error: `An error occurred while processing the policy: ${error}`,
      });
    }
  }
);

router.get("/policy/:type", async (req, res) => {
  try {
    const { type } = req.params;

    const isTypeExists = insurances.find((data) => data?.id === type);

    if (!isTypeExists) {
      return res
        .status(404)
        .json({ error: "This insurance type does not exist" });
    }

    const insuranceData = insurances?.find((data) => data?.id === type);

    res.status(200).json({
      ...insuranceData,
      types: insuranceData?.types?.map((data) => {
        return {
          ...data,
          name: capitalizeEachWord(data?.id?.replaceAll("-", " ")),
        };
      }),
      name: capitalizeEachWord(insuranceData?.id?.replaceAll("-", " ")),
    });
  } catch (error) {
    res.status(500).json({ error: `Error getting insurance type: ${error}` });
  }
});

router.get("/policy/:type/:subType", async (req, res) => {
  try {
    const { type, subType } = req.params;

    const isTypeExists = insurances
      .find((data) => data?.id === type)
      ?.types?.find((type) => type?.id === subType);

    if (!isTypeExists) {
      return res
        .status(404)
        .json({ error: "This insurance type or subtype does not exist" });
    }

    const insuranceData = insurances
      .find((data) => data?.id === type)
      ?.types?.find((type) => type?.id === subType);

    res.status(200).json({
      ...insuranceData,
      name: capitalizeEachWord(insuranceData?.id?.replaceAll("-", " ")),
      types: insuranceData?.types?.map((data) => {
        return {
          ...data,
          name: capitalizeEachWord(insuranceData?.id?.replaceAll("-", " ")),
        };
      }),
    });
  } catch (error) {
    res.status(500).json({ error: `Error getting insurance type: ${error}` });
  }
});

router.get("/user/policy", authMiddleware, async (req, res) => {
  try {
    const policies = await InsurancePolicy.find({ user: req.user.userId });
    res.status(200).json({ policies });
  } catch (error) {
    console.error("Error retrieving user policies:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving policies" });
  }
});

router.get("/user/policy/:id", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const user = req.user?.userId;

  try {
    const policy = await InsurancePolicy.findOne({ _id: id, user });

    res.status(200).json({ policy });
  } catch (error) {
    console.error("Error retrieving policy details:", error);
    res
      .status(500)
      .json({ error: "An error occurred while retrieving policies" });
  }
});

router.get("/user/summary", authMiddleware, async (req, res) => {
  const { id } = req.params;
  const user = req.user?.userId;

  try {
    const policy = await InsurancePolicy.find({ user });
    const today = new Date();
    const policiesHeld = policy.length;
    const policiesOverdue = policy.filter((data) => {
      const date = new Date(data?.endDate);
      const differenceInMs = date - today;
      const differenceInDays = differenceInMs / (1000 * 60 * 60 * 24);

      return differenceInDays < 1;
    }).length;
    const pendingPolicies = policy?.filter((data) => {
      return data?.status === "pending";
    }).length;

    res.status(200).json({ policiesHeld, policiesOverdue, pendingPolicies });
  } catch (error) {
    console.error("Error retrieving policy stats:", error);
    res.status(500).json({
      error: "An error occurred while retrieving policies statistics",
    });
  }
});

router.post("/policy/claim", authMiddleware, async (req, res) => {
  try {
    const {
      insuranceId,
      vehicleRegistrationNumber,
      dateAndTime,
      location,
      narration,
    } = req.body;

    if (!insuranceId || !dateAndTime || !narration) {
      return res.status(400).json({
        message: "Either Insurance id or Date and Time or Narration is missing",
      });
    }

    const insuranceClaims = new InsuranceClaims({
      insuranceId,
      vehicleRegistrationNumber,
      dateAndTime,
      location,
      narration,
    });

    await insuranceClaims.save();

    return res
      .status(200)
      .json({ message: "Policy claim was made successfully" });
  } catch (error) {
    res.status(500).json({
      error: `There was an error making a claim for this policy: ${error}`,
    });
  }
});

module.exports = router;
