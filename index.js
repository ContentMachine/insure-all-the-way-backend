const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");
const policiesRoutes = require("./routes/policies");
const scraper = require("./routes/scraper");
const admin = require("./routes/admin");
const externals = require("./routes/external");
// Mongo DB
mongoose
  .connect(process.env.MONGO_DB_CONNECTION_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("Connected to MongoDB"))
  .catch((error) => console.error("MongoDB connection error:", error));

const app = express();
const PORT = process.env.PORT || 5001;

app.use(function (req, res, next) {
  const allowedOrigins = [
    "http://localhost:3000",
    "http://localhost:3001",
    "https://insure-all-the-way-frontend.vercel.app",
  ];
  const origin = req.headers.origin;
  if (allowedOrigins.includes(origin)) {
    res.setHeader("Access-Control-Allow-Origin", origin);
  }
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.header("Access-Control-Allow-credentials", true);
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, UPDATE");
  next();
});

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
// Base route
app.get("/", (req, res) => {
  res.send("Insure All The Way is Running");
});

app.use("/api/auth", authRoutes);
app.use("/api/policies", policiesRoutes);
app.use("/api/scrape", scraper);
app.use("/api/externals", externals);
app.use("/api/admin", admin);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
