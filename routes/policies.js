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
      vehicleNumber,
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
            vehicleNumber,
            roadWorthiness,
            plan,
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
          });

          await insurancePolicy.save();
        } else if (subType === "comprehensive-motor-insurance") {
          const insurancePolicy = new ComprehensivePolicy({
            user: user?._id,
            carValue,
            premium,
            startDate,
            endDate,
          });

          await insurancePolicy.save();
        } else if (subType === "fleet-motor-insurance") {
          const insurancePolicy = new FleetPolicy({
            user: user?._id,
            propertyType,
            comments,
            startDate,
            endDate,
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

module.exports = router;
