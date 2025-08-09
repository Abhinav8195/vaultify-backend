import express from 'express';
import {
  loginUser,
  registerUser,
  adminLogin,
  forgotPassword,
  verifyOtp,
  resetPassword,
  updateProfile
} from '../controllers/userController.js';

const userRouter = express.Router();

userRouter.post('/register', registerUser);
userRouter.post('/login', loginUser);
userRouter.post('/admin', adminLogin);
userRouter.post('/forgot-password', forgotPassword);
userRouter.post('/verify-otp', verifyOtp);
userRouter.post('/reset-password', resetPassword);
userRouter.put('/update-profile', updateProfile);

export default userRouter;
