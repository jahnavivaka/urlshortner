require("dotenv").config();
const express = require("express");
const ShortUrl = require("./models/shortUrl");
const connectDb = require("./config/database");
const cors = require("cors");

const app = express();

app.use(cors({
    origin:"*"
})); 
app.use(express.json()); 
app.use(express.urlencoded({ extended: false }));


app.get("/shortUrls", async (req, res) => {
  try {
    const shortUrls = await ShortUrl.find();
    res.json(shortUrls); // 🔥 Send JSON to frontend
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch short URLs" });
  }
});


app.post("/shortUrls", async (req, res) => {
  try {
    console.log(req.body.fullUrl);
    const newUrl = await ShortUrl.create({ full: req.body.fullUrl });
    res.status(201).json(newUrl); 
  } catch (err) {
    res.status(500).json({ error: "Failed to create short URL" });
  }
});

app.get("/:shortUrl", async (req, res) => {
  try {
    const shortUrl = await ShortUrl.findOne({ short: req.params.shortUrl });
    if (!shortUrl) return res.sendStatus(404);

    shortUrl.clicks++;
    await shortUrl.save();

    res.redirect(shortUrl.full);
  } catch (err) {
    res.status(500).json({ error: "Something went wrong with redirect" });
  }
});


connectDb()
  .then(() => {
    app.listen(process.env.PORT || 8000, () =>
      console.log(`✅ Server running on port ${process.env.PORT || 8000}`)
    );
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
  });
