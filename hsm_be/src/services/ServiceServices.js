const Service = require("../models/ServiceModel");
const XLSX = require("xlsx");
const { json } = require("body-parser");
// lấy ra tất cả dịch vụ
exports.getAllServices = async () => {
  try {
    const services = await Service.find();
    return {
      status: "SUCCESS",
      message: "Get all services successfully",
      data: services,
    };
  } catch (error) {
    throw new Error(error);
  }
};

// lấy dịch vụ theo id
exports.getServiceById = async (id) => {
  try {
    const service = await Service.findById(id);
    if (!service) {
      return {
        status: "ERROR",
        message: "Service not found",
      };
    }
    return {
      status: "SUCCESS",
      message: "Get service by id successfully",
      data: service,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

//tao dịch vụ

exports.createService = async (service) => {
  try {
    const existedService = await Service.findOne({
      ServiceName: service.ServiceName,
    });
    if (existedService) {
      return {
        status: "ERR",
        message: "Service name already exists",
      };
    }

    if (service.Price <= 0) {
      return {
        status: "ERR",
        message: "Price must be greater than 0",
      };
    }

    const newService = await Service.create(service);

    return {
      status: "SUCCESS",
      message: "Create service successfully",
      data: newService,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// cập nhật dịch vụ

exports.updateService = async (id, service) => {
  try {
    const existedService = await Service.findById(id);
    if (!existedService) {
      return {
        status: "ERROR",
        message: "Service not found",
      };
    }

    if (
      typeof service.Price !== "number" ||
      isNaN(service.Price) ||
      service.Price <= 0
    ) {
      return {
        status: "ERROR",
        message: "Price must be a number and greater than 0",
      };
    }

    const updatedService = await Service.findByIdAndUpdate(id, service, {
      new: true,
    });

    return {
      status: "SUCCESS",
      message: "Update service successfully",
      data: updatedService,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// xóa dịch vụ
exports.deleteService = async (id) => {
  try {
    const deletedService = await Service.findByIdAndUpdate(id, {
      IsDelete: true,
      new: true,
    });
    if (!deletedService) {
      return {
        status: "ERROR",
        message: "Service not found",
      };
    }
    return {
      status: "SUCCESS",
      message: "Delete service successfully",
      data: deletedService,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// import data từ excel
exports.importDataFromExcel = async (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    if (data.length === 0) {
      return {
        status: "ERROR",
        message: "File Excel no data",
      };
    }
    const results = {
      success: [],
      errors: [],
      total: data.length,
    };
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;
      try {
        if (!row.ServiceName || !row.Price || !row.Note) {
          results.errors.push({
            row: rowNumber,
            error: "Missing ServiceName, Price and Note",
          });
          continue;
        }
        if (
          typeof row.Price !== "number" ||
          isNaN(row.Price) ||
          row.Price <= 0
        ) {
          results.errors.push({
            row: rowNumber,
            error: "Price must be a number and greater than 0",
          });
          continue;
        }
        if (typeof row.ServiceName !== "string") {
          results.errors.push({
            row: rowNumber,
            error: "ServiceName must be a string",
          });
          continue;
        }
        if (typeof row.Note !== "string") {
          results.errors.push({
            row: rowNumber,
            error: "Note must be a string",
          });
          continue;
        }
        const existedService = await Service.findOne({
          ServiceName: row.ServiceName,
        });
        if (existedService) {
          results.errors.push({
            row: rowNumber,
            error: "Service name already exists",
          });
          continue;
        }
        const newService = await Service.create({
          ServiceName: row.ServiceName,
          Price: row.Price,
          Note: row.Note || "",
          Active: true,
          IsDelete: false,
        });
        results.success.push({
          row: rowNumber,
          data: newService,
        });
      } catch (error) {
        results.errors.push({
          row: rowNumber,
          error: error.message,
        });
      }
    }
    const response = {
      status: results.success.length > 0 ? "PARTIAL_SUCCESS" : "ERROR",
      message:
        results.success.length > 0
          ? `Import successfully ${results.success.length} rows, ${results.errors.length} rows error`
          : "No data imported successfully",
      summary: {
        total: results.total,
        success: results.success.length,
        failed: results.errors.length,
      },
    };

    if (results.errors.length > 0) {
      response.errors = results.errors;
    }

    if (results.success.length > 0) {
      response.data = results.success.map((item) => item.data);
    }

    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.previewDataFromExcel = async (filePath) => {
  try {
    if (!filePath) {
      return {
        status: "ERROR",
        message: "No file path provided",
      };
    }

    const workbook = XLSX.readFile(filePath);
    const firstSheet = workbook.Sheets[workbook.SheetNames[0]];
    const jsonData = XLSX.utils.sheet_to_json(firstSheet, { header: 1 });

    const rows = jsonData.slice(1);
    if (rows.length === 0) {
      return {
        status: "ERROR",
        message: "No data found in Excel file",
      };
    }

    const previewData = await Promise.all(
      rows.map(async (row, index) => {
        const serviceName = row[0];
        const price = row[1];
        const note = row[2] || "";

        // Kiểm tra service name có tồn tại trong database không
        const isDuplicate = await Service.findOne({
          ServiceName: serviceName,
        });

        // Kiểm tra các điều kiện
        let error = null;
        if (!serviceName) {
          error = "Service name is required";
        } else if (isDuplicate) {
          error = "Service name already exists";
        } else if (!price || isNaN(price) || price <= 0) {
          error = "Price must be a number and greater than 0";
        }

        return {
          row: index + 2,
          ServiceName: serviceName,
          Price: price,
          Note: note,
          error: error,
        };
      })
    );

    const summary = {
      total: previewData.length,
      success: previewData.filter((item) => !item.error).length,
      failed: previewData.filter((item) => item.error).length,
    };

    return {
      status: "OK",
      data: {
        data: previewData,
        summary,
      },
    };
  } catch (error) {
    console.error("Preview error:", error);
    return {
      status: "ERROR",
      message: "Failed to preview Excel file: " + error.message,
    };
  }
};
