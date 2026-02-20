# Local Guide Platform - API Documentation

## Base URL
```
http://localhost:5000/api/v1
```

## Authentication
Most endpoints require a JWT token. Include it in the request header:
```
Authorization: <your-jwt-token>
```

---

## 📍 **Authentication Endpoints**

### Register User
```http
POST /api/v1/auth/register
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "role": "TOURIST", // or "GUIDE"
  "name": "John Doe",
  "phone": "+1234567890",
  "city": "New York",
  "country": "USA"
}
```

### Login
```http
POST /api/v1/auth/login
```

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

### Refresh Token
```http
POST /api/v1/auth/refresh-token
```

Use your `refreshToken` in the request body to get a new access token.

**Request Body:**
```json
{
  "refreshToken": "<your-refresh-token>"
}
```

### Get Current User
```http
GET /api/v1/auth/me
```
**Auth Required:** Yes

Use your `accessToken` in the `Authorization` header:

```http
Authorization: Bearer <your-access-token>
```

---

## 👤 **User/Profile Endpoints**

### Get All Users (Admin Only)
```http
GET /api/v1/users?page=1&limit=10&searchTerm=john&role=TOURIST&status=ACTIVE
```
**Auth Required:** Yes (Admin)

### Get All Guides (Public)
```http
GET /api/v1/users/guides?page=1&limit=10&city=New York&language=English&expertise=History
```

### Get User By ID
```http
GET /api/v1/users/:id
```

### Update Profile
```http
PATCH /api/v1/users/profile/:id
```
**Auth Required:** Yes

**Request Body:**
```json
{
  "name": "John Doe",
  "bio": "Passionate traveler",
  "city": "New York",
  "languages": ["English", "Spanish"],
  "expertise": ["History", "Food"],
  "dailyRate": 150,
  "travelPreferences": ["Adventure", "Culture"]
}
```

### Update User Status (Admin)
```http
PATCH /api/v1/users/:id/status
```
**Auth Required:** Yes (Admin)

**Request Body:**
```json
{
  "status": "BLOCKED" // or "ACTIVE", "DELETED"
}
```

### Delete User (Admin)
```http
DELETE /api/v1/users/:id
```
**Auth Required:** Yes (Admin)

---

## 🗺️ **Tour Endpoints**

### Get All Tours (Public)
```http
GET /api/v1/tours?page=1&limit=10&searchTerm=food&city=Paris&category=FOOD&minPrice=50&maxPrice=200&language=French
```

### Get Tour By ID (Public)
```http
GET /api/v1/tours/:id
```

### Create Tour (Guide Only)
```http
POST /api/v1/tours
```
**Auth Required:** Yes (Guide)

**Request Body:**
```json
{
  "title": "Hidden Jazz Bars of New Orleans",
  "description": "Explore the best jazz bars...",
  "price": 120,
  "duration": 4,
  "maxGroupSize": 8,
  "location": "New Orleans, USA",
  "meetingPoint": "Jackson Square",
  "city": "New Orleans",
  "country": "USA",
  "category": "NIGHTLIFE",
  "images": ["url1", "url2"],
  "included": ["Guide service", "Local recommendations"],
  "excluded": ["Food", "Personal expenses"]
}
```

### Get My Tours (Guide)
```http
GET /api/v1/tours/my/listings
```
**Auth Required:** Yes (Guide)

### Update Tour (Guide)
```http
PATCH /api/v1/tours/:id
```
**Auth Required:** Yes (Guide)

**Request Body:** (same as create, only include fields to update)

### Delete Tour (Guide)
```http
DELETE /api/v1/tours/:id
```
**Auth Required:** Yes (Guide)

---

## 📅 **Booking Endpoints**

### Create Booking (Tourist)
```http
POST /api/v1/bookings
```
**Auth Required:** Yes (Tourist)

**Request Body:**
```json
{
  "tourId": "tour-uuid",
  "bookingDate": "2026-03-15T10:00:00Z",
  "numberOfPeople": 2,
  "specialRequests": "Vegetarian food preferences"
}
```

### Get My Bookings (Tourist)
```http
GET /api/v1/bookings/my-bookings
```
**Auth Required:** Yes (Tourist)

### Get Guide Bookings (Guide)
```http
GET /api/v1/bookings/guide-bookings
```
**Auth Required:** Yes (Guide)

### Get All Bookings (Admin)
```http
GET /api/v1/bookings/all?page=1&limit=10&status=PENDING
```
**Auth Required:** Yes (Admin)

### Get Booking By ID
```http
GET /api/v1/bookings/:id
```
**Auth Required:** Yes (Tourist/Guide/Admin)

### Update Booking Status
```http
PATCH /api/v1/bookings/:id/status
```
**Auth Required:** Yes (Tourist/Guide/Admin)

**Request Body:**
```json
{
  "status": "CONFIRMED", // or "REJECTED", "CANCELLED"
  "cancellationReason": "Not available" // optional
}
```

---

## ⭐ **Review Endpoints**

### Create Review (Tourist)
```http
POST /api/v1/reviews
```
**Auth Required:** Yes (Tourist)

**Request Body:**
```json
{
  "bookingId": "booking-uuid",
  "rating": 5,
  "comment": "Amazing experience!"
}
```

### Get Reviews for Tour (Public)
```http
GET /api/v1/reviews/tour/:tourId
```

### Get My Reviews (Tourist)
```http
GET /api/v1/reviews/my-reviews
```
**Auth Required:** Yes (Tourist)

### Update Review
```http
PATCH /api/v1/reviews/:id
```
**Auth Required:** Yes (Tourist)

**Request Body:**
```json
{
  "rating": 4,
  "comment": "Updated comment"
}
```

### Delete Review
```http
DELETE /api/v1/reviews/:id
```
**Auth Required:** Yes (Tourist)

---

## 💳 **Payment Endpoints**

### Initiate Payment (Tourist)
```http
POST /api/v1/payments/initiate
```
**Auth Required:** Yes (Tourist)

**Request Body:**
```json
{
  "bookingId": "booking-uuid"
}
```

**Response (example):**
```json
{
  "paymentId": "payment-uuid",
  "bookingId": "booking-uuid",
  "checkoutUrl": "https://checkout.stripe.com/c/pay/...",
  "sessionId": "cs_test_...",
  "amount": 240,
  "currency": "usd"
}
```

### Stripe Webhook (Callback)
```http
POST /api/v1/payments/webhook
```
**Auth Required:** No (Stripe callback)
**Headers Required:** `stripe-signature`

### Verify Payment (Manual/Fallback - Admin)
```http
POST /api/v1/payments/verify/:paymentId
```
**Auth Required:** Yes (Admin)

**Request Body (optional):**
```json
{
  "status": "completed",
  "transactionId": "cs_test_...",
  "paymentMethod": "stripe"
}
```

### Get Payment by Booking ID
```http
GET /api/v1/payments/booking/:bookingId
```
**Auth Required:** Yes (Tourist/Guide/Admin)

### Get All Payments (Admin)
```http
GET /api/v1/payments/all?page=1&limit=10&status=SUCCESS
```
**Auth Required:** Yes (Admin)

---

## Response Format

### Success Response
```json
{
  "success": true,
  "message": "Operation successful!",
  "data": { ... },
  "meta": { // For paginated responses
    "page": 1,
    "limit": 10,
    "total": 100
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error message here",
  "errorDetails": { ... } // Only in development mode
}
```

---

## Enums

### UserRole
- `TOURIST`
- `GUIDE`
- `ADMIN`

### UserStatus
- `ACTIVE`
- `BLOCKED`
- `DELETED`

### BookingStatus
- `PENDING`
- `CONFIRMED`
- `COMPLETED`
- `CANCELLED`
- `REJECTED`

### TourCategory
- `FOOD`
- `ART`
- `ADVENTURE`
- `HISTORY`
- `NIGHTLIFE`
- `SHOPPING`
- `CULTURE`
- `NATURE`
- `PHOTOGRAPHY`
- `OTHER`

---

## Status Codes
- `200` - Success
- `201` - Created
- `400` - Bad Request
- `401` - Unauthorized
- `403` - Forbidden
- `404` - Not Found
- `409` - Conflict
- `500` - Internal Server Error
