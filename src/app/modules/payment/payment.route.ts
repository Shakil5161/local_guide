import express from 'express';
import { PaymentController } from './payment.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();

// Public route for Stripe callback
router.post('/webhook', PaymentController.stripeWebhook);

// Admin only
router.get('/all', auth(UserRole.ADMIN), PaymentController.getAllPayments);
router.post('/verify/:id', auth(UserRole.ADMIN), PaymentController.verifyPayment); // Manual/fallback verification

// Tourist routes
router.post('/initiate', auth(UserRole.TOURIST), PaymentController.initiatePayment);
router.post('/verify-session', auth(UserRole.TOURIST), PaymentController.verifySession);

// Shared routes
router.get('/booking/:bookingId', auth(UserRole.TOURIST, UserRole.GUIDE, UserRole.ADMIN), PaymentController.getPaymentByBookingId);

export const PaymentRoutes = router;
