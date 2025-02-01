import dotenv from "dotenv";
dotenv.config(); // ✅ Load environment variables at the top

import connectDB from "./db/index.js";
import { app } from "./server.js";

// Connect to MongoDB
connectDB()
.then(() => {
    app.listen(process.env.PORT || 8000, () => {
        console.log(`⚙️  Server is running at port: ${process.env.PORT || 8000}`);
    });
})
  .catch((err) => {
    console.log("❌ MONGO DB connection failed!!!", err);
  });
