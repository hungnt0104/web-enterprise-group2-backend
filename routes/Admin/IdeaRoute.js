// routes/ideaRoutes.js
const express = require("express");
const router = express.Router();
const ideaController = require("../../controllers/Admin/IdeaController");

router.post("/", ideaController.submitIdea);
router.get("/", ideaController.getAllIdeas);

module.exports = router;