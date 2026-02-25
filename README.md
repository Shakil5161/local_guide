# 🌍 Local Guide Platform - Frontend

> A modern, multilingual platform connecting travelers with local guides for authentic experiences.

**Live Site:** [https://local-guide-eight.vercel.app](https://local-guide-eight.vercel.app)

![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat&logo=next.js)
![TypeScript](https://img.shields.io/badge/TypeScript-5.9-blue?style=flat&logo=typescript)
![TailwindCSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8?style=flat&logo=tailwindcss)
![React](https://img.shields.io/badge/React-19-61dafb?style=flat&logo=react)

---

## 📋 Table of Contents

- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Getting Started](#-getting-started)
- [Project Structure](#-project-structure)
- [Environment Variables](#-environment-variables)
- [Key Features](#-key-features-in-detail)
- [User Roles](#-user-roles)
- [Pages & Routes](#-pages--routes)
- [Components](#-components)
- [Internationalization](#-internationalization-i18n)
- [State Management](#-state-management)
- [API Integration](#-api-integration)
- [Styling](#-styling)
- [Deployment](#-deployment)
- [Contributing](#-contributing)

---

## ✨ Features

### 🌐 **Core Functionality**
- **Multi-role System**: Tourist, Guide, and Admin dashboards
- **Tour Discovery**: Browse, search, and filter tours by category, city, price
- **Real-time Booking**: Book tours with Stripe payment integration
- **Review System**: Rate and review completed tours
- **Guide Profiles**: Detailed guide information with verification badges
- **Availability Management**: Guides can manage tour availability calendar
- **Dashboard Analytics**: Personalized dashboards for each user role

### 🎨 **User Experience**
- **Multilingual Support**: English, Bengali (বাংলা), Arabic (العربية) with RTL support
- **Responsive Design**: Mobile-first approach, works on all devices
- **Dark Mode Ready**: Modern UI with Tailwind CSS
- **Image Optimization**: Next.js Image component for fast loading
- **Loading States**: Skeleton loaders for better UX
- **Error Handling**: User-friendly error messages

### 🔐 **Security & Auth**
- **JWT Authentication**: Secure token-based authentication
- **Role-based Access Control**: Protected routes by user role
- **Persistent Sessions**: Auto-refresh tokens
- **Secure Payments**: Stripe integration for safe transactions

---

## 🛠️ Tech Stack

### **Framework & Core**
- **[Next.js 15](https://nextjs.org/)** - React framework with App Router
- **[React 19](https://react.dev/)** - UI library with React Compiler
- **[TypeScript 5.9](https://www.typescriptlang.org/)** - Type safety

### **Styling & UI**
- **[Tailwind CSS 3.4](https://tailwindcss.com/)** - Utility-first CSS
- **[Ant Design 5.24](https://ant.design/)** - Enterprise UI components
- **[Lucide React](https://lucide.dev/)** - Modern icon library
- **[clsx](https://github.com/lukeed/clsx)** - Conditional className utility

### **State & Data**
- **[React Context](https://react.dev/learn/passing-data-deeply-with-context)** - Global state (Auth, Language)
- **[Axios](https://axios-http.com/)** - HTTP client
- **[SWR](https://swr.vercel.app/)** - Data fetching (if used)

### **Payments & Forms**
- **[Stripe](https://stripe.com/)** - Payment processing
- **React Hook Form** (if used) - Form management

### **Development Tools**
- **[ESLint](https://eslint.org/)** - Code linting
- **[Prettier](https://prettier.io/)** (recommended) - Code formatting
- **[Vercel](https://vercel.com/)** - Deployment platform

---

## 🚀 Getting Started

### **Prerequisites**

- Node.js 18.x or higher
- npm or yarn
- Backend API running (see [backend README](../Local-guide-backend/README.md))

### **Installation**

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd Local-guide-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env.local` file in the root:
   ```env
   NEXT_PUBLIC_API_BASE_URL=http://localhost:5000/api/v1
   NEXT_PUBLIC_STRIPE_PUBLIC_KEY=your_stripe_publishable_key
   ```

4. **Run development server**
   ```bash
   npm run dev
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

### **Build for Production**

```bash
npm run build
npm run start
```

---

## 📁 Project Structure

```
Local-guide-frontend/
├── public/                      # Static assets
│   ├── localguide.png          # Logo
│   └── ...
│
├── src/
│   ├── app/                    # Next.js App Router
│   │   ├── (auth)/            # Auth pages (login, register)
│   │   │   ├── login/
│   │   │   └── register/
│   │   │
│   │   ├── dashboard/         # Dashboard pages
│   │   │   ├── admin/        # Admin dashboard
│   │   │   ├── guide/        # Guide dashboard
│   │   │   ├── tourist/      # Tourist dashboard
│   │   │   └── profile/      # Profile management
│   │   │
│   │   ├── explore/           # Tour listing page
│   │   ├── guides/            # Guide listing page
│   │   ├── tours/[id]/        # Tour detail page
│   │   ├── booking/[id]/      # Booking page
│   │   ├── about/             # About page
│   │   ├── contact/           # Contact page
│   │   │
│   │   ├── layout.tsx         # Root layout
│   │   ├── page.tsx           # Home page
│   │   └── globals.css        # Global styles
│   │
│   ├── components/            # React components
│   │   ├── shared/           # Shared components
│   │   │   ├── navbar.tsx
│   │   │   ├── footer.tsx
│   │   │   ├── language-switcher.tsx
│   │   │   └── ...
│   │   │
│   │   ├── home/             # Home page components
│   │   │   ├── hero-section.tsx
│   │   │   ├── featured-tours.tsx
│   │   │   ├── popular-cities.tsx
│   │   │   └── ...
│   │   │
│   │   ├── tour/             # Tour-related components
│   │   │   ├── tour-card.tsx
│   │   │   ├── tour-filters.tsx
│   │   │   └── ...
│   │   │
│   │   └── dashboard/        # Dashboard components
│   │       ├── booking-table.tsx
│   │       ├── stats-card.tsx
│   │       └── ...
│   │
│   ├── providers/             # React Context Providers
│   │   ├── auth-provider.tsx
│   │   └── language-provider.tsx
│   │
│   ├── lib/                   # Utilities & helpers
│   │   ├── api.ts            # Axios instance
│   │   ├── auth-storage.ts   # Token management
│   │   └── utils.ts          # Utility functions
│   │
│   ├── i18n/                  # Internationalization
│   │   ├── en.ts             # English translations
│   │   ├── bn.ts             # Bengali translations
│   │   └── ar.ts             # Arabic translations
│   │
│   └── types/                 # TypeScript types
│       └── index.ts
│
├── .env.local                 # Environment variables (gitignored)
├── .gitignore
├── next.config.ts             # Next.js configuration
├── package.json
├── tsconfig.json              # TypeScript configuration
├── tailwind.config.ts         # Tailwind configuration
├── postcss.config.mjs         # PostCSS configuration
└── README.md                  # This file
```

---

## 🔐 Environment Variables

Create a `.env.local` file in the root directory:

```env
# API Configuration
NEXT_PUBLIC_API_BASE_URL=https://your-backend.railway.app/api/v1

# Stripe Configuration
NEXT_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_...

# Optional: Analytics
NEXT_PUBLIC_GA_ID=G-XXXXXXXXXX
```

### **Variable Descriptions:**

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_BASE_URL` | Backend API base URL | ✅ Yes |
| `NEXT_PUBLIC_STRIPE_PUBLIC_KEY` | Stripe publishable key for payments | ✅ Yes |
| `NEXT_PUBLIC_GA_ID` | Google Analytics ID | ❌ Optional |

⚠️ **Important:** All client-side environment variables in Next.js must be prefixed with `NEXT_PUBLIC_`

---

## 👥 User Roles

### **1. Tourist (Default)**
- Browse and search tours
- Book tours with Stripe payment
- View booking history
- Write reviews for completed tours
- Manage profile
- View guide profiles

### **2. Guide**
- Create and manage tours
- Set tour availability
- View booking requests
- Manage tour pricing and details
- Upload tour images
- View earnings and statistics
- Respond to bookings (confirm/reject)

### **3. Admin**
- Manage all users (block/delete/promote)
- View all bookings and tours
- System analytics and statistics
- Content moderation
- Platform configuration

---

## 🗺️ Pages & Routes

### **Public Routes**
```
/                    - Home page with hero, featured tours, popular cities
/explore             - Browse all tours with filters
/tours/[id]          - Tour details with booking option
/guides              - Browse all guides
/guides/[id]         - Guide profile with their tours
/about               - About the platform
/contact             - Contact form
```

### **Authentication Routes**
```
/login               - Login page
/register            - Registration page (choose role)
```

### **Protected Routes - Tourist**
```
/dashboard/tourist            - Tourist dashboard (bookings overview)
/dashboard/tourist/reviews    - My reviews
/dashboard/profile            - Profile management
```

### **Protected Routes - Guide**
```
/dashboard/guide              - Guide dashboard (bookings, earnings)
/dashboard/guide/tours        - My tours (create, edit, delete)
/dashboard/guide/tours/create - Create new tour
/dashboard/guide/tours/[id]   - Edit tour
/dashboard/guide/availability - Manage tour availability calendar
/dashboard/profile            - Profile management
```

### **Protected Routes - Admin**
```
/dashboard/admin              - Admin dashboard (full statistics)
/dashboard/admin/users        - User management
/dashboard/admin/tours        - Tour management
/dashboard/admin/bookings     - All bookings
/dashboard/profile            - Profile management
```

### **Booking Flow**
```
/tours/[id]          - View tour details
  ↓
/booking/[tourId]    - Select date, number of people
  ↓
/checkout/[bookingId] - Stripe payment
  ↓
/booking/success     - Confirmation page
```


---

## 🧩 Components

### **Shared Components** (`src/components/shared/`)

#### **Navbar** (`navbar.tsx`)
- Responsive navigation with mobile menu
- Role-based menu items
- Language switcher
- Authentication state display
- Logo with home link

#### **Footer** (`footer.tsx`)
- Multi-column layout
- Social media links
- Quick navigation
- Newsletter signup (optional)

#### **Language Switcher** (`language-switcher.tsx`)
- Dropdown with flags
- Supports EN, BN, AR
- RTL support for Arabic
- Persists to localStorage

### **Home Page Components** (`src/components/home/`)

- `hero-section.tsx` - Hero banner with CTA buttons
- `featured-tours.tsx` - Handpicked tours carousel
- `popular-cities.tsx` - Top destinations grid
- `how-it-works.tsx` - 3-step process
- `why-choose-us.tsx` - Features/benefits
- `testimonials.tsx` - User reviews
- `become-guide-cta.tsx` - Call-to-action for guides

### **Tour Components** (`src/components/tour/`)

- `tour-card.tsx` - Tour preview card with image, price, rating
- `tour-filters.tsx` - Category, price, city filters
- `tour-detail.tsx` - Full tour information
- `tour-gallery.tsx` - Image gallery/carousel
- `booking-form.tsx` - Date picker, people selector

### **Dashboard Components** (`src/components/dashboard/`)

- `stats-card.tsx` - Statistics display card
- `booking-table.tsx` - Bookings data table
- `tour-form.tsx` - Create/edit tour form
- `calendar.tsx` - Availability calendar
- `earnings-chart.tsx` - Revenue visualization

---

## 🌍 Internationalization (i18n)

### **Supported Languages**

1. **English (en)** - Default
2. **Bengali (বাংলা) (bn)**
3. **Arabic (العربية) (ar)** - with RTL support

### **How It Works**

```typescript
// Using translations in components
import { useLanguage } from "@/providers/language-provider";

function MyComponent() {
  const { t, locale, setLocale } = useLanguage();
  
  return <h1>{t.home.heroTitle}</h1>;
}
```

### **Translation Files**

Located in `src/i18n/`:

```typescript
// src/i18n/en.ts
const en = {
  nav: {
    home: "Home",
    explore: "Explore Tours",
    // ...
  },
  home: {
    heroTitle: "Discover the World Through Local Eyes",
    // ...
  },
  // ...
};
```

### **Adding New Translations**

1. Add key to `src/i18n/en.ts`
2. Add same key to `src/i18n/bn.ts` and `src/i18n/ar.ts`
3. TypeScript will ensure type safety across all languages

### **RTL Support**

Arabic automatically enables RTL (Right-to-Left) layout:

```typescript
// Language provider automatically sets:
document.documentElement.dir = "rtl"; // for Arabic
document.documentElement.lang = "ar";
```

---

## 🔄 State Management

### **Auth Provider** (`src/providers/auth-provider.tsx`)

Manages user authentication state globally:

```typescript
import { useAuth } from "@/providers/auth-provider";

function MyComponent() {
  const { user, login, logout, loading } = useAuth();
  
  if (loading) return <div>Loading...</div>;
  if (!user) return <div>Please login</div>;
  
  return <div>Welcome, {user.role}</div>;
}
```

**Features:**
- Auto-login on mount (from localStorage)
- Token refresh logic
- Global loading state
- Logout with cleanup

### **Language Provider** (`src/providers/language-provider.tsx`)

Manages i18n state:

```typescript
import { useLanguage } from "@/providers/language-provider";

function MyComponent() {
  const { locale, t, setLocale } = useLanguage();
  
  return (
    <button onClick={() => setLocale("bn")}>
      {t.common.changeLanguage}
    </button>
  );
}
```

---

## 🌐 API Integration

### **Axios Instance** (`src/lib/api.ts`)

Pre-configured Axios instance with:
- Base URL from environment
- JWT token injection (from localStorage)
- 401 auto-logout interceptor

```typescript
import { api } from "@/lib/api";

// GET request
const { data } = await api.get("/tours");

// POST request
const { data } = await api.post("/bookings", { tourId, date });

// Authenticated request (token auto-added)
const { data } = await api.get("/dashboard/profile");
```

### **API Endpoints**

See backend documentation for full API reference: [API_DOCUMENTATION.md](../Local-guide-backend/API_DOCUMENTATION.md)

**Common endpoints:**
```
GET    /tours                  - List tours
GET    /tours/:id              - Tour details
POST   /bookings               - Create booking
GET    /bookings               - My bookings
POST   /reviews                - Create review
GET    /users/profile          - Get my profile
PATCH  /users/profile          - Update profile
POST   /payments/create-intent - Stripe payment
```

---

## 🎨 Styling

### **Tailwind CSS**

Utility-first approach with custom configuration:

```typescript
// tailwind.config.ts
{
  theme: {
    extend: {
      colors: {
        primary: {...},
        secondary: {...},
      },
    },
  },
}
```

### **Ant Design**

Enterprise components for complex UI:

```typescript
import { Table, Modal, DatePicker } from "antd";

// Use Ant Design components
<Table dataSource={bookings} columns={columns} />
```

### **Custom Utilities** (`src/lib/utils.ts`)

```typescript
import { cn } from "@/lib/utils";

// Conditional classNames
className={cn(
  "base-class",
  condition && "conditional-class",
  { "object-syntax": isActive }
)}
```

---

## 📦 Deployment

### **Vercel (Recommended)**

1. **Connect Repository**
   - Push code to GitHub
   - Import project in [Vercel Dashboard](https://vercel.com)

2. **Set Environment Variables**
   - Go to Project Settings → Environment Variables
   - Add `NEXT_PUBLIC_API_BASE_URL`
   - Add `NEXT_PUBLIC_STRIPE_PUBLIC_KEY`

3. **Deploy**
   - Vercel auto-deploys on push to main branch
   - Production URL: `https://your-app.vercel.app`

### **Manual Build**

```bash
npm run build
npm run start
```

---

## 🧪 Testing

```bash
# Run linter
npm run lint

# Type check
npm run type-check

# (Add when tests are implemented)
npm run test
```

---

## 📱 Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit changes (`git commit -m 'Add AmazingFeature'`)
4. Push to branch (`git push origin feature/AmazingFeature`)
5. Open Pull Request

---

## 📄 License

MIT License - see LICENSE file

---

## 👨‍💻 Author

**Shakil Ahmed**
- GitHub: [@shakilahmed](https://github.com/shakilahmed)
- Email: shakilahmed5161@gmail.com

---

## 🙏 Acknowledgments

- Next.js team for the amazing framework
- Vercel for deployment platform
- Ant Design for UI components
- Stripe for payment integration

---

## 📞 Support

For support, email shakilahmed5161@gmail.com or create an issue in the repository.

---

**Happy Coding! 🚀**
