const express = require("express");
const router = express.Router();
const axios = require("axios");

router.get("/cars", async (req, res) => {
  try {
    const response = await axios.get(
      "https://private-anon-49202d179e-carsapi1.apiary-mock.com/cars"
    );
    res.json(response.data);
  } catch (error) {
    res.status(500).json({ error: `Error fetching cars data: ${error}` });
  }
});

module.exports = router;
