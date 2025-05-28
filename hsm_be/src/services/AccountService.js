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
  if (!accountId || !mongoose.isValidObjectId(accountId)) {
    throw new Error("Invalid user ID format");
  }

  const account = await Account.findById(accountId)
    .populate("permissions", "PermissionName Note")
    .select("-Password -refreshToken");

  if (!account) throw new Error("Account not found");

  const employee = await Employee.findOne({ accountId })
    .populate("hotels", "CodeHotel NameHotel")
    .populate("permission", "PermissionName Note");

  const customer = await Customer.findOne({ accountId });

  const roleAssignment = await RoleAssignment.findOne({ accounts: accountId })
    .populate("roles", "RoleName");

  const profileData = {
    account: {
      id: account._id,
      fullName: account.FullName,
      email: account.Email,
      username: account.Username,
      permissions: account.permissions,
      role: roleAssignment?.roles?.[0]?.RoleName || "", 
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
      role: roleAssignment?.roles?.[0]?.RoleName || "",
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
      role: roleAssignment?.roles?.[0]?.RoleName || "",
      createdAt: customer.createdAt,
      updatedAt: customer.updatedAt,
    };
  }

  return profileData;
};

const updateProfile = async (accountId, data) => {
  const { fullName, username, phone, gender, address, image, cccd, email, avatar } = data;

  // Validate required fields
  // if (!fullName) throw new Error("Full name is required");

  // Fetch current account to compare changes
  const currentAccount = await Account.findById(accountId).select("Username Email");
  if (!currentAccount) throw new Error("Account not found");

  // Validate unique fields only if they have changed
  if (username && username !== currentAccount.Username) {
    const existingAccount = await Account.findOne({
      Username: username,
      _id: { $ne: accountId },
    });
    if (existingAccount) throw new Error("Username already exists");
  }

  if (phone && !/^\d{10}$/.test(phone)) throw new Error("Phone number must be exactly 10 digits");
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error("Invalid email format");
  if (cccd && !/^\d{12}$/.test(cccd)) throw new Error("CCCD must be exactly 12 digits");

  // Fetch current customer to compare phone and cccd
  const currentCustomer = await Customer.findOne({ accountId }).select("phone cccd avatar");

  if (phone && phone !== currentCustomer?.phone) {
    const existingCustomerByPhone = await Customer.findOne({
      phone,
      accountId: { $ne: accountId },
    });
    if (existingCustomerByPhone) throw new Error("Phone number already exists");
  }

  if (cccd && cccd !== currentCustomer?.cccd) {
    const existingCustomerByCCCD = await Customer.findOne({
      cccd,
      accountId: { $ne: accountId },
    });
    if (existingCustomerByCCCD) throw new Error("CCCD already exists");
  }

  // Start a session for atomic updates
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    // Update Account
    const accountUpdateData = { FullName: fullName };
    if (username && username !== currentAccount.Username) accountUpdateData.Username = username;
    if (email && email !== currentAccount.Email) accountUpdateData.Email = email;

    const updatedAccount = await Account.findByIdAndUpdate(
      accountId,
      accountUpdateData,
      { new: true, runValidators: true, session }
    )
      .populate("permissions", "PermissionName Note")
      .select("-Password -refreshToken");

    if (!updatedAccount) throw new Error("Account not found");

    let updatedEmployee = null;
    let updatedCustomer = null;

    // Check if the account is an Employee
    const employee = await Employee.findOne({ accountId }).session(session);
    if (employee) {
      const employeeUpdateData = { FullName: fullName };
      if (phone !== undefined && phone !== employee.Phone) employeeUpdateData.Phone = phone;
      if (gender !== undefined) employeeUpdateData.Gender = gender;
      if (address !== undefined) employeeUpdateData.Address = address;
      // Handle both 'image' (for employee) and 'avatar' parameters
      if (image !== undefined) employeeUpdateData.Image = image;
      if (avatar !== undefined) employeeUpdateData.Image = avatar;
      if (email !== undefined && email !== employee.Email) employeeUpdateData.Email = email;

      updatedEmployee = await Employee.findByIdAndUpdate(
        employee._id,
        employeeUpdateData,
        { new: true, runValidators: true, session }
      )
        .populate("hotels", "CodeHotel NameHotel")
        .populate("permission", "PermissionName Note");
    } else {
      // Check if the account is a Customer
      const customer = await Customer.findOne({ accountId }).session(session);
      if (customer) {
        const customerUpdateData = { full_name: fullName };
        if (phone !== undefined && phone !== customer.phone) customerUpdateData.phone = phone;
        if (cccd !== undefined && cccd !== customer.cccd) customerUpdateData.cccd = cccd;
        // Handle avatar update for customer
        if (avatar !== undefined) customerUpdateData.avatar = avatar;

        updatedCustomer = await Customer.findByIdAndUpdate(
          customer._id,
          customerUpdateData,
          { new: true, runValidators: true, session }
        );
      } else {
        // Create new Customer record if none exists
        const newCustomer = new Customer({
          full_name: fullName,
          phone: phone || "",
          cccd: cccd || "",
          accountId,
          avatar: avatar || "",
        });

        updatedCustomer = await newCustomer.save({ session });

        // Assign Customer role if not already assigned
        const customerRole = await Roles.findOne({ RoleName: "Customer" }).session(session);
        if (!customerRole) throw new Error("Customer role not found");

        const roleAssignment = await RoleAssignment.findOne({
          accounts: accountId,
        }).session(session);

        if (!roleAssignment) {
          const newRoleAssignment = new RoleAssignment({
            roles: [customerRole._id],
            accounts: [accountId],
            status: "active",
          });
          await newRoleAssignment.save({ session });
        } else if (!roleAssignment.roles.includes(customerRole._id)) {
          roleAssignment.roles.push(customerRole._id);
          await roleAssignment.save({ session });
        }
      }
    }

    // Commit the transaction
    await session.commitTransaction();

    // Prepare response data
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
        avatar: updatedCustomer.avatar,
        updatedAt: updatedCustomer.updatedAt,
      };
    }

    return responseData;
  } catch (error) {
    // Rollback the transaction on error
    await session.abortTransaction();
    throw error;
  } finally {
    session.endSession();
  }
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