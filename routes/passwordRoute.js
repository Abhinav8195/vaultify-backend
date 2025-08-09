import express from 'express';
import {
  getPasswords,
  getPasswordById,
  createPassword,
  updatePassword,
  deletePassword,
} from '../controllers/passwordController.js';

const router = express.Router();

router.get('/', getPasswords);           // GET all passwords for logged-in user
router.get('/:id', getPasswordById);     // GET one password by ID
router.post('/', createPassword);        // POST new password
router.put('/:id', updatePassword);      // PUT update password by ID
router.delete('/:id', deletePassword);   // DELETE password by ID

export default router;
