import express from 'express';
import { TourController } from './tour.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// ── Specific static routes MUST come before dynamic /:id routes ──────────────

// Guide-only: list own tours  (GET /tours/my/listings)
router.get('/my/listings', auth(UserRole.GUIDE), TourController.getMyTours);

// Public routes
router.get('/', TourController.getAllTours);
router.get('/:id', TourController.getTourById);
router.get('/:id/availability', TourController.getAvailability);

// Protected routes - Guide only
router.post('/', auth(UserRole.GUIDE), TourController.createTour);
router.patch('/:id', auth(UserRole.GUIDE), TourController.updateTour);
router.delete('/:id', auth(UserRole.GUIDE), TourController.deleteTour);
router.post('/:id/availability', auth(UserRole.GUIDE), TourController.setAvailability);
router.delete('/:id/availability/:availId', auth(UserRole.GUIDE), TourController.deleteAvailabilityDate);

export const TourRoutes = router;
