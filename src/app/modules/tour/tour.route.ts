import express from 'express';
import { TourController } from './tour.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Public routes
router.get('/', TourController.getAllTours);
router.get('/:id', TourController.getTourById);

// Protected routes - Guide only
router.post('/', auth(UserRole.GUIDE), TourController.createTour);

router.get('/my/listings', auth(UserRole.GUIDE), TourController.getMyTours);

router.patch('/:id', auth(UserRole.GUIDE), TourController.updateTour);

router.delete('/:id', auth(UserRole.GUIDE), TourController.deleteTour);

export const TourRoutes = router;
