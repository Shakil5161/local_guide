# 🚀 Backend Deployment Guide

Complete guide to deploy your Local Guide backend API to production.

**Current Production:** https://localguide-production.up.railway.app

---

## 📋 Table of Contents

- [Railway (Current)](#railway-current)
- [Render](#render)
- [Heroku](#heroku)
- [Docker](#docker)
- [Environment Variables](#environment-variables)
- [Database Setup](#database-setup)
- [Troubleshooting](#troubleshooting)

---

## 🚂 Railway (Current)

Railway is our current production platform. It's developer-friendly and has excellent PostgreSQL support.

**Live API:** https://localguide-production.up.railway.app

### **Initial Setup**

1. **Create Railway Account**
   - Go to [railway.app](https://railway.app)
   - Sign up with GitHub

2. **Create New Project**
   - Click "New Project"
   - Select "Deploy from GitHub repo"
   - Choose your backend repository

3. **Add PostgreSQL Database**
   - In your project, click "+ New"
   - Select "Database" → "PostgreSQL"
   - Railway will auto-create a PostgreSQL instance

### **Configure Environment Variables**

1. Click on your **backend service**
2. Go to **Variables** tab
3. Add the following:

```env
NODE_ENV=production
PORT=5000
JWT_SECRET=your-production-jwt-secret-min-32-chars
JWT_EXPIRES_IN=7d
JWT_REFRESH_SECRET=your-refresh-secret-different-from-main
JWT_REFRESH_EXPIRES_IN=365d
FRONTEND_URL=https://local-guide-eight.vercel.app
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
```

4. **Link Database:**
   - Click "+ New Variable"
   - Select "Reference"
   - Choose your PostgreSQL service
   - Select `DATABASE_URL`
   - This auto-links the database

### **Deploy**

Railway automatically deploys when you:
- Push to your main branch
- Update environment variables
- Click "Deploy" manually

### **Run Database Migrations**

#### **Option A: Local with Production DATABASE_URL**

```bash
# Copy DATABASE_URL from Railway Variables tab
export DATABASE_URL="postgresql://postgres:xxx@..."

# Run migrations
npx prisma migrate deploy
```

#### **Option B: Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# Run migrations
railway run npx prisma migrate deploy
```

#### **Option C: Railway Terminal**

1. In Railway, go to your backend service
2. Click "Terminal" (if available)
3. Run: `npx prisma migrate deploy`

### **Custom Domain (Optional)**

1. Go to **Settings** → **Networking**
2. Click "Generate Domain" (you get `*.up.railway.app`)
3. Or add custom domain and update DNS

### **Monitor Deployment**

1. Go to **Deployments** tab
2. Click on latest deployment
3. View logs for errors
4. Check build and runtime logs

---

## 🟦 Render

Render is a great alternative with a generous free tier.

### **Setup Steps**

1. **Create Render Account**
   - Go to [render.com](https://render.com)
   - Sign up with GitHub

2. **Create PostgreSQL Database**
   - Click "New +" → "PostgreSQL"
   - Choose a name
   - Select free tier or paid
   - Save the **Internal Database URL**

3. **Create Web Service**
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     ```
     Name: local-guide-backend
     Environment: Node
     Build Command: npm install && npx prisma generate && npm run build
     Start Command: npm run start
     ```

4. **Add Environment Variables**
   ```env
   NODE_ENV=production
   PORT=5000
   DATABASE_URL=<internal-database-url-from-step-2>
   JWT_SECRET=your-jwt-secret
   JWT_EXPIRES_IN=7d
   JWT_REFRESH_SECRET=your-refresh-secret
   JWT_REFRESH_EXPIRES_IN=365d
   FRONTEND_URL=https://your-frontend.vercel.app
   STRIPE_SECRET_KEY=sk_live_...
   STRIPE_WEBHOOK_SECRET=whsec_...
   ```

5. **Deploy**
   - Click "Create Web Service"
   - Render will build and deploy

6. **Run Migrations**
   - In Render Dashboard → Your Service → Shell
   - Run: `npx prisma migrate deploy`

---

## 🟣 Heroku

Classic platform with CLI tools.

### **Setup**

1. **Install Heroku CLI**
   ```bash
   npm install -g heroku
   ```

2. **Login**
   ```bash
   heroku login
   ```

3. **Create App**
   ```bash
   heroku create local-guide-backend
   ```

4. **Add PostgreSQL**
   ```bash
   heroku addons:create heroku-postgresql:mini
   ```

5. **Set Environment Variables**
   ```bash
   heroku config:set NODE_ENV=production
   heroku config:set JWT_SECRET=your-jwt-secret
   heroku config:set JWT_EXPIRES_IN=7d
   heroku config:set JWT_REFRESH_SECRET=your-refresh-secret
   heroku config:set JWT_REFRESH_EXPIRES_IN=365d
   heroku config:set FRONTEND_URL=https://your-frontend.vercel.app
   heroku config:set STRIPE_SECRET_KEY=sk_live_...
   ```

6. **Deploy**
   ```bash
   git push heroku main
   ```

7. **Run Migrations**
   ```bash
   heroku run npx prisma migrate deploy
   ```

8. **View Logs**
   ```bash
   heroku logs --tail
   ```

---

## 🐳 Docker

For containerized deployment.

### **Dockerfile**

Create `Dockerfile`:

```dockerfile
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files
COPY package*.json ./
COPY prisma ./prisma/

# Install dependencies
RUN npm ci

# Copy source
COPY . .

# Generate Prisma Client
RUN npx prisma generate

# Build TypeScript
RUN npm run build

# Production stage
FROM node:20-alpine AS runner

WORKDIR /app

ENV NODE_ENV=production

# Copy necessary files
COPY --from=builder /app/node_modules ./node_modules
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/package*.json ./

EXPOSE 5000

# Run migrations and start
CMD npx prisma migrate deploy && node dist/server.js
```

### **docker-compose.yml**

```yaml
version: '3.8'

services:
  postgres:
    image: postgres:17-alpine
    environment:
      POSTGRES_USER: postgres
      POSTGRES_PASSWORD: password
      POSTGRES_DB: local_guide_db
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"

  backend:
    build: .
    ports:
      - "5000:5000"
    environment:
      NODE_ENV: production
      DATABASE_URL: postgresql://postgres:password@postgres:5432/local_guide_db
      JWT_SECRET: your-jwt-secret
      JWT_EXPIRES_IN: 7d
      JWT_REFRESH_SECRET: your-refresh-secret
      JWT_REFRESH_EXPIRES_IN: 365d
      FRONTEND_URL: http://localhost:3000
      STRIPE_SECRET_KEY: sk_test_...
    depends_on:
      - postgres

volumes:
  postgres_data:
```

### **Deploy**

```bash
# Build and start
docker-compose up -d

# View logs
docker-compose logs -f backend

# Stop
docker-compose down
```

---

## 🔐 Environment Variables

### **Required Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `NODE_ENV` | Environment | `production` |
| `PORT` | Server port | `5000` |
| `DATABASE_URL` | PostgreSQL connection | `postgresql://...` |
| `JWT_SECRET` | Access token secret | Min 32 characters |
| `JWT_EXPIRES_IN` | Access token expiry | `7d` |
| `JWT_REFRESH_SECRET` | Refresh token secret | Different from JWT_SECRET |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token expiry | `365d` |
| `FRONTEND_URL` | Frontend URL for CORS | `https://...` |

### **Payment Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Webhook secret | `whsec_...` |

### **How to Set**

**Railway:**
- Dashboard → Service → Variables → + New Variable

**Render:**
- Dashboard → Service → Environment → Add Environment Variable

**Heroku:**
```bash
heroku config:set VARIABLE_NAME=value
```

---

## 🗄️ Database Setup

### **Create Database Schema**

After deploying, you need to create database tables:

```bash
# Using Railway CLI
railway run npx prisma migrate deploy

# Using Render Shell
# Go to Shell tab and run:
npx prisma migrate deploy

# Using Heroku
heroku run npx prisma migrate deploy
```

### **Import Data**

If you have existing data:

```bash
# 1. Export from local
npm run export-data

# 2. Upload database-export.json to production

# 3. Run import on production
railway run node import-data.js
# or
heroku run node import-data.js
```

### **Verify Database**

```bash
# Open Prisma Studio
railway run npx prisma studio
# Then access localhost:5555
```

---

## 🧪 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Database created and accessible
- [ ] `DATABASE_URL` set correctly
- [ ] Frontend URL added to CORS whitelist
- [ ] Prisma migrations ready
- [ ] Stripe keys are production keys
- [ ] JWT secrets are strong and unique
- [ ] Build passes locally: `npm run build`
- [ ] No TypeScript errors
- [ ] Test API endpoints locally

---

## 🔍 Testing After Deployment

### **1. Health Check**

```bash
curl https://your-api.railway.app/
# Should return: {"Message": "Local Guide Platform API - Running Successfully 🚀"}
```

### **2. Test Authentication**

```bash
curl -X POST https://your-api.railway.app/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"musa@gmail.com","password":"password123"}'
```

### **3. Test Protected Route**

```bash
# Use token from login response
curl https://your-api.railway.app/api/v1/tours \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### **4. Test CORS**

Open your frontend and check browser console for CORS errors.

---

## 🐛 Troubleshooting

### **Issue: "Cannot connect to database"**

**Symptoms:** App crashes with Prisma connection error

**Solutions:**
1. Verify `DATABASE_URL` is set correctly
2. Check database is running
3. Test connection:
   ```bash
   railway run npx prisma db execute --stdin < test.sql
   ```
4. Check if database accepts external connections

### **Issue: "CORS Error from Frontend"**

**Symptoms:** Frontend can't make requests

**Solutions:**
1. Add frontend URL to `FRONTEND_URL` environment variable
2. Check `src/app.ts` includes your frontend in allowed origins:
   ```typescript
   const allowedOrigins = [
     'https://your-frontend.vercel.app',
   ];
   ```
3. Redeploy backend after changes

### **Issue: "Prisma Client Not Generated"**

**Symptoms:** Import errors for Prisma

**Solutions:**
1. Ensure build command includes: `npx prisma generate`
2. Check `package.json` has postinstall script:
   ```json
   "postinstall": "npx prisma generate"
   ```
3. Manually run: `railway run npx prisma generate`

### **Issue: "Build Fails"**

**Symptoms:** Deployment fails during build

**Solutions:**
1. Check build logs for errors
2. Test build locally: `npm run build`
3. Check TypeScript errors: `npm run lint`
4. Verify all dependencies in `package.json`
5. Check Node.js version matches

### **Issue: "Stripe Webhook Not Working"**

**Symptoms:** Payments don't update status

**Solutions:**
1. Update webhook URL in Stripe Dashboard:
   ```
   https://your-api.railway.app/api/v1/payments/webhook
   ```
2. Copy webhook secret and update `STRIPE_WEBHOOK_SECRET`
3. Test webhook:
   ```bash
   stripe trigger payment_intent.succeeded
   ```

### **Issue: "Memory/CPU Errors"**

**Symptoms:** App crashes under load

**Solutions:**
1. Upgrade plan (Railway/Render)
2. Add caching (Redis)
3. Optimize database queries
4. Add pagination to large responses

---

## 📊 Monitoring

### **View Logs**

**Railway:**
- Dashboard → Service → Logs tab
- Real-time logs with filtering

**Render:**
- Dashboard → Service → Logs tab

**Heroku:**
```bash
heroku logs --tail
```

### **Set Up Error Tracking**

Install Sentry:

```bash
npm install @sentry/node
```

Add to `src/server.ts`:

```typescript
import * as Sentry from "@sentry/node";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
});
```

### **Database Monitoring**

- Railway: Built-in metrics
- Render: Database metrics tab
- External: Use tools like Datadog, New Relic

---

## 🔒 Security Best Practices

1. **Environment Variables**
   - Never commit `.env` files
   - Use strong, unique secrets
   - Rotate keys regularly

2. **Database**
   - Use SSL connections
   - Regular backups
   - Strong passwords

3. **API Security**
   - Rate limiting (consider adding)
   - Helmet.js for headers
   - Keep dependencies updated

4. **CORS**
   - Only allow specific origins
   - Don't use `*` in production

---

## 🔄 CI/CD

### **GitHub Actions (Optional)**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to Railway

on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Install Railway CLI
        run: npm install -g @railway/cli
      
      - name: Deploy
        run: railway up
        env:
          RAILWAY_TOKEN: ${{ secrets.RAILWAY_TOKEN }}
```

---

## 📈 Performance Optimization

1. **Database Indexing**
   - Add indexes to frequently queried fields
   - Check `prisma/schema.prisma`

2. **Connection Pooling**
   - Already handled by Prisma + pg adapter

3. **Caching**
   - Consider Redis for frequently accessed data

4. **Compression**
   - Add compression middleware

---

## 🆘 Need Help?

1. Check Railway/Render documentation
2. View deployment logs
3. Test locally first
4. Check this guide's troubleshooting section
5. Reach out to support

---

## 🎉 Success!

Your backend is now deployed! 

**Next Steps:**
1. Update frontend `NEXT_PUBLIC_API_BASE_URL`
2. Test all endpoints
3. Import production data
4. Monitor logs
5. Set up error tracking

---

**Happy Deploying! 🚀**
