# 🚀 Deployment Guide - Local Guide Frontend

Complete guide to deploy your Local Guide frontend to various platforms.

---

## 📋 Table of Contents

- [Vercel (Recommended)](#vercel-recommended)
- [Netlify](#netlify)
- [Railway](#railway)
- [Docker](#docker)
- [Environment Variables](#environment-variables)
- [Troubleshooting](#troubleshooting)

---

## 🟢 Vercel (Recommended)

Vercel is the easiest and most optimized platform for Next.js applications.

### **Step 1: Prepare Your Project**

1. Make sure your code is pushed to GitHub/GitLab/Bitbucket
2. Ensure `package.json` has correct scripts:
   ```json
   {
     "scripts": {
       "dev": "next dev",
       "build": "next build",
       "start": "next start",
       "lint": "next lint"
     }
   }
   ```

### **Step 2: Deploy to Vercel**

#### **Option A: Using Vercel Dashboard**

1. Go to [vercel.com](https://vercel.com)
2. Click **"Add New Project"**
3. Import your Git repository
4. Vercel auto-detects Next.js settings
5. Add environment variables (see below)
6. Click **"Deploy"**

#### **Option B: Using Vercel CLI**

```bash
# Install Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
cd Local-guide-frontend
vercel

# Deploy to production
vercel --prod
```

### **Step 3: Configure Environment Variables**

In Vercel Dashboard → Your Project → Settings → Environment Variables:

```env
NEXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
```

**Important:**
- Add variables for **Production**, **Preview**, and **Development**
- Use `https://` URLs for production
- Never commit `.env` files to Git

### **Step 4: Custom Domain (Optional)**

1. Go to Project Settings → Domains
2. Add your custom domain
3. Update DNS records as instructed
4. SSL is automatic!

### **Step 5: Automatic Deployments**

Vercel automatically deploys:
- **Production:** When you push to `main` branch
- **Preview:** For every pull request

---

## 🟦 Netlify

### **Step 1: Build Settings**

Create `netlify.toml` in project root:

```toml
[build]
  command = "npm run build"
  publish = ".next"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

### **Step 2: Deploy**

#### **Via Netlify Dashboard**

1. Go to [netlify.com](https://netlify.com)
2. Click "Add new site" → "Import an existing project"
3. Connect to your Git provider
4. Select repository
5. Build settings are auto-detected
6. Add environment variables
7. Click "Deploy"

#### **Via Netlify CLI**

```bash
# Install CLI
npm install -g netlify-cli

# Login
netlify login

# Deploy
netlify deploy

# Deploy to production
netlify deploy --prod
```

### **Environment Variables**

In Netlify Dashboard → Site Settings → Environment Variables:

```
NEXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app/api/v1
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
```

---

## 🟣 Railway

Railway is great if you want your frontend and backend on the same platform.

### **Step 1: Create New Project**

1. Go to [railway.app](https://railway.app)
2. Click "New Project"
3. Select "Deploy from GitHub repo"

### **Step 2: Configure**

1. Railway auto-detects Next.js
2. Add environment variables in Variables tab:
   ```
   NEXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app/api/v1
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
   ```

### **Step 3: Generate Domain**

1. Go to Settings → Networking
2. Click "Generate Domain"
3. Your app will be available at `*.up.railway.app`

---

## 🐳 Docker

### **Create Dockerfile**

Create `Dockerfile` in project root:

```dockerfile
# Build stage
FROM node:18-alpine AS builder

WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .

# Build args for environment variables
ARG NEXT_PUBLIC_API_BASE_URL
ARG NEXT_PUBLIC_STRIPE_PUBLIC_KEY

ENV NEXT_PUBLIC_API_BASE_URL=$NEXT_PUBLIC_API_BASE_URL
ENV NEXT_PUBLIC_STRIPE_PUBLIC_KEY=$NEXT_PUBLIC_STRIPE_PUBLIC_KEY

RUN npm run build

# Production stage
FROM node:18-alpine AS runner

WORKDIR /app

ENV NODE_ENV production

# Copy necessary files
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static

EXPOSE 3000

CMD ["node", "server.js"]
```

### **Create docker-compose.yml**

```yaml
version: '3.8'

services:
  frontend:
    build:
      context: .
      args:
        NEXT_PUBLIC_API_BASE_URL: ${NEXT_PUBLIC_API_BASE_URL}
        NEXT_PUBLIC_STRIPE_PUBLIC_KEY: ${NEXT_PUBLIC_STRIPE_PUBLIC_KEY}
    ports:
      - "3000:3000"
    environment:
      - NODE_ENV=production
    restart: unless-stopped
```

### **Deploy**

```bash
# Build
docker build -t local-guide-frontend .

# Run
docker run -p 3000:3000 \
  -e NEXT_PUBLIC_API_BASE_URL=https://api.example.com/api/v1 \
  -e NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_... \
  local-guide-frontend

# Or use docker-compose
docker-compose up -d
```

---

## 🔐 Environment Variables

### **Required Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API URL | `https://api.example.com/api/v1` |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | Stripe publishable key | `pk_live_...` |

### **Optional Variables**

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | `G-XXXXXXXXXX` |
| `NEXT_PUBLIC_SENTRY_DSN` | Sentry error tracking | `https://...` |

### **How to Add**

**Vercel:**
- Dashboard → Project → Settings → Environment Variables

**Netlify:**
- Dashboard → Site Settings → Environment Variables

**Railway:**
- Dashboard → Project → Variables

**Local Development:**
- Create `.env.local` file in project root

---

## 🔍 Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Backend API is live and accessible
- [ ] CORS configured in backend to allow frontend domain
- [ ] API URL uses `https://` in production
- [ ] Stripe keys are production keys (not test keys)
- [ ] All dependencies in `package.json`
- [ ] Build passes locally: `npm run build`
- [ ] No console errors in production build
- [ ] Images optimized and loading correctly
- [ ] Meta tags and SEO configured
- [ ] Custom domain DNS configured (if using)

---

## 🧪 Testing After Deployment

### **1. Test Basic Functionality**
```bash
# Check if site loads
curl https://your-site.vercel.app

# Should return HTML
```

### **2. Test API Connection**
- Open browser console on your deployed site
- Check Network tab for API calls
- Verify no CORS errors

### **3. Test All User Flows**
- [ ] Registration works
- [ ] Login works
- [ ] Tour browsing works
- [ ] Booking flow works
- [ ] Payment works (use Stripe test cards)
- [ ] Dashboard accessible
- [ ] Language switching works

---

## 🐛 Troubleshooting

### **Issue: "API Network Error"**

**Symptoms:** Frontend can't connect to backend

**Solutions:**
1. Check `NEXT_PUBLIC_API_BASE_URL` is correct
2. Verify backend is running: `curl https://your-api.com/api/v1/tours`
3. Check backend CORS settings allow your frontend domain

**Fix CORS on Backend:**
```typescript
// In backend src/app.ts
const allowedOrigins = [
  'https://your-frontend.vercel.app',
  // ...
];
```

### **Issue: "Environment Variables Not Working"**

**Symptoms:** API calls go to wrong URL or undefined

**Solutions:**
1. Variables must start with `NEXT_PUBLIC_` for client-side
2. Redeploy after adding variables (don't just update)
3. Check if variables are visible in build logs
4. Clear build cache and redeploy

**Vercel:**
- Deployments → Latest → Redeploy (uncheck "Use existing cache")

### **Issue: "404 on Page Refresh"**

**Symptoms:** Pages work when navigating, but refresh gives 404

**Solutions:**
- For Vercel: Auto-handled
- For Netlify: Add `_redirects` file:
  ```
  /*    /index.html   200
  ```
- For custom server: Configure fallback routes

### **Issue: "Images Not Loading"**

**Symptoms:** Broken images or slow loading

**Solutions:**
1. Check image URLs are absolute
2. Verify backend serves images correctly
3. Add domains to `next.config.ts`:
   ```typescript
   images: {
     remotePatterns: [
       { protocol: 'https', hostname: 'cdn.pixabay.com' },
     ],
   }
   ```

### **Issue: "Build Fails"**

**Symptoms:** Deployment fails during build

**Solutions:**
1. Test build locally: `npm run build`
2. Check for TypeScript errors: `npm run lint`
3. Check for missing dependencies
4. View build logs for specific errors
5. Ensure Node.js version matches locally and in deployment

### **Issue: "Payment Not Working"**

**Symptoms:** Stripe payment fails or doesn't initiate

**Solutions:**
1. Verify `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` is set
2. Use correct key format: `pk_live_...` for production
3. Check Stripe dashboard for error logs
4. Test with Stripe test cards in development

---

## 📊 Performance Optimization

### **1. Enable Caching**

```typescript
// next.config.ts
const nextConfig = {
  images: {
    remotePatterns: [...],
  },
  // Enable SWC minification
  swcMinify: true,
};
```

### **2. Analyze Bundle**

```bash
# Install analyzer
npm install @next/bundle-analyzer

# Add to next.config.ts
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withBundleAnalyzer(nextConfig);

# Run analysis
ANALYZE=true npm run build
```

### **3. Use CDN for Static Assets**

- Vercel automatically uses CDN
- For others, use Cloudflare or similar

---

## 🔒 Security Best Practices

1. **Never commit `.env` files**
   - Add to `.gitignore`
   - Use platform's environment variable settings

2. **Use HTTPS only**
   - All API URLs should use `https://`
   - Force HTTPS in production

3. **Implement CSP headers**
   ```typescript
   // next.config.ts
   async headers() {
     return [
       {
         source: '/(.*)',
         headers: [
           {
             key: 'Content-Security-Policy',
             value: "default-src 'self'; ..."
           }
         ]
       }
     ];
   }
   ```

4. **Keep dependencies updated**
   ```bash
   npm audit
   npm update
   ```

---

## 📈 Monitoring

### **Vercel Analytics**

Built-in analytics in Vercel dashboard:
- Page views
- Performance metrics
- Error tracking

### **Google Analytics**

Add GA4:

1. Add environment variable:
   ```
   NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
   ```

2. Add to `_app.tsx` or `layout.tsx`

### **Sentry (Error Tracking)**

```bash
npm install @sentry/nextjs

# Initialize
npx @sentry/wizard -i nextjs
```

---

## 🎉 Success!

Your frontend is now deployed! 

**Next Steps:**
1. Test all functionality
2. Set up custom domain
3. Configure monitoring
4. Share with users!

**Need Help?**
- Check logs in your deployment platform
- Review backend logs
- Check browser console
- Refer to main [README.md](./README.md)

---

**Happy Deploying! 🚀**
