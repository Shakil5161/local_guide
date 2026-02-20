import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { UserRoutes } from '../modules/user/user.route';
import { TourRoutes } from '../modules/tour/tour.route';
import { BookingRoutes } from '../modules/booking/booking.route';
import { ReviewRoutes } from '../modules/review/review.route';
import { PaymentRoutes } from '../modules/payment/payment.route';

const router = express.Router();

const moduleRoutes = [
    {
        path: '/auth',
        route: AuthRoutes
    },
    {
        path: '/users',
        route: UserRoutes
    },
    {
        path: '/tours',
        route: TourRoutes
    },
    {
        path: '/bookings',
        route: BookingRoutes
    },
    {
        path: '/reviews',
        route: ReviewRoutes
    },
    {
        path: '/payments',
        route: PaymentRoutes
    }
];

moduleRoutes.forEach(route => router.use(route.path, route.route))

export default router;