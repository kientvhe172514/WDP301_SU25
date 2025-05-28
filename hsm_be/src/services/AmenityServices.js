const { json } = require("body-parser");
const Amenity = require("../models/AmenityModel");
const XLSX = require("xlsx");
// lấy tất cả các amenity
exports.getAllAmenities = async () => {
  try {
    const amenities = await Amenity.find();
    return {
      status: "OK",
      message: "Amenities fetched successfully",
      data: amenities,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// lấy amenity theo id
exports.getAmenityById = async (id) => {
  try {
    const amenity = await Amenity.findById(id);
    if (!amenity) {
      return {
        status: "ERROR",
        message: "Amenity not found",
      };
    }
    return {
      status: "OK",
      message: "Amenity fetched successfully",
      data: amenity,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// thêm amenity
exports.createAmenity = async (amenity) => {
  try {
    const existedAmenity = await Amenity.findOne({
      AmenitiesName: amenity.AmenitiesName,
    });
    if (existedAmenity) {
      return {
        status: "ERROR",
        message: "Amenity already exists",
      };
    }
    const newAmenity = await Amenity.create(amenity);

    return {
      status: "OK",
      message: "Amenity created successfully",
      data: newAmenity,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// cập nhật amenity
exports.updateAmenity = async (id, amenity) => {
  try {
    const updatedAmenity = await Amenity.findByIdAndUpdate(id, amenity, {
      new: true,
    });
    if (!updatedAmenity) {
      return {
        status: "ERROR",
        message: "Amenity not found",
      };
    }
    return {
      status: "OK",
      message: "Amenity updated successfully",
      data: updatedAmenity,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// xóa mềm amenity
exports.deleteAmenity = async (id) => {
  try {
    const deletedAmenity = await Amenity.findByIdAndUpdate(
      id,
      { IsDelete: true },
      { new: true }
    );
    if (!deletedAmenity) {
      return {
        status: "ERROR",
        message: "Amenity not found",
      };
    }
    return {
      status: "OK",
      message: "Amenity deleted successfully",
      data: deletedAmenity,
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

// Import amenities từ file Excel
exports.importFromExcel = async (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);

    // Kiểm tra cấu trúc file Excel
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

    // Xử lý từng dòng dữ liệu
    for (let i = 0; i < data.length; i++) {
      const row = data[i];
      const rowNumber = i + 2;

      try {
        // Kiểm tra trường bắt buộc
        if (!row.AmenitiesName) {
          results.errors.push({
            row: rowNumber,
            error: "Missing AmenitiesName",
          });
          continue;
        }

        // Kiểm tra kiểu dữ liệu
        if (typeof row.AmenitiesName !== "string") {
          results.errors.push({
            row: rowNumber,
            error: "AmenitiesName must be a string",
          });
          continue;
        }

        // Kiểm tra trùng lặp
        const isDuplicate = await Amenity.findOne({
          AmenitiesName: row.AmenitiesName,
        });

        if (isDuplicate) {
          results.errors.push({
            row: rowNumber,
            error: "Amenity name already exists",
          });
          continue;
        }

        // Tạo amenity mới
        const newAmenity = await Amenity.create({
          AmenitiesName: row.AmenitiesName,
          Note: row.Note || "",
          IsDelete: false,
        });

        results.success.push({
          row: rowNumber,
          data: newAmenity,
        });
      } catch (error) {
        results.errors.push({
          row: rowNumber,
          error: error.message,
        });
      }
    }

    // Tạo response
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

    // Thêm chi tiết lỗi nếu có
    if (results.errors.length > 0) {
      response.errors = results.errors;
    }

    // Thêm dữ liệu đã import thành công
    if (results.success.length > 0) {
      response.data = results.success.map((item) => item.data);
    }

    return response;
  } catch (error) {
    throw new Error(error.message);
  }
};

exports.previewAmenitiesFromExcel = async (filePath) => {
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
        const amenityName = row[0];
        const note = row[1] || "";

        // Kiểm tra amenity name có tồn tại trong database không
        const isDuplicate = await Amenity.findOne({
          AmenitiesName: amenityName,
        });

        // Kiểm tra các điều kiện
        let error = null;
        if (!amenityName) {
          error = "Amenity name is required";
        } else if (isDuplicate) {
          error = "Amenity name already exists";
        }

        return {
          row: index + 2,
          AmenitiesName: amenityName,
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
