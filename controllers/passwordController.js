import PasswordModel from '../models/password.js';
import { encrypt, decrypt } from '../utils/encryption.js';

// Get all passwords for user, decrypt passwords before sending
export const getPasswords = async (req, res) => {
  try {
    const userId = req.query.userId || req.body.userId;
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const passwords = await PasswordModel.find({ userId }).sort({ createdAt: -1 });

    const decryptedPasswords = passwords.map((p) => ({
      ...p.toObject(),
      password: decrypt(p.password),
    }));

    res.json(decryptedPasswords);
  } catch (err) {
    console.error('Get passwords error:', err);
    res.status(500).json({ message: 'Server error getting passwords' });
  }
};

// Create a new password, encrypt before saving, decrypt before sending response
export const createPassword = async (req, res) => {
  try {
    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const { website, username, password, category, notes, strength, lastUsed } = req.body;

    const encryptedPassword = encrypt(password);

    const newPassword = new PasswordModel({
      userId,
      website,
      username,
      password: encryptedPassword,
      category,
      notes,
      strength,
      lastUsed,
    });

    const savedPassword = await newPassword.save();

    res.json({
      ...savedPassword.toObject(),
      password: password,  // send decrypted password in response
    });
  } catch (err) {
    console.error('Create password error:', err);
    res.status(500).json({ message: 'Server error creating password' });
  }
};

// Update existing password, encrypt password if updated, decrypt before response
export const updatePassword = async (req, res) => {
  try {
    const passwordId = req.params.id;
    const userId = req.body.userId;
    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const { website, username, password, category, notes, strength, lastUsed } = req.body;

    // Encrypt password before update
    const encryptedPassword = encrypt(password);

    const updatedPassword = await PasswordModel.findOneAndUpdate(
      { _id: passwordId, userId },
      {
        website,
        username,
        password: encryptedPassword,
        category,
        notes,
        strength,
        lastUsed,
      },
      { new: true }
    );

    if (!updatedPassword) return res.status(404).json({ message: 'Password not found' });

    res.json({
      ...updatedPassword.toObject(),
      password: password,  // send decrypted password in response
    });
  } catch (err) {
    console.error('Update password error:', err);
    res.status(500).json({ message: 'Server error updating password' });
  }
};

// Delete password
export const deletePassword = async (req, res) => {
  try {
    const passwordId = req.params.id;
    const userId = req.query.userId || req.body.userId;

    if (!userId) return res.status(400).json({ message: 'User ID required' });

    const deleted = await PasswordModel.findOneAndDelete({ _id: passwordId, userId });

    if (!deleted) return res.status(404).json({ message: 'Password not found' });

    res.json({ message: 'Password deleted' });
  } catch (err) {
    console.error('Delete password error:', err);
    res.status(500).json({ message: 'Server error deleting password' });
  }
};

export const getAllPasswords = async (req, res) => {
  try {
    // Optional: admin auth check
    const adminKey = req.query.adminKey || req.headers['x-admin-key'];
    if (adminKey !== process.env.ADMIN_KEY) {
      return res.status(403).json({ message: 'Unauthorized' });
    }

    // Fetch all passwords from all users
    const passwords = await PasswordModel.find().sort({ createdAt: -1 });

    const decryptedPasswords = passwords.map((p) => ({
      ...p.toObject(),
      password: decrypt(p.password),
    }));

    res.json(decryptedPasswords);
  } catch (err) {
    console.error('Get ALL passwords (admin) error:', err);
    res.status(500).json({ message: 'Server error getting passwords' });
  }
};
