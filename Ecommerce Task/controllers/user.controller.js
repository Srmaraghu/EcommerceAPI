const bcrypt = require("bcrypt");
const { body } = require("express-validator");
const jwt = require("jsonwebtoken");
const User = require("../models/user.model");
const Order = require("../models/order.model");

// Validation rules for registration
const registerValidation = [
    body("name").notEmpty().withMessage("Name is required"),
    body("email")
        .isEmail().withMessage("Invalid email format")
        .notEmpty().withMessage("Email is required"),
    body("password")
        .isLength({ min: 4 }).withMessage("Password must be at least 4 characters long")
        .notEmpty().withMessage("Password is required")
];

// Validation rules for login
const loginValidation = [
    body("email")
        .isEmail().withMessage("Invalid email format")
        .notEmpty().withMessage("Email is required"),
    body("password")
        .notEmpty().withMessage("Password is required")
];

const registerUser = async (req, res) => {
    try {
        const { name, email, password, role = "user" } = req.body;

        // Validation for required fields
        if (!name || !email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            return res.status(400).json({ message: "User already exists" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        await User.create({ name, email, password: hashedPassword, role });

        return res.status(201).json({
            message: "User registered successfully",
            success: true
        });

    } catch (error) {
        console.error("Error during registration:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};

const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation for required fields
        if (!email || !password) {
            return res.status(400).json({ message: "All fields are required" });
        }

        const user = await User.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "User not found" });
        }

        const isPasswordMatch = await bcrypt.compare(password, user.password);
        if (!isPasswordMatch) {
            return res.status(401).json({ message: "Invalid password" });
        }

        const payload = { userId: user._id, role: user.role };
        const jwtToken = jwt.sign(payload, process.env.JWT_SECRET, { expiresIn: "1h" });

        return res.status(200).cookie("token", jwtToken, {
            httpOnly: true,
            maxAge: 24 * 60 * 60 * 1000 // 1 day
        }).json({
            token: jwtToken,
            message: "Login Successful",
            success: true,
        });

    } catch (error) {
        console.error("Error during login:", error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


//delete user for admins

const deleteUserById = async (req, res, next) => {
    try {
        const userId = req.params.id;

        // Only admins can delete users
        if (req.user.role!== "admin") {
            return res.status(403).json({ message: "Access denied. Only admins can delete users." });
        }

        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        await Order.deleteMany({ user: userId });

        return res.status(200).json({
            message: "User deleted successfully",
            success: true
        });

    } catch (error) {
        console.error("Error deleting user:", error);
        next(error);
    }
};

module.exports = {
    registerUser,
    loginUser,
    deleteUserById,
    loginValidation,
    registerValidation
};
