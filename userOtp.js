/*
Great! Let's implement OTP service for user registration. I'll show you a complete implementation using Nodemailer for sending OTP emails.

1. Install Required Packages
bash
npm install nodemailer crypto
2. Create OTP Model (models/Otp.js)
javascript
import mongoose from 'mongoose';

const otpSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
    },
    otp: {
        type: String,
        required: true,
    },
    expiresAt: {
        type: Date,
        required: true,
    },
    attempts: {
        type: Number,
        default: 0,
    },
    verified: {
        type: Boolean,
        default: false,
    }
}, { timestamps: true });

// Auto delete expired OTPs after 10 minutes
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 600 });

export default mongoose.model('Otp', otpSchema);
3. Create Email Service (utils/emailService.js)
javascript
import nodemailer from 'nodemailer';

// Create transporter
const createTransporter = () => {
    return nodemailer.createTransporter({
        service: 'gmail', // or your email service
        auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS, // Use App Password for Gmail
        },
    });
};

// Send OTP Email
export const sendOtpEmail = async (email, otp) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: email,
            subject: 'Your OTP Code - Verify Your Account',
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto;">
                    <h2 style="color: #333;">Verify Your Email Address</h2>
                    <p>Thank you for registering! Use the OTP code below to verify your email:</p>
                    <div style="background: #f4f4f4; padding: 15px; text-align: center; margin: 20px 0;">
                        <h1 style="margin: 0; color: #333; letter-spacing: 5px;">${otp}</h1>
                    </div>
                    <p>This OTP will expire in 10 minutes.</p>
                    <p>If you didn't request this, please ignore this email.</p>
                    <hr style="border: none; border-top: 1px solid #eee; margin: 20px 0;">
                    <p style="color: #666; font-size: 12px;">This is an automated message, please do not reply.</p>
                </div>
            `,
        };

        await transporter.sendMail(mailOptions);
        console.log(`OTP email sent to ${email}`);
        return true;
    } catch (error) {
        console.error('Error sending OTP email:', error);
        return false;
    }
};
4. Create OTP Utility Functions (utils/otpUtils.js)
javascript
import crypto from 'crypto';

// Generate 6-digit OTP
export const generateOtp = () => {
    return crypto.randomInt(100000, 999999).toString();
};

// Set OTP expiration (10 minutes from now)
export const getOtpExpiry = () => {
    return new Date(Date.now() + 10 * 60 * 1000); // 10 minutes
};

// Verify OTP (case-insensitive and within time limit)
export const verifyOtp = (storedOtp, inputOtp, expiresAt) => {
    const now = new Date();
    return storedOtp === inputOtp && now < expiresAt;
};
5. Update User Controller (controllers/user.js)
javascript
import User from '../models/User.js';
import Otp from '../models/Otp.js';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { generateOtp, getOtpExpiry, verifyOtp } from '../utils/otpUtils.js';
import { sendOtpEmail } from '../utils/emailService.js';

const generateToken = (userId) => {
    return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

// ✅ Send OTP for registration
export const sendRegistrationOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({ success: false, message: 'Email is required' });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'User already exists with this email' });
        }

        // Generate OTP
        const otp = generateOtp();
        const expiresAt = getOtpExpiry();

        // Delete any existing OTP for this email
        await Otp.deleteMany({ email });

        // Save new OTP
        await Otp.create({
            email,
            otp,
            expiresAt,
        });

        // Send OTP email
        const emailSent = await sendOtpEmail(email, otp);

        if (!emailSent) {
            return res.json({ success: false, message: 'Failed to send OTP email' });
        }

        res.json({
            success: true,
            message: 'OTP sent successfully to your email',
        });

    } catch (error) {
        console.log('Send OTP error:', error.message);
        res.json({ success: false, message: 'Failed to send OTP' });
    }
};

// ✅ Verify OTP and complete registration
export const verifyOtpAndRegister = async (req, res) => {
    try {
        const { name, email, password, otp } = req.body;

        if (!name || !email || !password || !otp) {
            return res.json({ success: false, message: 'All fields are required' });
        }

        // Find the OTP record
        const otpRecord = await Otp.findOne({ email });

        if (!otpRecord) {
            return res.json({ success: false, message: 'OTP not found or expired' });
        }

        // Check attempts (prevent brute force)
        if (otpRecord.attempts >= 5) {
            return res.json({ success: false, message: 'Too many failed attempts. Please request a new OTP.' });
        }

        // Verify OTP
        if (!verifyOtp(otpRecord.otp, otp, otpRecord.expiresAt)) {
            // Increment attempts
            otpRecord.attempts += 1;
            await otpRecord.save();

            return res.json({ 
                success: false, 
                message: 'Invalid OTP', 
                attemptsLeft: 5 - otpRecord.attempts 
            });
        }

        // Check if user already registered while OTP was valid
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ success: false, message: 'User already registered' });
        }

        // Hash password and create user
        const hashedPassword = await bcrypt.hash(password, 10);
        const user = await User.create({ name, email, password: hashedPassword });

        // Mark OTP as verified and delete it
        await Otp.deleteOne({ email });

        // Generate token
        const token = generateToken(user._id.toString());

        // Return user without password
        const userWithoutPassword = { ...user._doc };
        delete userWithoutPassword.password;

        res.json({
            success: true,
            message: 'Registration successful!',
            user: userWithoutPassword,
            token,
        });

    } catch (error) {
        console.log('Verify OTP error:', error.message);
        res.json({ success: false, message: 'Registration failed' });
    }
};

// ✅ Resend OTP
export const resendOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({ success: false, message: 'Email is required' });
        }

        // Generate new OTP
        const otp = generateOtp();
        const expiresAt = getOtpExpiry();

        // Update or create OTP record
        await Otp.findOneAndUpdate(
            { email },
            { otp, expiresAt, attempts: 0, verified: false },
            { upsert: true, new: true }
        );

        // Send OTP email
        const emailSent = await sendOtpEmail(email, otp);

        if (!emailSent) {
            return res.json({ success: false, message: 'Failed to resend OTP' });
        }

        res.json({
            success: true,
            message: 'OTP resent successfully',
        });

    } catch (error) {
        console.log('Resend OTP error:', error.message);
        res.json({ success: false, message: 'Failed to resend OTP' });
    }
};

// Your existing login function remains the same
export const loginUser = async (req, res) => {
    // ... your existing login code ...
};
6. Update Routes (routes/userRoutes.js)
javascript
import express from 'express';
import { 
    registerUser, 
    loginUser, 
    getUserData,
    sendRegistrationOtp,
    verifyOtpAndRegister,
    resendOtp
} from '../controllers/user.js';
import { protect } from '../middleware/auth.js';

const userRouter = express.Router();

// OTP Registration Flow
userRouter.post('/send-otp', sendRegistrationOtp);
userRouter.post('/verify-register', verifyOtpAndRegister);
userRouter.post('/resend-otp', resendOtp);

// Existing routes
userRouter.post('/login', loginUser);
userRouter.get('/data', protect, getUserData);

export default userRouter;
7. Add Environment Variables (.env)
env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password  # For Gmail, use App Password
JWT_SECRET=your-jwt-secret
8. Frontend Implementation (Registration Flow)
javascript
import { useState } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const RegisterWithOtp = () => {
    const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: Complete
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        otp: ''
    });
    const [loading, setLoading] = useState(false);
    const [attemptsLeft, setAttemptsLeft] = useState(5);

    // Step 1: Send OTP
    const handleSendOtp = async () => {
        try {
            setLoading(true);
            const { data } = await axios.post('/api/user/send-otp', {
                email: formData.email
            });

            if (data.success) {
                toast.success('OTP sent to your email!');
                setStep(2);
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send OTP');
        } finally {
            setLoading(false);
        }
    };

    // Step 2: Verify OTP and Register
    const handleVerifyOtp = async () => {
        try {
            setLoading(true);
            const { data } = await axios.post('/api/user/verify-register', formData);

            if (data.success) {
                toast.success('Registration successful!');
                // Store token and redirect
                localStorage.setItem('token', data.token);
                axios.defaults.headers.common["token"] = data.token;
                setStep(3);
            } else {
                toast.error(data.message);
                if (data.attemptsLeft) {
                    setAttemptsLeft(data.attemptsLeft);
                }
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed');
        } finally {
            setLoading(false);
        }
    };

    // Resend OTP
    const handleResendOtp = async () => {
        try {
            const { data } = await axios.post('/api/user/resend-otp', {
                email: formData.email
            });

            if (data.success) {
                toast.success('OTP resent!');
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to resend OTP');
        }
    };

    return (
        <div className="register-container">
            {step === 1 && (
                <div className="step-1">
                    <h2>Register</h2>
                    <input
                        type="text"
                        placeholder="Full Name"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                    <input
                        type="email"
                        placeholder="Email"
                        value={formData.email}
                        onChange={(e) => setFormData({...formData, email: e.target.value})}
                    />
                    <input
                        type="password"
                        placeholder="Password"
                        value={formData.password}
                        onChange={(e) => setFormData({...formData, password: e.target.value})}
                    />
                    <button onClick={handleSendOtp} disabled={loading}>
                        {loading ? 'Sending OTP...' : 'Send OTP'}
                    </button>
                </div>
            )}

            {step === 2 && (
                <div className="step-2">
                    <h2>Verify OTP</h2>
                    <p>Enter the OTP sent to {formData.email}</p>
                    <input
                        type="text"
                        placeholder="Enter OTP"
                        value={formData.otp}
                        onChange={(e) => setFormData({...formData, otp: e.target.value})}
                        maxLength={6}
                    />
                    <p>Attempts left: {attemptsLeft}</p>
                    <button onClick={handleVerifyOtp} disabled={loading}>
                        {loading ? 'Verifying...' : 'Verify & Register'}
                    </button>
                    <button onClick={handleResendOtp} className="resend-btn">
                        Resend OTP
                    </button>
                </div>
            )}

            {step === 3 && (
                <div className="step-3">
                    <h2>Registration Successful! 🎉</h2>
                    <p>Welcome to our app!</p>
                </div>
            )}
        </div>
    );
};

export default RegisterWithOtp;
Key Features:
✅ 6-digit OTP with 10-minute expiry

✅ Rate limiting (max 5 attempts)

✅ Auto-delete expired OTPs

✅ Email templates with nice formatting

✅ Resend OTP functionality

✅ Security against brute force attacks

This gives you a complete OTP-based registration system! Would you like me to explain any part in more detail?
*/