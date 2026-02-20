import express from 'express';
import { ReviewController } from './review.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Public route - get reviews for a tour
router.get('/tour/:tourId', ReviewController.getReviewsForTour);

// Protected routes - Tourist only
router.post('/', auth(UserRole.TOURIST), ReviewController.createReview);

router.get('/my-reviews', auth(UserRole.TOURIST), ReviewController.getReviewsByTourist);

router.patch('/:id', auth(UserRole.TOURIST), ReviewController.updateReview);

router.delete('/:id', auth(UserRole.TOURIST), ReviewController.deleteReview);

export const ReviewRoutes = router;
