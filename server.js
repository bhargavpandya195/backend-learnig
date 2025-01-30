import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import connectDB from "./db/index.js";

dotenv.config();

const app = express();

// Connect to Database
connectDB();

// Middleware
const corsOptions = {
  origin: ["http://localhost:5173", "https://your-frontend-domain.com"], // Add allowed origins here
  methods: "GET,POST,PUT,DELETE",
  credentials: true, // Allow cookies and authentication headers
};
app.use(cors(corsOptions)); // Enable CORS
app.use(express.json()); // Parse JSON request body
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request body


// Serve static files from the 'public' directory
const __dirname = path.resolve(); // Get absolute path
app.use(express.static(path.join(__dirname, "public")));

// Routes
app.get("/", (req, res) => {
  res.send("Server is ready to launch .. 🚀");
});

// Set the port
const port = process.env.PORT || 3000;

// Start the server
app.listen(port, () => {
  console.log(`✅ Server is running on http://localhost:${port}`);
});
