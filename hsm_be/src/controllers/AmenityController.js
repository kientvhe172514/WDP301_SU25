const AmenityServices = require("../services/AmenityServices");

exports.getAllAmenities = async (req, res) => {
  try {
    const amenities = await AmenityServices.getAllAmenities();
    res.status(200).json(amenities);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.getAmenityById = async (req, res) => {
  try {
    const { id } = req.params;
    const amenity = await AmenityServices.getAmenityById(id);
    if (amenity.status === "ERROR") {
      return res.status(404).json(amenity);
    }
    res.status(200).json(amenity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.createAmenity = async (req, res) => {
  try {
    const amenity = req.body;
    const newAmenity = await AmenityServices.createAmenity(amenity);
    if (newAmenity.status === "ERROR") {
      return res.status(400).json(newAmenity);
    }
    res.status(201).json(newAmenity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.updateAmenity = async (req, res) => {
  try {
    const { id } = req.params;
    const amenity = req.body;
    const updatedAmenity = await AmenityServices.updateAmenity(id, amenity);
    if (updatedAmenity.status === "ERROR") {
      return res.status(400).json(updatedAmenity);
    }
    res.status(200).json(updatedAmenity);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

exports.deleteAmenity = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await AmenityServices.deleteAmenity(id);
    if (result.status === "ERROR") {
      return res.status(400).json(result);
    }
    return res
      .status(200)
      .json({ status: "SUCCESS", message: "Amenity deleted successfully" });
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
};

exports.importFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "ERROR",
        message: "Please upload an Excel file",
      });
    }

    const result = await AmenityServices.importFromExcel(req.file.path);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
};

exports.previewAmenities = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "ERR",
        message: "No file uploaded",
      });
    }

    const result = await AmenityServices.previewAmenitiesFromExcel(
      req.file.path
    );
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "ERR",
      message: error.message,
    });
  }
};
