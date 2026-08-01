const userModel = require("../models/user.model");
const getYearFromSemester = require("../utils/getYearFromSemester");
const jwt = require("jsonwebtoken");
const config = require("../config/config");
const bcrypt = require("bcrypt");

async function userRegister(req, res) {
    const { name, email, password, semester, branch } = req.body;

    if (!name || !email || !password || !branch || semester === undefined) {
        return res.status(400).json({
            message: "All fields are required",
        });
    }

    const sem = Number(semester);

    if (!Number.isInteger(sem) || sem < 1 || sem > 8) {
        return res.status(400).json({
            message: "Semester must be between 1 and 8",
        });
    }

    const isUserAlreadyExists = await userModel.findOne({ email });

    if (isUserAlreadyExists) {
        return res.status(409).json({
            message: "User already exists",
        });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
        name,
        email,
        password: hashedPassword,
        branch,
        semester: sem,
        year: getYearFromSemester(sem),
        role: "user",
    });

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
            role: user.role,
        },
    });
}

async function userLogin(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            message: "Email and password are required",
        });
    }

    const user = await userModel.findOne({ email }).select("+password");

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
            role: user.role,
        },
    });
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
        const { branch, semester, name } = req.body;

        const updateData = {};
        if (name) updateData.name = name;
        if (branch) updateData.branch = branch;

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
                role: updatedUser.role,
            },
        });
    } catch (error) {
        console.error("Update profile error:", error);
        return res.status(500).json({ message: "Failed to update profile" });
    }
}

module.exports = { userRegister, userLogin, userLogout, getAllUsers, updateProfile };