const express = require("express");
const router = express.Router();
const puppeteer = require("puppeteer");
const formatScrappedData = require("../helpers/parseScrappedText");

router.post("/ask-niid", async (req, res) => {
  const { policyNumber } = req.body; // Get user input from frontend

  if (!policyNumber) {
    return res.status(400).json({ error: "Policy number is required" });
  }

  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();

  try {
    await page.goto("https://askniid.org/verifypolicy.aspx", {
      timeout: 60000,
    });

    page.setDefaultTimeout(60000);
    page.setDefaultNavigationTimeout(30000);

    await page.waitForSelector("#ContentPlaceHolder1_drpOption");
    await page.select("#ContentPlaceHolder1_drpOption", "Single");

    await page.waitForSelector("#ContentPlaceHolder1_rblNumber_1");
    await page.click("#ContentPlaceHolder1_rblNumber_1");

    await page.waitForSelector("#ContentPlaceHolder1_txtNumber");
    await page.type("#ContentPlaceHolder1_txtNumber", policyNumber);

    await page.click("#ContentPlaceHolder1_btnSearch");

    await page.waitForSelector("#ContentPlaceHolder1_TB_FleetPolicy", {
      timeout: 30000,
    });

    // Extract data from the table
    const policyData = await page.evaluate(() => {
      const table = document.querySelector(
        "#ContentPlaceHolder1_TB_FleetPolicy"
      );
      return table ? table.innerText.trim() : "No data found";
    });

    await browser.close();

    return res.status(200).json({ policyData: formatScrappedData(policyData) });
  } catch (error) {
    await browser.close();
    return res
      .status(500)
      .json({ error: "Failed to fetch data", details: error.message });
  }
});

module.exports = router;
