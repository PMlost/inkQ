const express = require("express");
const cors = require("cors");
const bodyParser = require("body-parser");
const path = require("path");

// Import API routes
const apiRoutes = require("./routes/api");

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files from public directory
app.use(express.static(path.join(__dirname, "public")));

// API routes
app.use("/api", apiRoutes);

// Main route - serve the app
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "public", "index.html"));
});

// API health check
app.get("/api/health", (req, res) => {
  res.json({
    status: "InkSpire API is running!",
    timestamp: new Date(),
    version: "1.0.0",
    endpoints: [
      "GET /api/quotes",
      "GET /api/quotes/:id",
      "GET /api/quotes/category/:category",
      "GET /api/quotes/source/:source",
      "GET /api/quotes/random",
      "GET /api/quotes/daily",
      "GET /api/categories",
      "GET /api/search?q=term",
    ],
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: "Endpoint not found" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 InkSpire server running on http://localhost:${PORT}`);
  console.log(
    `📚 API documentation available at http://localhost:${PORT}/api/health`
  );
});
