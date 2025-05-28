const ServiceServices = require("../services/ServiceServices");

exports.getAllServices = async (req, res) => {
  try {
    const services = await ServiceServices.getAllServices();
    return res.json(services);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const result = await ServiceServices.getServiceById(req.params.id);

    if (result.status === "ERROR") {
      return res
        .status(404)
        .json({ status: result.status, message: result.message });
    }

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({ status: "ERROR", message: error.message });
  }
};

exports.createService = async (req, res) => {
  try {
    const service = await ServiceServices.createService(req.body);
    if (service.status === "ERR") {
      return res.status(400).json(service);
    }
    return res.status(201).json(service);
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};

exports.updateService = async (req, res) => {
  try {
    const service = await ServiceServices.updateService(
      req.params.id,
      req.body
    );
    if (service.status === "ERROR") {
      return res.status(400).json(service);
    }
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.deleteService = async (req, res) => {
  try {
    const service = await ServiceServices.deleteService(req.params.id);
    if (service.status === "ERROR") {
      return res.status(400).json(service);
    }
    res
      .status(200)
      .json({ status: "SUCCESS", message: "Service deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

exports.importServicesFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "ERROR",
        message: "Please upload an Excel file",
      });
    }

    const result = await ServiceServices.importDataFromExcel(req.file.path);
    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
};
exports.previewServicesFromExcel = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        status: "ERROR",
        message: "Please upload an Excel file",
      });
    }
    const result = await ServiceServices.previewDataFromExcel(req.file.path);

    return res.status(200).json(result);
  } catch (error) {
    return res.status(500).json({
      status: "ERROR",
      message: error.message,
    });
  }
};
