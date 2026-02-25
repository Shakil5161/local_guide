# ⚡ Quick Start Guide

Get Local Guide frontend running in 5 minutes!

---

## 🚀 Super Fast Setup

```bash
# 1. Clone & Navigate
git clone <your-repo-url>
cd Local-guide-frontend

# 2. Install Dependencies
npm install

# 3. Create Environment File
cp .env.example .env.local
# Edit .env.local with your values

# 4. Run Development Server
npm run dev

# 5. Open Browser
# Visit http://localhost:3000
```

---

## 🔑 Essential Environment Variables

Create `.env.local`:

```env
NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_51...
```

---

## 🧪 Test User Credentials

Use these to test the platform:

### **Tourist Account**
```
Email: musa@gmail.com
Password: password123
```

### **Guide Account**
```
Email: safa@gmail.com
Password: password123
```

### **Admin Account**
```
Email: shakilahmed5161@gmail.com
Password: password123
```

---

## 📱 Available Pages

After running `npm run dev`, try these URLs:

```
http://localhost:3000           - Home page
http://localhost:3000/explore   - Browse tours
http://localhost:3000/guides    - Browse guides
http://localhost:3000/login     - Login page
http://localhost:3000/register  - Sign up
http://localhost:3000/dashboard/tourist   - Tourist dashboard (login first)
http://localhost:3000/dashboard/guide     - Guide dashboard (login first)
http://localhost:3000/dashboard/admin     - Admin dashboard (login first)
```

---

## 🛠️ Useful Commands

```bash
# Development
npm run dev          # Start dev server at localhost:3000

# Production Build
npm run build        # Build for production
npm run start        # Run production build

# Code Quality
npm run lint         # Run ESLint
npm run format       # Format code (if configured)

# Deployment
npm run build        # Build before deploying
```

---

## 🔧 Common Issues

### **"Cannot connect to API"**
- ✅ Make sure backend is running at `http://localhost:5000`
- ✅ Check `NEXT_PUBLIC_API_BASE_URL` in `.env.local`
- ✅ Verify backend CORS allows `http://localhost:3000`

### **"Stripe not working"**
- ✅ Get test key from [Stripe Dashboard](https://dashboard.stripe.com/test/apikeys)
- ✅ Use test key format: `pk_test_...`
- ✅ Check key is in `.env.local`

### **"Images not loading"**
- ✅ Check `next.config.ts` has correct image domains
- ✅ Verify image URLs are valid

---

## 📚 Project Structure Overview

```
src/
├── app/              # Pages (Next.js App Router)
├── components/       # React components
├── providers/        # Context providers
├── lib/              # Utilities
└── i18n/            # Translations (EN, BN, AR)
```

---

## 🎨 Tech Stack

- **Framework:** Next.js 15
- **Language:** TypeScript
- **Styling:** Tailwind CSS + Ant Design
- **State:** React Context
- **API:** Axios
- **Payments:** Stripe

---

## 🌍 Languages Supported

- English (Default)
- বাংলা (Bengali)
- العربية (Arabic with RTL)

Switch language using the flag dropdown in navbar!

---

## 📖 Full Documentation

For detailed documentation:
- [README.md](./README.md) - Complete guide
- [DEPLOYMENT.md](./DEPLOYMENT.md) - Deployment instructions

---

## 🆘 Need Help?

1. Check browser console for errors
2. Check backend is running
3. Verify environment variables
4. See [README.md](./README.md) for detailed docs

---

**That's it! Start coding! 🎉**
