import express from 'express';
import { UserController } from './user.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Public route - Get all guides
router.get('/guides', UserController.getGuides);

// Get user by ID (public profile view)
router.get('/:id', UserController.getUserById);

// Protected routes
router.get('/', auth(UserRole.ADMIN), UserController.getAllUsers);

// router.patch('/profile', auth(UserRole.TOURIST, UserRole.GUIDE, UserRole.ADMIN), UserController.updateProfile);
router.patch('/profile/:id', auth(UserRole.TOURIST, UserRole.GUIDE, UserRole.ADMIN), UserController.updateProfile);

router.patch('/:id/status', auth(UserRole.ADMIN), UserController.updateUserStatus);

router.delete('/:id', auth(UserRole.ADMIN), UserController.deleteUser);

export const UserRoutes = router;
