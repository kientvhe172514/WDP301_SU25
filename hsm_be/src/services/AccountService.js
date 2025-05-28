const Account = require("../models/AccountModel");
const Employee = require("../models/EmployeeModel");
const Customer = require("../models/CustomerModel");
const Hotel = require("../models/HotelModel");
const RoleAssignment = require("../models/RoleAssignments");
const { generateAccessToken, generateRefreshToken } = require("./JwtService");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  logger: true,
});

const validatePassword = (password) => {
  if (password.length < 8) return "Mật khẩu phải dài ít nhất 8 ký tự.";
  if (!/[A-Z]/.test(password)) return "Mật khẩu phải chứa ít nhất một chữ cái in hoa.";
  if (!/[a-z]/.test(password)) return "Mật khẩu phải chứa ít nhất một chữ cái thường.";
  if (!/[0-9]/.test(password)) return "Mật khẩu phải chứa ít nhất một số.";
  if (!/[@$!%*?&]/.test(password)) return "Mật khẩu phải chứa ít nhất một ký tự đặc biệt (@$!%*?&).";
  return null;
};

const loginAccount = async (accountLogin) => {
  try {
    const { email, password } = accountLogin;
    console.log("=== LOGIN PROCESS ===");
    console.log("Login attempt for email:", email);

    const account = await Account.findOne({ Email: email });
    if (!account) {
      console.log("Account not found for email:", email);
      return {
        status: "ERR",
        message: "The account is not found",
      };
    }

    console.log("Account found:", account._id);

    const isPasswordValid = await bcrypt.compare(password, account.Password);
    if (!isPasswordValid) {
      console.log("Password validation failed");
      return {
        status: "ERR",
        message: "The email or password is incorrect",
      };
    }

    console.log("Password validated successfully");

    // Đảm bảo account._id là ObjectId hợp lệ
    const userId = account._id.toString();
    console.log("User ID for token:", userId);

    const access_token = await generateAccessToken({ id: userId });
    const refresh_token = await generateRefreshToken({ id: userId });

    console.log("Tokens generated successfully");

    await Account.findByIdAndUpdate(account._id, { refreshToken: refresh_token });

    const result = {
      status: "OK",
      message: "Login successful",
      access_token,
      refresh_token,
      data: {
        id: account._id,
        email: account.Email,
        fullName: account.FullName,
        username: account.Username,
        permissions: account.permissions,
      },
    };

    console.log("Login process completed successfully");
    return result;
  } catch (error) {
    console.error("=== LOGIN ERROR ===");
    console.error("Error in loginAccount:", error);
    return {
      status: "ERR",
      message: "An error occurred during login",
    };
  }
};

const requestPasswordReset = async (email) => {
  const account = await Account.findOne({ Email: email });
  if (!account) throw new Error("Email không tồn tại");

  const token = crypto.randomBytes(20).toString("hex");
  account.resetPasswordToken = token;
  account.resetPasswordExpires = Date.now() + 3600000;
  await account.save();

  const resetUrl = `http://localhost:3000/reset-password/${token}`;
  const mailOptions = {
    to: account.Email,
    from: process.env.EMAIL_USER,
    subject: "Reset mật khẩu",
    text: `Hãy nhấp vào liên kết sau để đặt lại mật khẩu:\n\n${resetUrl}\n\nNếu bạn không yêu cầu, hãy bỏ qua email này.`,
  };

  await transporter.sendMail(mailOptions);
  return { message: "Liên kết đặt lại mật khẩu đã được gửi tới email của bạn." };
};

const resetPassword = async (token, newPassword) => {
  const account = await Account.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  });

  if (!account) throw new Error("Token không hợp lệ hoặc đã hết hạn");

  const hashedPassword = await bcrypt.hash(newPassword, 10);
  account.Password = hashedPassword;
  account.resetPasswordToken = undefined;
  account.resetPasswordExpires = undefined;
  await account.save();

  return { message: "Mật khẩu đã được đặt lại thành công." };
};

const getProfile = async (accountId) => {
  const account = await Account.findById(accountId)
    .populate("permissions", "PermissionName Note")
    .select("-Password -refreshToken");

  if (!account) throw new Error("Account not found");

  const employee = await Employee.findOne({ accountId })
    .populate("hotels", "CodeHotel NameHotel")
    .populate("permission", "PermissionName Note");

  const customer = await Customer.findOne({ accoutId: accountId });

  const roleAssignment = await RoleAssignment.findOne({ account: accountId })
    .populate("role");

  const profileData = {
    account: {
      id: account._id,
      fullName: account.FullName,
      email: account.Email,
      username: account.Username,
      permissions: account.permissions,
      role: roleAssignment ? roleAssignment.role.RoleName : "",
      isDelete: account.IsDelete,
      createdAt: account.createdAt,
      updatedAt: account.updatedAt,
    },
  };

  if (employee) {
    profileData.employee = {
      id: employee._id,
      fullName: employee.FullName,
      phone: employee.Phone,
      email: employee.Email,
      gender: employee.Gender,
      image: employee.Image,
      address: employee.Address,
      hotels: employee.hotels,
      role: employee.role ? employee.role.RoleName : "",
      permission: employee.permission,
      createdAt: employee.createdAt,
      updatedAt: employee.updatedAt,
    };
  }

  if (customer) {
    profileData.customer = {
      id: customer._id,
      fullName: customer.full_name,
      phone: customer.phone,
      cccd: customer.cccd,
      avatar: customer.avatar,
      role: customer.role ? customer.role.RoleName : "",
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  return profileData;
};

// const getProfile = async (userId) => {
//     try {
//         // Fetch account details
//         const account = await Account.findById(userId)
//             .select("-Password -refreshToken -resetPasswordToken -resetPasswordExpires")
//             .lean();

//         if (!account) {
//             throw new Error("Account not found");
//         }

//         // Fetch role assignment to determine user role
//         const roleAssignment = await RoleAssignment.findOne({ account: userId })
//             .populate("role")
//             .lean();

//         let role = "Customer"; // Default role
//         if (roleAssignment && roleAssignment.role) {
//             role = roleAssignment.role.RoleName;
//         }

//         // Fetch customer or employee details based on role
//         let customer = null;
//         let employee = null;

//         if (role === "Customer") {
//             customer = await Customer.findOne({ accountId: userId }).lean();
//         } else {
//             employee = await Employee.findOne({ accountId: userId })
//                 .populate("hotels permission")
//                 .lean();
//         }

//         return {
//             account: {
//                 fullName: account.FullName,
//                 username: account.Username,
//                 email: account.Email,
//                 createdAt: account.createdAt,
//             },
//             customer,
//             employee,
//             role,
//         };
//     } catch (error) {
//         throw new Error(error.message || "Unable to fetch profile");
//     }
// };

const updateProfile = async (accountId, data) => {
  const { fullName, username, phone, gender, address, image, cccd, email } = data;

  if (!fullName || !username) throw new Error("Full name and username are required");

  const existingAccount = await Account.findOne({
    Username: username,
    _id: { $ne: accountId },
  });
  if (existingAccount) throw new Error("Username already exists");

  if (phone && !/^\d{10}$/.test(phone)) throw new Error("Phone number must be exactly 10 digits");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email format");
  if (cccd && !/^\d{12}$/.test(cccd)) throw new Error("CCCD must be exactly 12 digits");

  if (phone) {
    const existingCustomerByPhone = await Customer.findOne({
      phone,
      accoutId: { $ne: accountId },
    });
    if (existingCustomerByPhone) throw new Error("Phone number already exists");
  }

  if (cccd) {
    const existingCustomerByCCCD = await Customer.findOne({
      cccd,
      accoutId: { $ne: accountId },
    });
    if (existingCustomerByCCCD) throw new Error("CCCD already exists");
  }

  const updatedAccount = await Account.findByIdAndUpdate(
    accountId,
    { FullName: fullName, Username: username },
    { new: true, runValidators: true }
  )
    .populate("permissions", "PermissionName Note")
    .select("-Password -refreshToken");

  if (!updatedAccount) throw new Error("Account not found");

  let updatedEmployee = null;
  const employee = await Employee.findOne({ accountId });
  if (employee) {
    const employeeUpdateData = { FullName: fullName };
    if (phone !== undefined) employeeUpdateData.Phone = phone;
    if (gender !== undefined) employeeUpdateData.Gender = gender;
    if (address !== undefined) employeeUpdateData.Address = address;
    if (image !== undefined) employeeUpdateData.Image = image;
    if (email !== undefined) employeeUpdateData.Email = email;

    updatedEmployee = await Employee.findByIdAndUpdate(employee._id, employeeUpdateData, {
      new: true,
      runValidators: true,
    })
      .populate("hotels", "name")
      .populate("permission", "PermissionName Note");
  }

  let updatedCustomer = null;
  const customer = await Customer.findOne({ accoutId: accountId });
  if (customer) {
    const customerUpdateData = { full_name: fullName };
    if (phone !== undefined) customerUpdateData.phone = phone;
    if (cccd !== undefined) customerUpdateData.cccd = cccd;

    updatedCustomer = await Customer.findByIdAndUpdate(customer._id, customerUpdateData, {
      new: true,
      runValidators: true,
    });
  }

  const responseData = {
    account: {
      id: updatedAccount._id,
      fullName: updatedAccount.FullName,
      email: updatedAccount.Email,
      username: updatedAccount.Username,
      permissions: updatedAccount.permissions,
      updatedAt: updatedAccount.updatedAt,
    },
  };

  if (updatedEmployee) {
    responseData.employee = {
      id: updatedEmployee._id,
      fullName: updatedEmployee.FullName,
      phone: updatedEmployee.Phone,
      email: updatedEmployee.Email,
      gender: updatedEmployee.Gender,
      image: updatedEmployee.Image,
      address: updatedEmployee.Address,
      hotels: updatedEmployee.hotels,
      permission: updatedEmployee.permission,
      updatedAt: updatedEmployee.updatedAt,
    };
  }

  if (updatedCustomer) {
    responseData.customer = {
      id: updatedCustomer._id,
      fullName: updatedCustomer.full_name,
      phone: updatedCustomer.phone,
      cccd: updatedCustomer.cccd,
      updatedAt: updatedCustomer.updatedAt,
    };
  }

  return responseData;
};

const changePassword = async (accountId, { currentPassword, newPassword, confirmPassword }) => {
  if (!currentPassword || !newPassword || !confirmPassword) {
    throw new Error("All password fields are required");
  }

  if (newPassword !== confirmPassword) {
    throw new Error("New password and confirm password do not match");
  }

  const passwordError = validatePassword(newPassword);
  if (passwordError) throw new Error(passwordError);

  if (currentPassword === newPassword) {
    throw new Error("Mật khẩu mới phải khác mật khẩu hiện tại");
  }

  const account = await Account.findById(accountId);
  if (!account) throw new Error("Account not found");

  const isCurrentPasswordValid = await bcrypt.compare(currentPassword, account.Password);
  if (!isCurrentPasswordValid) throw new Error("Current password is incorrect");

  const saltRounds = 12;
  const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds);

  await Account.findByIdAndUpdate(accountId, {
    Password: hashedNewPassword,
    refreshToken: null,
  });

  return { message: "Password changed successfully. Please login again." };
};

module.exports = {
  loginAccount,
  requestPasswordReset,
  resetPassword,
  getProfile,
  updateProfile,
  changePassword,
};