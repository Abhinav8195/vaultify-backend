import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },  
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, required: true }, 
    subscription: { 
      type: String, 
        enum: ['Basic', 'Premium'],
      default: 'basic' 
    },
}, { minimize: false, timestamps: true });

const userModel = mongoose.models.user || mongoose.model('user', userSchema);
export default userModel;
