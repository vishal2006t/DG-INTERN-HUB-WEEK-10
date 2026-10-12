import express from 'express';
import { register, login, getMe, logout } from '../controllers/authController.js';
import { authenticateUser } from '../middleware/authMiddleware.js';
import { validateBody } from '../middleware/validationMiddleware.js';
import { validateRegister, validateLogin } from '../validators/authValidator.js';

const router = express.Router();

router.post('/register', validateBody(validateRegister), register);
router.post('/login', validateBody(validateLogin), login);
router.get('/me', authenticateUser, getMe);
router.post('/logout', logout);

export default router;
