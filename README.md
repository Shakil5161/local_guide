# 🌍 Local Guide Platform - Backend API

> A comprehensive RESTful API for connecting travelers with local tour guides, built with modern technologies and best practices.

**🔗 Live API:** [https://localguide-production.up.railway.app](https://localguide-production.up.railway.app)

**📖 API Documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

**🌐 Frontend:** [https://local-guide-eight.vercel.app](https://local-guide-eight.vercel.app)

![Node.js](https://img.shields.io/badge/Node.js-20-green?style=flat&logo=node.js)
![Express](https://img.shields.io/badge/Express-5-black?style=flat&logo=express)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat&logo=typescript)
![Prisma](https://img.shields.io/badge/Prisma-7.3-2D3748?style=flat&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-17-316192?style=flat&logo=postgresql)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Database Schema](#-database-schema)
- [API Endpoints](#-api-endpoints-overview)
- [Authentication](#-authentication)
- [User Roles](#-user-roles)
- [Error Handling](#-error-handling)
- [Deployment](#-deployment)
- [Testing](#-testing)
- [Contributing](#-contributing)

---

## ✨ Features

### 🔐 **Authentication & Security**
- JWT-based authentication with access & refresh tokens
- Role-based access control (RBAC)
- Password hashing with bcrypt
- Protected routes middleware
- Token refresh mechanism

### 👥 **User Management**
- Three user roles: Tourist, Guide, Admin
- User registration with role selection
- Profile management with role-specific fields
- User blocking/deletion (Admin only)
- Email uniqueness validation

### 🗺️ **Tour Management**
- CRUD operations for tour listings
- Advanced search & filtering (city, category, price range)
- Pagination support
- Image upload support (multiple images per tour)
- Tour availability calendar
- Active/inactive tour status

### 📅 **Booking System**
- Create bookings with date and party size
- Booking status: PENDING, CONFIRMED, COMPLETED, CANCELLED, REJECTED
- Guide can accept/reject bookings
- Tourist can cancel bookings
- Price calculation based on party size
- Special requests field

### ⭐ **Review & Rating System**
- 1-5 star rating system
- Text reviews
- Only for completed tours
- Update and delete own reviews
- Average rating calculation

### 💳 **Payment Integration**
- Stripe payment integration
- Payment intent creation
- Webhook handling for payment confirmation
- Payment status tracking (pending, completed, failed)
- Transaction ID storage

### 🛡️ **Error Handling**
- Global error handler
- Custom API errors
- Prisma error formatting
- JWT error handling
- Validation error formatting
- 404 Not Found handler

---

## 🛠️ Tech Stack

### **Core Technologies**
- **[Node.js 20+](https://nodejs.org/)** - JavaScript runtime
- **[Express.js 5](https://expressjs.com/)** - Web framework
- **[TypeScript 5.9](https://www.typescriptlang.org/)** - Type safety

### **Database & ORM**
- **[PostgreSQL 17](https://www.postgresql.org/)** - Relational database
- **[Prisma 7.3](https://www.prisma.io/)** - Modern ORM with type safety
- **[@prisma/adapter-pg](https://www.prisma.io/docs/orm/overview/databases/postgresql)** - PostgreSQL driver adapter

### **Authentication & Security**
- **[jsonwebtoken](https://github.com/auth0/node-jsonwebtoken)** - JWT implementation
- **[bcryptjs](https://github.com/dcodeIO/bcrypt.js)** - Password hashing

### **Payments**
- **[Stripe](https://stripe.com/)** - Payment processing

### **Utilities**
- **[dotenv](https://github.com/motdotla/dotenv)** - Environment variables
- **[cors](https://github.com/expressjs/cors)** - Cross-Origin Resource Sharing
- **[http-status](https://github.com/adaltas/node-http-status)** - HTTP status codes

### **Development Tools**
- **[ts-node-dev](https://github.com/wclr/ts-node-dev)** - Development server
- **[ESLint](https://eslint.org/)** - Code linting (optional)

---

## 🚀 Getting Started

### **Prerequisites**

- Node.js 20.x or higher
- PostgreSQL 14+ database
- npm or yarn package manager
- Stripe account (for payments)

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Local-guide-backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file in the root:
   ```env
   NODE_ENV=development
   PORT=5000
   DATABASE_URL="postgresql://username:password@localhost:5432/local_guide_db"
   JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-refresh-token-secret
   JWT_REFRESH_EXPIRES_IN=365d
   FRONTEND_URL=http://localhost:3000
   STRIPE_SECRET_KEY=sk_test_...
   ```

4. **Set up database**
   
   ```bash
   # Generate Prisma Client
   npx prisma generate
   
   # Run migrations (create database tables)
   npx prisma migrate deploy
   
   # Or for development with migration name
   npx prisma migrate dev --name init
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```
   
   The server will start at `http://localhost:5000`

### **Build for Production**

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
Local-guide-backend/
├── prisma/
│   ├── schema/                    # Prisma schema files
│   │   ├── schema.prisma         # Main schema
│   │   ├── user.prisma           # User models (split for organization)
│   │   ├── tour.prisma
│   │   ├── booking.prisma
│   │   ├── payment.prisma
│   │   ├── review.prisma
│   │   └── enum.prisma
│   ├── migrations/               # Database migrations
│   └── prisma.config.ts         # Prisma configuration
│
├── src/
│   ├── app/
│   │   ├── modules/             # Feature modules
│   │   │   ├── auth/           # Authentication
│   │   │   │   ├── auth.controller.ts
│   │   │   │   ├── auth.service.ts
│   │   │   │   └── auth.route.ts
│   │   │   │
│   │   │   ├── user/           # User management
│   │   │   │   ├── user.controller.ts
│   │   │   │   ├── user.service.ts
│   │   │   │   └── user.route.ts
│   │   │   │
│   │   │   ├── tour/           # Tour management
│   │   │   │   ├── tour.controller.ts
│   │   │   │   ├── tour.service.ts
│   │   │   │   └── tour.route.ts
│   │   │   │
│   │   │   ├── booking/        # Booking system
│   │   │   │   ├── booking.controller.ts
│   │   │   │   ├── booking.service.ts
│   │   │   │   └── booking.route.ts
│   │   │   │
│   │   │   ├── review/         # Review system
│   │   │   │   ├── review.controller.ts
│   │   │   │   ├── review.service.ts
│   │   │   │   └── review.route.ts
│   │   │   │
│   │   │   └── payment/        # Payment processing
│   │   │       ├── payment.controller.ts
│   │   │       ├── payment.service.ts
│   │   │       └── payment.route.ts
│   │   │
│   │   ├── middlewares/
│   │   │   ├── auth.ts                    # JWT authentication
│   │   │   ├── globalErrorHandler.ts     # Error handling
│   │   │   └── notFound.ts               # 404 handler
│   │   │
│   │   ├── errors/
│   │   │   └── ApiError.ts               # Custom error class
│   │   │
│   │   ├── helper/
│   │   │   └── jwtHelper.ts              # JWT utilities
│   │   │
│   │   ├── shared/
│   │   │   ├── prisma.ts                 # Prisma client
│   │   │   ├── catchAsync.ts             # Async error wrapper
│   │   │   └── sendResponse.ts           # Response formatter
│   │   │
│   │   ├── routes/
│   │   │   └── index.ts                  # Main router
│   │   │
│   │   └── type/
│   │       ├── common.ts                 # Common types
│   │       └── index.d.ts                # Type definitions
│   │
│   ├── config/
│   │   └── index.ts                      # Environment config
│   │
│   ├── app.ts                            # Express app setup
│   └── server.ts                         # Server entry point
│
├── .env                                  # Environment variables (gitignored)
├── .gitignore
├── package.json
├── tsconfig.json
├── API_DOCUMENTATION.md                  # API docs
└── README.md                             # This file
```

---

## 🔐 Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
NODE_ENV=development
PORT=5000

# Database
DATABASE_URL="postgresql://username:password@host:port/database"

# JWT Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-characters
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-token-secret-different-from-main
JWT_REFRESH_EXPIRES_IN=365d

# CORS Configuration
FRONTEND_URL=http://localhost:3000

# Payment Gateway (Stripe)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

### **Variable Descriptions:**

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` or `production` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection string | `postgresql://user:pass@host:5432/db` |
| `JWT_SECRET` | Secret for access tokens | Min 32 characters |
| `JWT_EXPIRES_IN` | Access token expiry | `7d`, `24h`, `60m` |
| `JWT_REFRESH_SECRET` | Secret for refresh tokens | Different from JWT_SECRET |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `365d` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://yourapp.vercel.app` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` or `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |

---

## 🗃️ Database Schema

### **Main Models**

#### **User**
- Stores authentication credentials and basic info
- Fields: id, email, password, role, status, timestamps

#### **Profile**
- Extended user information
- Tourist fields: preferences, phone, city
- Guide fields: expertise, daily rate, years of experience, languages
- One-to-one with User

#### **Tour**
- Tour listings created by guides
- Fields: title, description, category, price, duration, location, images
- One-to-many with User (guide)

#### **Booking**
- Tour bookings
- Fields: booking date, number of people, total price, status
- Many-to-one with User (tourist), User (guide), Tour

#### **Review**
- Tour reviews and ratings
- Fields: rating (1-5), comment
- Many-to-one with Tour and User

#### **Payment**
- Payment transactions
- Fields: amount, payment method, transaction ID, status
- One-to-one with Booking

#### **TourAvailability** (Optional)
- Track available dates for tours
- Many-to-one with Tour

### **View Full Schema**

See `prisma/schema/schema.prisma` for complete schema definition.

---

## 🌐 API Endpoints Overview

**Base URL:** `https://localguide-production.up.railway.app/api/v1`

### **Authentication** (`/api/v1/auth`)
```
POST   /register          - Create new account
POST   /login             - Login with credentials
POST   /refresh-token     - Get new access token
GET    /me                - Get current user info
```

### **Users** (`/api/v1/users`)
```
GET    /                  - Get all users (Admin only)
GET    /profile           - Get my profile
PATCH  /profile           - Update my profile
PATCH  /:id/status        - Update user status (Admin only)
DELETE /:id               - Delete user (Admin only)
```

### **Tours** (`/api/v1/tours`)
```
GET    /                  - Get all tours (with filters)
GET    /:id               - Get tour details
POST   /                  - Create tour (Guide only)
PATCH  /:id               - Update tour (Guide only)
DELETE /:id               - Delete tour (Guide only)
GET    /my/listings       - Get my tours (Guide only)
```

### **Bookings** (`/api/v1/bookings`)
```
GET    /all               - Get all bookings (Admin only)
POST   /                  - Create booking (Tourist only)
GET    /my-bookings       - Get my bookings (Tourist only)
GET    /guide-bookings    - Get bookings for my tours (Guide only)
GET    /:id               - Get booking details
PATCH  /:id/status        - Update booking status
```

### **Reviews** (`/api/v1/reviews`)
```
GET    /                  - Get all reviews
GET    /:id               - Get review details
POST   /                  - Create review (Tourist only)
PATCH  /:id               - Update review (Owner only)
DELETE /:id               - Delete review (Owner only)
```

### **Payments** (`/api/v1/payments`)
```
POST   /create-intent     - Create payment intent
POST   /webhook           - Stripe webhook handler
GET    /                  - Get all payments (Admin only)
GET    /:id               - Get payment details
```

**📖 For detailed API documentation with request/response examples, see [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)**

---

## 🔑 Authentication

### **How It Works**

1. **Register/Login** → Receive access token & refresh token
2. **Access Token** → Valid for 7 days, used for API requests
3. **Refresh Token** → Valid for 365 days, used to get new access token
4. **Protected Routes** → Require `Authorization: Bearer <token>` header

### **Token Flow**

```
1. POST /api/v1/auth/login
   → Returns: { accessToken, refreshToken }

2. Use accessToken in headers:
   Authorization: Bearer <accessToken>

3. When accessToken expires:
   POST /api/v1/auth/refresh-token
   Body: { refreshToken }
   → Returns: { accessToken }
```

### **Usage Example**

```typescript
// Login
const response = await fetch('https://localguide-production.up.railway.app/api/v1/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ email: 'user@example.com', password: 'password123' })
});

const { data } = await response.json();
// data.accessToken, data.refreshToken

// Protected request
const tours = await fetch('https://localguide-production.up.railway.app/api/v1/tours', {
  headers: { 'Authorization': `Bearer ${data.accessToken}` }
});
```

---

## 👥 User Roles

### **Tourist (Default Role)**
**Permissions:**
- Browse and search tours
- Create bookings
- Make payments
- Write reviews for completed tours
- Manage own profile
- View booking history

### **Guide**
**Permissions:**
- All Tourist permissions
- Create, edit, delete own tours
- Manage tour availability
- View booking requests for own tours
- Accept/reject bookings
- Update tour pricing and details
- View earnings statistics

### **Admin**
**Permissions:**
- All system access
- Manage all users (block, delete, promote)
- View all bookings and payments
- View platform analytics
- Content moderation
- System configuration

---

## 🛡️ Error Handling

### **Error Response Format**

All errors follow this structure:

```json
{
  "success": false,
  "message": "Error message here",
  "errorMessages": [
    {
      "path": "field_name",
      "message": "Specific error"
    }
  ],
  "stack": "Stack trace (development only)"
}
```

### **Common HTTP Status Codes**

| Code | Meaning |
|------|---------|
| `200` | Success |
| `201` | Created |
| `400` | Bad Request (validation error) |
| `401` | Unauthorized (not logged in) |
| `403` | Forbidden (insufficient permissions) |
| `404` | Not Found |
| `409` | Conflict (duplicate data) |
| `500` | Internal Server Error |

---

## 🚀 Deployment

### **Railway (Current Production)**

**Live URL:** https://localguide-production.up.railway.app

#### **Environment Variables on Railway:**

```env
NODE_ENV=production
PORT=5000
DATABASE_URL=<provided-by-railway-postgres>
JWT_SECRET=<strong-secret-key>
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=<different-strong-secret>
JWT_REFRESH_EXPIRES_IN=365d
FRONTEND_URL=https://local-guide-eight.vercel.app
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### **Deployment Steps:**

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Deploy to Railway"
   git push origin main
   ```

2. **Railway automatically:**
   - Detects changes
   - Installs dependencies
   - Runs `npm run build`
   - Starts with `npm run start`

3. **Database migrations:**
   - Run in Railway terminal or via local with production DATABASE_URL:
   ```bash
   npx prisma migrate deploy
   ```

### **Other Platforms**

#### **Render**
1. Connect GitHub repository
2. Select "Web Service"
3. Build Command: `npm install && npx prisma generate && npm run build`
4. Start Command: `npm run start`
5. Add environment variables
6. Deploy

#### **Heroku**
```bash
# Add buildpack
heroku buildpacks:set heroku/nodejs

# Deploy
git push heroku main

# Run migrations
heroku run npx prisma migrate deploy
```

### **Database Options**

- **Railway Postgres** (Current) - $5/month
- **Neon** - Serverless Postgres with free tier
- **Supabase** - PostgreSQL with additional features
- **ElephantSQL** - Managed PostgreSQL

---

## 🧪 Testing

### **Test Credentials**

Use these accounts for testing:

#### **Admin Account**
```
Email: shakilahmed5161@gmail.com
Password: password123
```

#### **Guide Account**
```
Email: safa@gmail.com
Password: password123
```

#### **Tourist Account**
```
Email: musa@gmail.com
Password: password123
```

### **Stripe Test Cards**

```
Success: 4242 4242 4242 4242
Decline: 4000 0000 0000 0002
Requires Auth: 4000 0025 0000 3155

Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits
ZIP: Any 5 digits
```

### **API Testing**

Use tools like:
- **Postman** - Import API collection
- **Thunder Client** - VS Code extension
- **curl** - Command line

Example:
```bash
# Test health check
curl https://localguide-production.up.railway.app/

# Test login
curl -X POST https://localguide-production.up.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"musa@gmail.com","password":"password123"}'
```

---

## 📝 Scripts

```bash
# Development
npm run dev              # Start dev server with hot reload

# Production
npm run build            # Compile TypeScript to JavaScript
npm run start            # Start production server

# Prisma
npx prisma generate      # Generate Prisma Client
npx prisma migrate dev   # Create and apply migration
npx prisma migrate deploy # Apply migrations (production)
npx prisma studio        # Open Prisma Studio GUI

# Database
npm run export-data      # Export database to JSON
npm run import-data      # Import data from JSON
```

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

### **Development Guidelines**

- Follow TypeScript best practices
- Use meaningful commit messages
- Write tests for new features
- Update API documentation
- Maintain code formatting

---

## 📄 License

MIT License - see LICENSE file for details

---

## 👨‍💻 Author

**Shakil Ahmed**
- Email: shakilahmed5161@gmail.com
- GitHub: [@shakilahmed](https://github.com/shakilahmed5161)

---

## 🙏 Acknowledgments

- **Programming Hero** - Batch 5, Level 2
- **Assignment 8** - Local Guide Platform
- Next.js, Prisma, and Express.js communities
- Railway for excellent deployment platform

---

## 📞 Support

For issues and questions:
- Create an issue in the repository
- Email: shakilahmed5161@gmail.com

---

## 🔗 Links

- **Frontend Repository:** [Local-guide-frontend](../Local-guide-frontend)
- **Live Frontend:** https://local-guide-eight.vercel.app
- **Live API:** https://localguide-production.up.railway.app
- **API Documentation:** [API_DOCUMENTATION.md](./API_DOCUMENTATION.md)

---

**Made with ❤️ and ☕ | Happy Coding! 🚀**
