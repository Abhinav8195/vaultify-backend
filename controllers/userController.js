import userModel from "../models/userModel.js";
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';

const otpStore = {}; // store OTPs in memory

const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.SMTP_MAIL,
        pass: process.env.SMTP_PASSWORD
    }
});

// Send OTP Email
const sendOtpEmail = async (email, otp) => {
    await transporter.sendMail({
        from: `"Vaultify Security" <${process.env.SMTP_MAIL}>`,
        to: email,
        subject: "Vaultify - Reset Your Password",
        html: `
            <h2>Vaultify Password Reset</h2>
            <p>Your OTP is:</p>
            <h3 style="letter-spacing:2px">${otp}</h3>
            <p>This OTP will expire in 5 minutes.</p>
        `
    });
};

// Welcome Email
const sendWelcomeEmail = async (email, name) => {
    await transporter.sendMail({
        from: `"Vaultify Team" <${process.env.SMTP_MAIL}>`,
        to: email,
        subject: "Welcome to Vaultify 🚀",
        html: `
            <h2>Welcome, ${name}!</h2>
            <p>Your Vaultify account is ready. Start storing your passwords securely.</p>
            <a href="${process.env.FRONTEND_URL}" style="background:#4f46e5;color:#fff;padding:10px 20px;border-radius:6px;text-decoration:none;">Go to Vaultify</a>
        `
    });
};

// JWT Token Creator
const createToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
};

// REGISTER
const registerUser = async (req, res) => {
    try {
        const { fullName, email, password } = req.body;

        if (!fullName || !email || !password) {
            return res.json({ success: false, message: "All fields are required" });
        }

        const exists = await userModel.findOne({ email });
        if (exists) {
            return res.json({ success: false, message: "User already exists" });
        }

        if (!validator.isEmail(email)) {
            return res.json({ success: false, message: "Invalid email" });
        }

        if (password.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters long" });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = new userModel({
            fullName,
            email,
            password: hashedPassword
        });

        const user = await newUser.save();
        // await sendWelcomeEmail(email, fullName);

        const token = createToken(user._id);
        res.json({ success: true, token, userId: user._id,fullName: user.fullName ,email: user.email});
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// LOGIN
const loginUser = async (req, res) => {
    try {
        const { email, password } = req.body;
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "User not found" });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.json({ success: false, message: "Invalid credentials" });
        }

        const token = createToken(user._id);
        res.json({ success: true, token, userId: user._id,fullName: user.fullName,email: user.email  });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// ADMIN LOGIN
const adminLogin = async (req, res) => {
    try {
        const { email, password } = req.body;
        if (email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
            const token = jwt.sign(email + password, process.env.JWT_SECRET);
            res.json({ success: true, token });
        } else {
            res.json({ success: false, message: "Invalid admin credentials" });
        }
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// FORGOT PASSWORD
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        if (!email || !validator.isEmail(email)) {
            return res.json({ success: false, message: "Please enter a valid email" });
        }

        const user = await userModel.findOne({ email });
        if (!user) {
            return res.json({ success: false, message: "No user found with this email" });
        }

        const otp = otpGenerator.generate(6, {
            upperCaseAlphabets: false,
            specialChars: false
        });

        otpStore[email] = { otp, expiresAt: Date.now() + 5 * 60 * 1000 };

        await sendOtpEmail(email, otp);

        res.json({ success: true, message: "OTP sent to your email" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// VERIFY OTP
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;
        if (!otpStore[email] || otpStore[email].otp !== otp) {
            return res.json({ success: false, message: "Invalid OTP" });
        }

        if (Date.now() > otpStore[email].expiresAt) {
            delete otpStore[email];
            return res.json({ success: false, message: "OTP expired" });
        }

        res.json({ success: true, message: "OTP verified" });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

// RESET PASSWORD
const resetPassword = async (req, res) => {
    try {
        const { email, newPassword, confirmPassword } = req.body;

        if (!email || !newPassword || !confirmPassword) {
            return res.json({ success: false, message: "All fields are required." });
        }

        if (!otpStore[email]) {
            return res.json({ success: false, message: "Please verify OTP first." });
        }

        if (newPassword.length < 8) {
            return res.json({ success: false, message: "Password must be at least 8 characters long." });
        }

        if (newPassword !== confirmPassword) {
            return res.json({ success: false, message: "Passwords do not match." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await userModel.findOneAndUpdate({ email }, { password: hashedPassword });

        delete otpStore[email];

        res.json({ success: true, message: "Password reset successfully." });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

export { loginUser, registerUser, adminLogin, forgotPassword, verifyOtp, resetPassword };
