# SalonBook Client

Salon Appointment Booking Platform - Frontend Application

## Project Overview

SalonBook is a salon appointment booking platform where customers can explore salon services, view service information, and request appointments online. The salon administrator can create and manage salon services, review appointment requests, confirm or cancel appointments, and monitor customer payments.

## Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Forms**: React Hook Form with Zod validation
- **HTTP Client**: Axios
- **Icons**: Lucide React
- **Notifications**: React Hot Toast
- **Date Handling**: date-fns
- **Payments**: Stripe.js / React Stripe.js

## Features

### Public Pages
- **Home** - Hero banner, featured services, categories, CTA sections
- **Browse Services** - Search, filter by category, sort by price, pagination
- **Service Details** - Full service info, appointment booking modal
- **Sign In / Sign Up** - Email/password auth, Google OAuth ready

### Customer Dashboard (Protected)
- **Overview** - Appointment stats, quick actions, recent appointments
- **My Appointments** - View all appointments, filter by status, cancel pending, pay for confirmed
- **Profile** - Update name, profile image, phone number

### Admin Dashboard (Protected)
- **Overview** - Platform stats, quick actions, recent activity
- **Manage Services** - CRUD services, image upload, status toggle, search/filter
- **Manage Appointments** - View all, update status (pending/confirmed/cancelled)
- **Manage Users** - View customers, block/unblock, change roles
- **Transactions** - View all payments with stats
- **Profile** - Admin profile management

## Installation

```bash
# Install dependencies
npm install

# Copy environment variables
cp .env.example .env.local

# Update .env.local with your configuration
```

## Environment Variables

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL (default: http://localhost:5000) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key for payments |

## Running the Project

### Development
```bash
npm run dev
```
Runs on http://localhost:3000

### Production
```bash
npm run build
npm start
```

## Project Structure

```
src/
├── app/                    # Next.js App Router pages
│   ├── (auth)/            # Auth group (signin, signup)
│   ├── (dashboard)/       # Dashboard group (customer, admin)
│   ├── browse/            # Browse services page
│   ├── services/[id]/     # Service details dynamic route
│   ├── payment/           # Payment success/cancel pages
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Home page
│   ├── globals.css        # Global styles
│   └── providers.tsx      # Context providers
├── components/
│   ├── ui/                # Reusable UI components
│   ├── layout/            # Layout components (Navbar, Footer)
│   ├── forms/             # Form components
│   ├── services/          # Service-related components
│   ├── appointments/      # Appointment components
│   └── dashboard/         # Dashboard components
├── lib/
│   ├── api.ts             # API client with axios
│   └── utils.ts           # Utility functions
├── hooks/                 # Custom React hooks
├── context/
│   └── AuthContext.tsx    # Authentication context
└── types/
    └── index.ts           # TypeScript types
```

## Key Components

### UI Components
- `Button` - Multiple variants (primary, secondary, outline, danger, ghost)
- `Input` / `Textarea` / `Select` - Form inputs with validation
- `Card` - Card layout with header, content, footer
- `Badge` - Status badges with variants
- `Modal` - Accessible modal dialog

### Layout Components
- `Navbar` - Responsive navigation with auth state
- `Footer` - Complete footer with links, contact info, social

### Forms
- Login/Register forms with validation
- Service create/edit form
- Appointment booking form
- Profile update form

## Authentication Flow

1. User registers/logs in via `/auth/signup` or `/auth/signin`
2. JWT token stored in localStorage
3. Token sent with all API requests via Authorization header
4. Role-based redirects after login (customer → customer dashboard, admin → admin dashboard)
5. Protected routes check auth state and role
6. Token auto-refresh on app load

## API Integration

The `api` client in `lib/api.ts` handles:
- Automatic token attachment
- 401 handling with redirect to signin
- All REST endpoints for services, appointments, transactions, users
- File uploads for service images
- Stripe payment initiation

## Styling

- Tailwind CSS for utility-first styling
- Custom color palette (salon pink theme)
- Responsive design (mobile-first)
- Consistent spacing, typography, shadows
- Dark mode ready (class-based)

## Deployment

1. Build the application: `npm run build`
2. Set production environment variables
3. Deploy to Vercel, Netlify, or any Node.js hosting
4. Ensure `NEXT_PUBLIC_API_URL` points to production backend
5. Configure Stripe webhook endpoints for production

## Security Considerations

- All sensitive data in environment variables
- Client-side validation with server-side verification
- Role checks on protected routes
- XSS prevention via React's built-in escaping
- Secure HTTP headers via Next.js
- No secrets in client bundle

## License

ISC