const crypto = require("crypto");
const userModel = require("../models/user.model");
const otpModel = require("../models/otp.model");
const emailService = require("../services/email.service");
const getYearFromSemester = require("../utils/getYearFromSemester");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const bcrypt = require("bcrypt");

/**
 * Send OTP for registration verification
 */
async function sendOtp(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email address is required" });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ message: "Invalid email address format" });
    }

    // Check if user already registered
    const existingUser = await userModel.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(409).json({ message: "An account with this email already exists. Please login." });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Save or update OTP document with new 10-minute expiration
    await otpModel.findOneAndUpdate(
      { email: email.toLowerCase() },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send OTP via Resend
    await emailService.sendOtpEmail(email, otp);

    return res.status(200).json({
      message: "Verification OTP code sent to your email successfully!",
    });
  } catch (error) {
    console.error("Send OTP Error:", error);
    return res.status(500).json({
      message: error.message || "Failed to send OTP code. Please try again later.",
    });
  }
}

async function userRegister(req, res) {
  try {
    const { name, email, password, semester, branch, examType, otp } = req.body;

    if (!name || !email || !password || !branch || semester === undefined) {
      return res.status(400).json({
        message: "All required fields must be provided",
      });
    }

    if (!otp) {
      return res.status(400).json({
        message: "OTP verification code is required",
      });
    }

    const sem = Number(semester);
    if (!Number.isInteger(sem) || sem < 1 || sem > 8) {
      return res.status(400).json({
        message: "Semester must be between 1 and 8",
      });
    }

    const lowerEmail = email.toLowerCase();

    // Verify OTP in Database
    const otpDoc = await otpModel.findOne({ email: lowerEmail });
    if (!otpDoc || otpDoc.otp !== String(otp).trim()) {
      return res.status(400).json({
        message: "Invalid or expired OTP code. Please request a new verification code.",
      });
    }

    // Check if user already exists
    const isUserAlreadyExists = await userModel.findOne({ email: lowerEmail });
    if (isUserAlreadyExists) {
      return res.status(409).json({
        message: "User already exists with this email",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      name,
      email: lowerEmail,
      password: hashedPassword,
      branch,
      semester: sem,
      year: getYearFromSemester(sem),
      examType: examType || "insem",
      role: "user",
    });

    // Delete verified OTP entry
    await otpModel.deleteOne({ email: lowerEmail });

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      config.JWT_SECRET
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(201).json({
      message: "User registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        semester: user.semester,
        year: user.year,
        examType: user.examType || "insem",
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Registration error:", error);
    return res.status(500).json({ message: "Registration failed" });
  }
}

async function userLogin(req, res) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const user = await userModel.findOne({ email: email.toLowerCase() }).select("+password");

    if (!user) {
      return res.status(404).json({
        message: "User doesn't exist",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Incorrect password",
      });
    }

    const token = jwt.sign(
      {
        id: user._id,
        role: user.role,
      },
      config.JWT_SECRET
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
    });

    return res.status(200).json({
      message: "User logged in successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        branch: user.branch,
        semester: user.semester,
        year: user.year,
        examType: user.examType || "insem",
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    return res.status(500).json({ message: "Login failed" });
  }
}

/**
 * Step 1: Send Password Reset OTP
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: "Email address is required" });
    }

    const lowerEmail = email.toLowerCase();
    const user = await userModel.findOne({ email: lowerEmail });

    if (!user) {
      return res.status(404).json({ message: "No account registered with this email address." });
    }

    // Generate 6-digit OTP
    const otp = crypto.randomInt(100000, 999999).toString();

    // Save/update OTP
    await otpModel.findOneAndUpdate(
      { email: lowerEmail },
      { otp, createdAt: new Date() },
      { upsert: true, new: true }
    );

    // Send email via Resend
    await emailService.sendPasswordResetOtpEmail(lowerEmail, otp);

    return res.status(200).json({
      message: "Password reset OTP sent to your email successfully!",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({ message: "Failed to send password reset code." });
  }
}

/**
 * Step 2: Reset Password with Verified OTP
 */
async function resetPassword(req, res) {
  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({ message: "Email, OTP code, and new password are required." });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({ message: "New password must be at least 6 characters long." });
    }

    const lowerEmail = email.toLowerCase();

    // Verify OTP
    const otpDoc = await otpModel.findOne({ email: lowerEmail });
    if (!otpDoc || otpDoc.otp !== String(otp).trim()) {
      return res.status(400).json({ message: "Invalid or expired OTP code. Please request a new code." });
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 10);
    const updatedUser = await userModel.findOneAndUpdate(
      { email: lowerEmail },
      { password: hashedPassword },
      { new: true }
    );

    if (!updatedUser) {
      return res.status(404).json({ message: "User account not found." });
    }

    // Delete verified OTP
    await otpModel.deleteOne({ email: lowerEmail });

    return res.status(200).json({
      message: "Password reset successfully! You can now login with your new password.",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({ message: "Failed to reset password." });
  }
}

async function userLogout(req, res) {
  res.clearCookie("token");
  return res.status(200).json({
    message: "Logged out successfully",
  });
}

async function getAllUsers(req, res) {
  try {
    const users = await userModel.find().select("-password").sort({ createdAt: -1 }).lean();
    return res.status(200).json({
      message: "Users fetched successfully",
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    return res.status(500).json({ message: "Failed to fetch users" });
  }
}

async function updateProfile(req, res) {
  try {
    const userId = req.user.id;
    const { branch, semester, name, examType } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (branch) updateData.branch = branch;
    if (examType && ["insem", "endsem", "all"].includes(examType)) {
      updateData.examType = examType;
    }

    if (semester !== undefined && semester !== null) {
      const sem = Number(semester);
      if (!Number.isInteger(sem) || sem < 1 || sem > 8) {
        return res.status(400).json({
          message: "Semester must be between 1 and 8",
        });
      }
      updateData.semester = sem;
      updateData.year = getYearFromSemester(sem);
    }

    const updatedUser = await userModel.findByIdAndUpdate(
      userId,
      updateData,
      { new: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    return res.status(200).json({
      message: "Profile updated successfully",
      user: {
        id: updatedUser._id,
        name: updatedUser.name,
        email: updatedUser.email,
        branch: updatedUser.branch,
        semester: updatedUser.semester,
        year: updatedUser.year,
        examType: updatedUser.examType || "insem",
        role: updatedUser.role,
      },
    });
  } catch (error) {
    console.error("Update profile error:", error);
    return res.status(500).json({ message: "Failed to update profile" });
  }
}

module.exports = {
  sendOtp,
  userRegister,
  userLogin,
  forgotPassword,
  resetPassword,
  userLogout,
  getAllUsers,
  updateProfile,
};