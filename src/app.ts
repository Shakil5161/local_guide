import express, { Application, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import globalErrorHandler from './app/middlewares/globalErrorHandler';
import notFound from './app/middlewares/notFound';
import router from './app/routes';

const app: Application = express();
const allowedOrigins = [
    process.env.FRONTEND_URL || 'http://localhost:3000',
    'http://localhost:3000',
    'http://localhost:3001',
    'https://local-guide-eight.vercel.app',
    'https://localguide-murex.vercel.app',
];

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (e.g. curl, Postman, mobile apps)
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin)) return callback(null, true);
        callback(new Error(`CORS: origin ${origin} not allowed`));
    },
    credentials: true,
}));

// Stripe webhook requires raw body for signature verification.
app.use('/api/v1/payments/webhook', express.raw({ type: 'application/json' }));

// parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));


app.get('/', (req: Request, res: Response) => {
    res.send({
        Message: "Local Guide Platform API - Running Successfully 🚀"
    })
});

// API Routes
app.use('/api/v1', router);

app.use(globalErrorHandler);

app.use(notFound);

export default app;