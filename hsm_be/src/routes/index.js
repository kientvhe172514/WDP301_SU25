const express = require("express");
const AmenityRouter = require("./AmenityRouter");
const servicesRouter = require("./ServiceRouter");

const router = express.Router();

router.use("/api/amenities", AmenityRouter);
router.use("/api/services", servicesRouter);

module.exports = router;
