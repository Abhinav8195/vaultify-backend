import userModel from "../models/userModel.js";
import validator from 'validator';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import otpGenerator from 'otp-generator';
import nodemailer from 'nodemailer';

const otpStore = {}; 

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
        subject: "🔐 Vaultify - Password Reset OTP",
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 30px; color: #f8fafc;">
            <div style="max-width: 600px; margin: auto; background: linear-gradient(135deg, #4f46e5, #9333ea); padding: 25px; border-radius: 12px; box-shadow: 0 8px 20px rgba(0,0,0,0.2);">
                
                <h1 style="color: #ffffff; text-align: center; font-size: 26px; margin-bottom: 10px;">Vaultify Password Reset</h1>
                <p style="color: #e0e7ff; text-align: center; font-size: 15px; line-height: 1.5;">
                    You recently requested to reset your Vaultify password.<br>
                    Use the OTP below to complete the process:
                </p>

                <div style="background: #ffffff; color: #111827; font-size: 22px; font-weight: bold; letter-spacing: 4px; text-align: center; padding: 12px 0; margin: 20px auto; border-radius: 8px; width: 180px;">
                    ${otp}
                </div>

                <p style="color: #e0e7ff; text-align: center; font-size: 14px;">
                    ⚠️ This OTP will expire in <b>5 minutes</b>.<br>
                    If you didn’t request a password reset, please ignore this email.
                </p>

                <div style="text-align: center; margin-top: 20px;">
                    <a href="${process.env.FRONTEND_URL}/reset-password" 
                        style="display: inline-block; background: #22d3ee; color: #0f172a; padding: 12px 25px; border-radius: 8px; text-decoration: none; font-weight: bold; font-size: 14px;">
                        Reset Password
                    </a>
                </div>
            </div>

            <div style="max-width: 600px; margin: auto; padding-top: 15px; text-align: center; font-size: 12px; color: #94a3b8;">
                <p>Made with ❤️ by Vaultify Team © 2025</p>
            </div>
        </div>
        `
    });
};


// Welcome Email
const sendWelcomeEmail = async (email, name) => {
    await transporter.sendMail({
        from: `"Vaultify Team" <${process.env.SMTP_MAIL}>`,
        to: email,
        subject: "🚀 Welcome to Vaultify – Your Digital Vault Awaits!",
        html: `
        <div style="font-family: Arial, sans-serif; background-color: #0f172a; padding: 20px; color: #f8fafc;">
            <div style="max-width: 600px; margin: auto; background: linear-gradient(135deg, #4f46e5, #9333ea); padding: 30px; border-radius: 12px; text-align: center;">
                <h1 style="color: #fff; font-size: 28px; margin-bottom: 10px;">Welcome to <span style="color: #a78bfa;">Vaultify</span>!</h1>
                <p style="color: #e0e7ff; font-size: 16px;">Hey <strong>${name}</strong>,</p>
                <p style="color: #e0e7ff; font-size: 16px; line-height: 1.5;">
                    Your account is now ready! 🎉 Store your passwords securely, generate strong keys, and keep your digital life safe.
                </p>
                <a href="${process.env.FRONTEND_URL}" style="display: inline-block; background: #22d3ee; color: #0f172a; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 20px;">
                    🔐 Go to Vaultify
                </a>
            </div>
            <div style="max-width: 600px; margin: auto; padding-top: 20px; text-align: center; font-size: 12px; color: #94a3b8;">
                <p>Made with ❤️ by Vaultify Team © 2025</p>
            </div>
        </div>
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
        await sendWelcomeEmail(email, fullName);

        const token = createToken(user._id);
        res.json({ success: true, token, userId: user._id,fullName: user.fullName ,email: user.email,subscription: user.subscription });
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
        res.json({ success: true, token, userId: user._id,fullName: user.fullName,email: user.email, subscription: user.subscription });
    } catch (error) {
        console.log(error);
        res.json({ success: false, message: error.message });
    }
};

const updateProfile = async (req, res) => {
  try {
    const { userId, fullName } = req.body;
    if (!userId) return res.status(400).json({ success: false, message: "User ID required" });
    if (!fullName || fullName.trim().length === 0) {
      return res.status(400).json({ success: false, message: "Full name is required" });
    }

    const user = await userModel.findById(userId);
    if (!user) return res.status(404).json({ success: false, message: "User not found" });

    user.fullName = fullName.trim();
    await user.save();

    res.json({ success: true, message: "Profile updated", fullName: user.fullName });
  } catch (error) {
    console.error(error);
    res.status(500).json({ success: false, message: "Server error" });
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

export { loginUser, registerUser, adminLogin, forgotPassword, verifyOtp, resetPassword ,updateProfile};
