# Local Guide Platform - Backend

A comprehensive backend API for connecting travelers with local tour guides, built with Node.js, Express, Prisma, and PostgreSQL.

## 🚀 Features

- ✅ **Authentication & Authorization** (JWT-based with role management)
- ✅ **User Management** (Tourist, Guide, Admin roles)
- ✅ **Tour Listing Management** (CRUD operations with search & filtering)
- ✅ **Booking System** (Create, confirm, reject, cancel bookings)
- ✅ **Review & Rating System** (Post-tour reviews with 1-5 star ratings)
- ✅ **Payment Integration** (Ready for SSLCommerz/Stripe integration)
- ✅ **Profile Management** (Separate profiles for tourists and guides)
- ✅ **Advanced Search & Filtering** (By city, category, price, language, etc.)
- ✅ **Comprehensive Error Handling** (Prisma errors, JWT errors, validation errors)

## 🛠️ Tech Stack

- **Runtime:** Node.js
- **Framework:** Express.js
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Authentication:** JWT (JSON Web Tokens)
- **Password Hashing:** bcryptjs
- **Validation:** TypeScript & Prisma validation
- **Language:** TypeScript

## 📦 Installation

### Prerequisites
- Node.js (v20 or higher)
- PostgreSQL database
- npm or yarn

### Steps

1. **Clone the repository**
```bash
git clone <your-repo-url>
cd Local-guide-backend
```

2. **Install dependencies**
```bash
npm install
# or
yarn install
```

3. **Set up environment variables**

Create a `.env` file in the root directory:

```env
NODE_ENV=development
PORT=5000
DATABASE_URL="postgresql://username:password@localhost:5432/local_guide_db?schema=public"
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

4. **Set up database**

```bash
# Generate Prisma Client
npx prisma generate

# Run migrations (create database tables)
npx prisma migrate dev --name init

# (Optional) Seed database
npx prisma db seed
```

5. **Start the server**

```bash
# Development mode
npm run dev

# Production mode
npm start
```

The server will start at `http://localhost:5000`

## 📚 API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for detailed API endpoint documentation.

### Quick API Overview

- **Auth:** `/api/v1/auth` - Register, Login, Refresh Token
- **Users:** `/api/v1/users` - User & Profile management
- **Tours:** `/api/v1/tours` - Tour listings CRUD
- **Bookings:** `/api/v1/bookings` - Booking management
- **Reviews:** `/api/v1/reviews` - Review & ratings
- **Payments:** `/api/v1/payments` - Payment processing

## 🗂️ Project Structure

```
Local-guide-backend/
├── prisma/
│   ├── schema.prisma           # Database schema
│   └── migrations/             # Database migrations
├── src/
│   ├── app/
│   │   ├── modules/
│   │   │   ├── auth/           # Authentication module
│   │   │   ├── user/           # User/Profile module
│   │   │   ├── tour/           # Tour management module
│   │   │   ├── booking/        # Booking module
│   │   │   ├── review/         # Review module
│   │   │   └── payment/        # Payment module
│   │   ├── middlewares/
│   │   │   ├── auth.ts         # Auth middleware
│   │   │   ├── globalErrorHandler.ts
│   │   │   └── notFound.ts
│   │   ├── errors/
│   │   │   └── ApiError.ts
│   │   ├── helper/
│   │   │   └── jwtHelper.ts
│   │   ├── shared/
│   │   │   ├── prisma.ts       # Prisma client
│   │   │   ├── catchAsync.ts
│   │   │   └── sendResponse.ts
│   │   ├── routes/
│   │   │   └── index.ts        # Main routes
│   │   └── type/
│   │       └── index.d.ts      # Type definitions
│   ├── config/
│   │   └── index.ts            # Environment config
│   ├── app.ts                  # Express app
│   └── server.ts               # Server entry point
├── .env                        # Environment variables
├── package.json
├── tsconfig.json
└── README.md
```

## 🔑 User Roles

### Tourist
- Create bookings
- Write reviews
- Make payments
- View tours and guides

### Guide
- Create and manage tour listings
- Accept/reject bookings
- View booking requests
- Manage profile with expertise and rates

### Admin
- Manage all users
- View all bookings and payments
- Block/unblock users
- Access analytics

## 🗃️ Database Schema

### Main Models
- **User** - Authentication and user data
- **Profile** - Extended user information (tourist/guide specific)
- **Tour** - Tour listings created by guides
- **Booking** - Tour bookings with status tracking
- **Review** - Post-tour reviews and ratings
- **Payment** - Payment transactions

See `prisma/schema.prisma` for complete schema.

## 🧪 Testing

```bash
# Run tests (if configured)
npm test
```

## 🚢 Deployment

### Environment Variables for Production
```env
NODE_ENV=production
PORT=5000
DATABASE_URL=<your-production-database-url>
JWT_SECRET=<strong-secret-key>
FRONTEND_URL=<your-frontend-url>
```

### Recommended Platforms
- **Backend:** Railway, Render, Heroku
- **Database:** Neon, Supabase, Railway Postgres

## 📝 Scripts

```json
{
  "dev": "ts-node-dev --respawn --transpile-only ./src/server.ts",
  "build": "tsc",
  "start": "node dist/server.js"
}
```

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License.

## 👨‍💻 Author

**Shakil Ahmed**

## 🙏 Acknowledgments

- Assignment 8 - Batch 5
- Programming Hero Level-2

---

**Happy Coding!** 🚀
