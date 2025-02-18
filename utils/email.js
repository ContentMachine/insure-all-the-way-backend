const nodemailer = require("nodemailer");
require("dotenv").config();

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env?.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text) => {
  try {
    await transporter.sendMail({
      from: `"Insure All The Way" <${process?.env?.EMAIL_USER}>`,
      to,
      subject,
      text,
    });

    console.log(`Email sent to ${to}`);
  } catch (error) {
    console.error("Error sending email", error);
  }
};

module.exports = sendEmail;
