import express from 'express';
import { BookingController } from './booking.controller';
import auth from '../../middlewares/auth';
import { UserRole } from '@prisma/client';

const router = express.Router();


// Admin only
router.get('/all', auth(UserRole.ADMIN), BookingController.getAllBookings);

// Tourist routes
router.post('/', auth(UserRole.TOURIST), BookingController.createBooking);
router.get('/my-bookings', auth(UserRole.TOURIST), BookingController.getMyBookings);

// Guide routes
router.get('/guide-bookings', auth(UserRole.GUIDE), BookingController.getGuideBookings);

// Shared routes (tourist, guide, admin)
router.get('/:id', auth(UserRole.TOURIST, UserRole.GUIDE, UserRole.ADMIN), BookingController.getBookingById);

router.patch('/:id/status', auth(UserRole.TOURIST, UserRole.GUIDE, UserRole.ADMIN), BookingController.updateBookingStatus);

export const BookingRoutes = router;
