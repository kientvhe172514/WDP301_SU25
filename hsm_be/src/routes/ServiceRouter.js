const express = require("express");
const multer = require("multer");
const ServiceController = require("../controllers/ServiceController");
const upload = require("../middleware/upload");
const uploads = multer({ storage: upload.storage });
const servicesRouter = express.Router();

servicesRouter.get("/", ServiceController.getAllServices);
servicesRouter.get("/:id", ServiceController.getServiceById);
servicesRouter.post("/", ServiceController.createService);
servicesRouter.put("/:id", ServiceController.updateService);
servicesRouter.delete("/:id", ServiceController.deleteService);
servicesRouter.post(
  "/import",
  upload.single("file"),
  ServiceController.importServicesFromExcel
);
servicesRouter.post(
  "/preview",
  uploads.single("file"),
  ServiceController.previewServicesFromExcel
);
module.exports = servicesRouter;
