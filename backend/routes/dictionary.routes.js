const express = require("express");
const router = express.Router();
const { searchDictionary } = require("../controllers/dictionary.controller");

// GET /api/dictionary/search?q=食べる
router.get("/search", searchDictionary);

module.exports = router;