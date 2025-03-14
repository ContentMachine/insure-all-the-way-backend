const express = require("express");
const router = express.Router();
const sendEmail = require("../utils/email");
const { verifyToken } = require("../middleware/auth");
const multer = require("multer");
const upload = multer({ dest: "uploads/" });

router.post(
  "/send-email",
  verifyToken,
  upload.array("attachments", 5),
  async (req, res) => {
    try {
      const { recipient, subject, body } = req.body;

      if (!recipient || !subject || !body) {
        return res.status(400).json({ error: "Missing required fields" });
      }

      const attachments =
        req.files?.map((file) => ({
          filename: file.originalname,
          path: file.path,
        })) || [];

      const emailResponse = await sendEmail(
        recipient,
        subject,
        body,
        attachments
      );

      if (emailResponse.success) {
        return res.status(200).json({ message: "Email sent successfully!" });
      } else {
        return res.status(500).json({ error: emailResponse.error });
      }
    } catch (error) {
      console.error("Email sending error:", error);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);

module.exports = router;
