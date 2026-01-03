# Medilink

A modern healthcare platform that bridges doctors and patients with secure digital prescriptions, seamless document management, and instant access to medical records. Medilink revolutionizes healthcare communication by providing a centralized platform for prescription management, patient records, and medical document storage.

## 🏥 Overview

Medilink is a full-stack healthcare management system designed to streamline the interaction between healthcare providers and patients. The platform enables doctors to create and manage digital prescriptions, while patients can access their medical records, prescriptions, and documents in real-time through a user-friendly interface.

### Key Features

- **Digital Prescriptions**: Doctors can create, manage, and share digital prescriptions securely
- **Patient Management**: Comprehensive patient profiles with medical history, allergies, and documents
- **Document Storage**: Secure, encrypted storage for medical documents and files
- **Real-time Access**: Patients can access their prescriptions and medical records instantly
- **Mobile-Friendly**: Progressive Web App (PWA) support for mobile devices
- **Authentication & Security**: JWT-based authentication with role-based access control
- **OTP Verification**: Secure OTP-based verification for user authentication

## 🏗️ Project Structure

This is a **monorepo** built with Turborepo, organized into applications and shared packages:

```
Medilink/
├── apps/
│   ├── frontend/          # Next.js frontend application
│   │   ├── app/            # Next.js App Router pages
│   │   │   ├── auth/       # Authentication pages (sign-in, sign-up)
│   │   │   ├── dashboard/  # Dashboard pages (doctor, patient)
│   │   │   └── page.tsx    # Landing page
│   │   ├── components/     # React components
│   │   │   ├── patient/    # Patient-specific components
│   │   │   └── ui/         # Reusable UI components
│   │   ├── context/        # React context providers
│   │   ├── hooks/          # Custom React hooks
│   │   ├── lib/            # Utility functions and validation
│   │   ├── services/       # API service layer
│   │   └── public/         # Static assets and PWA files
│   │
│   └── backend/            # Express.js backend API
│       └── src/
│           ├── controller/ # Route controllers
│           ├── middleware/ # Express middleware (auth, validation)
│           ├── routes/     # API route definitions
│           └── utils/      # Utility functions (JWT, OTP)
│
└── packages/               # Shared packages
    ├── db/                 # Prisma database package
    │   ├── prisma/         # Prisma schema and migrations
    │   └── src/            # Database client and seed scripts
    ├── cache/              # Caching utilities
    ├── common/             # Shared utilities and configuration
    ├── queue/              # Queue management
    ├── ui/                 # Shared UI components
    ├── eslint-config/      # Shared ESLint configurations
    └── typescript-config/  # Shared TypeScript configurations
```

## 🛠️ Technologies

### Frontend
- **Next.js 15** - React framework with App Router
- **React 19** - UI library
- **TypeScript** - Type-safe JavaScript
- **Tailwind CSS 4** - Utility-first CSS framework
- **Radix UI** - Accessible component primitives
- **Lucide React** - Icon library
- **Next PWA** - Progressive Web App support
- **Axios** - HTTP client
- **Next Themes** - Theme management (dark/light mode)
- **GSAP** - Animation library

### Backend
- **Bun** - JavaScript runtime and package manager
- **Express.js 5** - Web framework
- **TypeScript** - Type-safe JavaScript
- **Prisma** - Next-generation ORM
- **PostgreSQL** - Relational database
- **JWT (jsonwebtoken)** - Authentication tokens
- **bcrypt** - Password hashing
- **CORS** - Cross-origin resource sharing
- **Twilio** - SMS/OTP services

### Development Tools
- **Turborepo** - Monorepo build system
- **ESLint** - Code linting
- **Prettier** - Code formatting
- **TypeScript** - Type checking

### Shared Packages
- **@repo/db** - Prisma database client and models
- **@repo/common** - Shared utilities and configuration
- **@repo/cache** - Caching layer
- **@repo/queue** - Queue management
- **@repo/ui** - Shared UI components
- **@repo/eslint-config** - Shared ESLint rules
- **@repo/typescript-config** - Shared TypeScript configs

## 📦 Database Schema

The application uses Prisma with PostgreSQL. Key models include:

- **Doctor** - Healthcare provider profiles with credentials, specialization, verification status, subscription management, and profile information (consultation fees, qualifications, experience, bio, profile picture)
- **Patient** - Patient profiles with medical history, allergies, demographics (age, gender, blood group, weight), and linked documents
- **Prescriptions** - Digital prescriptions with prescription text, medicine lists, and checkup schedules linked to both doctor and patient
- **Medicine** - Medicine details with dosage (JSON), timing (DateTime), and food timing instructions (before/after food)
- **Document** - Medical document storage with file URLs, type, name, and metadata linked to patients
- **Checkup** - Follow-up checkup schedules with checkup date, notes, and active status
- **Subscription** - Subscription management for doctors with plans (monthly/yearly), status tracking, Razorpay integration, and auto-renewal settings
- **PaymentTransaction** - Payment transaction records with Razorpay payment/order IDs, amount, currency, status, and payment method tracking

### Enums

- **SubscriptionStatus** - ACTIVE, INACTIVE, EXPIRED, CANCELLED, GRACE_PERIOD
- **SubscriptionPlan** - MONTHLY, YEARLY
- **PaymentStatus** - PENDING, SUCCESS, FAILED, REFUNDED
- **FoodTiming** - BEFORE, AFTER

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **Bun** >= 1.2.2 (package manager)
- **PostgreSQL** database

### Development

Run all applications in development mode:
```bash
bun run dev
```

This will start:
- Frontend: `http://localhost:3001`
- Backend: `http://localhost:3000`


## For collaborators
**Follow the steps to setup the project**

1. Clone repo 
   ```bash
   git clone https://github.com/GlaDrancE/Medilink.git
   ```

2. Install dependencies:
   ```bash
   bun install
   ```

3. Set up environment variables:
   - Copy `.env.example` to `.env` in all respective folders:
     - Root directory: `.env.example` → `.env`
     - `apps/frontend/.env.example` → `apps/frontend/.env`
     - `packages/db/.env example` → `packages/db/.env`

4. Generate Prisma client:
   ```bash
   bun db:generate
   ```

5. Run PostgreSQL database instance (Docker recommended):
   ```bash
   docker run --network medilink -v medilink -p 5433:5433 -e POSTGRES_PASSWORD=postgres --name medilink -d postgres-alpine
   ```

6. Configure PostgreSQL connection:
   - Set up PostgreSQL URL in `./packages/db/.env` and root `.env` file

7. Run database migrations:
   ```bash
   bun db:migrate
   ```

8. Create ngrok URL pointing to backend port:
   - Set up ngrok tunnel for your backend port (typically port 3000)

9. Configure webhooks:
   - Add ngrok public URL for Clerk webhook
   - Add ngrok public URL for Razorpay webhook

10. Start development server:
    ```bash
    bun run dev
    ```

11. Visit the application:
    - Open `http://localhost:3001` in your browser


### Available Scripts

- `bun run dev` - Start all apps in development mode
- `bun run build` - Build all apps and packages
- `bun run lint` - Lint all code
- `bun run format` - Format code with Prettier
- `bun run check-types` - Type check all TypeScript code
- `bun run db:generate` - Generate Prisma client
- `bun run db:migrate` - Run database migrations
- `bun run db:studio` - Open Prisma Studio

## 📱 Application Features

### For Doctors
- Create and manage digital prescriptions
- Patient management and profiles
- Document upload and sharing
- Prescription history tracking
- Secure authentication and authorization

### For Patients
- Access prescriptions in real-time
- View medical history and records
- Document storage and retrieval
- Prescription reminders and schedules
- Mobile-friendly PWA experience

## 🔒 Security

- JWT-based authentication
- Password hashing with bcrypt
- Role-based access control (RBAC)
- OTP verification for secure login
- CORS protection
- Secure document storage

## 📄 License

This project is private and proprietary.

## 🤝 Contributing

This is a private project. For contributions, please contact the project maintainers.

---

Built with ❤️ for modern healthcare management

