import { JwtPayload } from 'jsonwebtoken';
import { UserRole } from '@prisma/client';

declare global {
    namespace Express {
        interface Request {
            user?: JwtPayload & {
                email: string;
                role: UserRole;
            };
        }
    }
}
