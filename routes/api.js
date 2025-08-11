const express = require("express");
const fs = require("fs");
const path = require("path");
const router = express.Router();

// Helper function to read JSON files
const readJSONFile = (filename) => {
  try {
    const filePath = path.join(__dirname, "..", "data", filename);
    const data = fs.readFileSync(filePath, "utf8");
    return JSON.parse(data);
  } catch (error) {
    console.error(`Error reading ${filename}:`, error);
    return null;
  }
};

// Add this route for date-based daily quotes
router.get("/quotes/daily", (req, res) => {
  console.log("📅 Daily quote endpoint hit");

  try {
    // Read the quotes.json file
    const quotesData = readJSONFile("quotes.json");

    if (!quotesData) {
      console.log("❌ Failed to load quotes.json file");
      return res.status(500).json({ error: "Failed to load quotes data" });
    }

    console.log("✅ Quotes.json loaded successfully");
    console.log(
      "📊 Available quote dates:",
      Object.keys(quotesData.quotes || {})
    );

    // Get today's date in YYYY-MM-DD format
    const today = new Date();
    const dateKey = today.toISOString().split("T")[0];
    console.log(`📅 Looking for quote on date: ${dateKey}`);

    // Check if we have a quote for today
    const todayQuote = quotesData.quotes && quotesData.quotes[dateKey];

    if (todayQuote) {
      console.log(
        `✅ Found quote for ${dateKey}:`,
        todayQuote.text.substring(0, 50) + "..."
      );
      return res.json(todayQuote);
    } else {
      console.log(`⚠️ No quote found for ${dateKey}`);

      // Fallback: return first available quote
      const allQuotes = Object.values(quotesData.quotes || {});
      if (allQuotes.length > 0) {
        console.log(
          `✅ Using fallback quote:`,
          allQuotes[0].text.substring(0, 50) + "..."
        );
        return res.json(allQuotes[0]);
      } else {
        console.log(`❌ No quotes available at all`);
        return res.status(404).json({ error: "No quotes available" });
      }
    }
  } catch (error) {
    console.error("❌ Server error:", error);
    return res
      .status(500)
      .json({ error: "Internal server error: " + error.message });
  }
});

module.exports = router;
