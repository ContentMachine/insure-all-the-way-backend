const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const mongoose = require("mongoose");
const authRoutes = require("./routes/auth");

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

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Routes
// Base route
app.get("/", (req, res) => {
  res.send("Insure All The Way is Running");
});

app.use("/api/auth", authRoutes);

// Start server
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
