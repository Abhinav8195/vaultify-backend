import express from 'express';
import {
  getPasswords,
  createPassword,
  updatePassword,
  deletePassword,
} from '../controllers/passwordController.js';


const router = express.Router();


router.get('/', getPasswords);           
// router.get('/:id', getPasswordById);     
router.post('/', createPassword);       
router.put('/:id', updatePassword);      
router.delete('/:id', deletePassword);   

export default router;
