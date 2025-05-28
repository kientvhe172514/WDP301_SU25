const express = require("express");
const multer = require("multer");
const AmenityController = require("../controllers/AmenityController");
const upload = require("../middleware/upload");
const uploads = multer({ storage: upload.storage });
const AmenityRouter = express.Router();

AmenityRouter.get("/", AmenityController.getAllAmenities);
AmenityRouter.get("/:id", AmenityController.getAmenityById);
AmenityRouter.post("/", AmenityController.createAmenity);
AmenityRouter.put("/:id", AmenityController.updateAmenity);
AmenityRouter.delete("/:id", AmenityController.deleteAmenity);
AmenityRouter.post(
  "/import",
  upload.single("file"),
  AmenityController.importFromExcel
);
AmenityRouter.post(
  "/preview",
  uploads.single("file"),
  AmenityController.previewAmenities
);

module.exports = AmenityRouter;
