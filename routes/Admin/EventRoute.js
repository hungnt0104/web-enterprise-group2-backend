// routes/eventRoutes.js
const express = require("express");
const router = express.Router();
const eventController = require("../../controllers/Admin/EventController");

router.post("/", eventController.createEvent);
router.get("/", eventController.getAllEvents);

module.exports = router;
