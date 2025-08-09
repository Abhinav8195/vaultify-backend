import mongoose from 'mongoose';

const passwordSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }, 
  website: { type: String, required: true },
  username: { type: String, required: true },
  password: { type: String, required: true }, 
  category: {
    type: String,
    enum: ['personal', 'work', 'social', 'finance'],
    default: 'personal',
  },
  notes: { type: String, default: '' },
  strength: {
    type: String,
    enum: ['weak', 'fair', 'good', 'strong'],
    default: 'good',
  },
  dateAdded: { type: Date, default: Date.now },
  lastUsed: { type: Date, default: null },
}, { timestamps: true });

const PasswordModel = mongoose.models.Password || mongoose.model('Password', passwordSchema);

export default PasswordModel;
