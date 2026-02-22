import express from 'express';
import { TourController } from './tour.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Public routes
router.get('/', TourController.getAllTours);
router.get('/:id', TourController.getTourById);
router.get('/:id/availability', TourController.getAvailability); // public – tourists see available dates

// Protected routes - Guide only
router.post('/', auth(UserRole.GUIDE), TourController.createTour);
router.get('/my/listings', auth(UserRole.GUIDE), TourController.getMyTours);
router.patch('/:id', auth(UserRole.GUIDE), TourController.updateTour);
router.delete('/:id', auth(UserRole.GUIDE), TourController.deleteTour);
router.post('/:id/availability', auth(UserRole.GUIDE), TourController.setAvailability);
router.delete('/:id/availability/:availId', auth(UserRole.GUIDE), TourController.deleteAvailabilityDate);

export const TourRoutes = router;
