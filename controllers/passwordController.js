import PasswordModel from '../models/password.js';
import { encrypt, decrypt } from '../utils/encryption.js';

// Get all passwords for the logged-in user
export const getPasswords = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.query.userId;
    if (!userId) return res.status(401).json({ message: 'User ID required' });

    const passwords = await PasswordModel.find({ userId }).sort({ createdAt: -1 });

    // Decrypt passwords before sending
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


// Get single password by ID
export const getPasswordById = async (req, res) => {
  try {
    const password = await PasswordModel.findById(req.params.id);
    if (!password) return res.status(404).json({ message: 'Password not found' });
    if (password.userId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: 'Unauthorized' });

    const decryptedPassword = {
      ...password.toObject(),
      password: decrypt(password.password),
    };

    res.json(decryptedPassword);
  } catch (err) {
    console.error('Get password by ID error:', err);
    res.status(500).json({ message: 'Server error' });
  }
};


// Create new password
export const createPassword = async (req, res) => {
  try {
    const userId = req.user ? req.user._id : req.body.userId;

    const { website, username, password, category, notes, strength } = req.body;

    const encryptedPassword = encrypt(password);

    const newPassword = new PasswordModel({
      userId,
      website,
      username,
      password: encryptedPassword,
      category,
      notes,
      strength: strength || 'good',
    });

    const savedPassword = await newPassword.save();
    res.status(201).json(savedPassword);
  } catch (err) {
    console.error('Create password error:', err);
    res.status(500).json({ message: 'Server error creating password', error: err.message });
  }
};


// Update existing password
export const updatePassword = async (req, res) => {
  try {
    const password = await PasswordModel.findById(req.params.id);
    if (!password) return res.status(404).json({ message: 'Password not found' });
    if (password.userId.toString() !== req.user._id.toString()) 
      return res.status(403).json({ message: 'Unauthorized' });

    const updates = req.body;
    Object.assign(password, updates);

    const updatedPassword = await password.save();
    res.json(updatedPassword);
  } catch (err) {
    res.status(500).json({ message: 'Server error updating password' });
  }
};

// Delete password by ID
export const deletePassword = async (req, res) => {
  try {
    const password = await PasswordModel.findById(req.params.id);
    if (!password) return res.status(404).json({ message: 'Password not found' });
    if (password.userId.toString() !== req.user._id.toString()) 
      return res.status(403).json({ message: 'Unauthorized' });

    await password.remove();
    res.json({ message: 'Password deleted' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting password' });
  }
};
