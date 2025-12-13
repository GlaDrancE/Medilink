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

- **Doctor** - Healthcare provider profiles with credentials, specialization, and verification status
- **Patient** - Patient profiles with medical history, allergies, and linked documents
- **Prescriptions** - Digital prescriptions with medicine lists and checkup schedules
- **Medicine** - Medicine details with dosage, timing, and food instructions
- **Document** - Medical document storage with file URLs and metadata
- **Checkup** - Follow-up checkup schedules and notes

## 🚀 Getting Started

### Prerequisites

- **Node.js** >= 18
- **Bun** >= 1.2.2 (package manager)
- **PostgreSQL** database

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd Medilink
```

2. Install dependencies:
```bash
bun install
```

3. Set up environment variables:
   - Create `.env` files in `apps/backend` and `apps/frontend` as needed
   - Configure database connection, JWT secrets, and other service credentials

4. Generate Prisma client:
```bash
bun run db:generate
```

5. Run database migrations:
```bash
bun run db:migrate
```

### Development

Run all applications in development mode:
```bash
bun run dev
```

This will start:
- Frontend: `http://localhost:3001`
- Backend: `http://localhost:3000`

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

