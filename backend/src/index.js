const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const path = require("path");
const mongoose = require("mongoose");
const dns = require("node:dns");

// Routes
const photoRoutes = require("./routes/photoRoutes.js");
const albumRoutes = require("./routes/albumRoutes.js");

dotenv.config({ path: path.resolve(__dirname, "..", ".env") });

if (process.env.MONGODB_URI?.startsWith("mongodb+srv")) {
  dns.setServers(["1.1.1.1", "8.8.8.8"]);
}

const app = express();
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173",
  }),
);

const PORT = process.env.PORT || 5000;

mongoose
  .connect(process.env.MONGODB_URI, {
    dbName: "Gphotos",
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.error("MongoDB connection error:", err));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api/photos", photoRoutes);
app.use("/api/albums", albumRoutes);
