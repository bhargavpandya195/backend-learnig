import express from "express";
import dotenv from 'dotenv';

dotenv.config();

const app = express();

app.get("/", (req, res) => {
  res.send("server is ready to launch .. 🚀");
});

// Set the port
const port = process.env.PORT || 3000;

// Start the server
app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
}); 
