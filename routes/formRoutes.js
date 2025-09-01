const express = require("express");
const Formdata = require("../models/FormData");

const router = express.Router();

// POST /api/forms/submit - Save form
router.post("/submit", async (req, res) => {
  try {
    const form = await Formdata.create(req.body);
    res.status(201).json({ message: "Form saved", form });
  } catch (err) {
    console.error(err);
    res.status(400).json({ error: "Error saving form" });
  }
});

// GET /api/forms - Fetch all submitted forms
router.get("/", async (req, res) => {
  try {
    const forms = await Formdata.find().sort({ createdAt: -1 });
    res.json(forms);
  } catch (err) {
    res.status(500).json({ error: "Error fetching forms" });
  }
});

module.exports = router;
