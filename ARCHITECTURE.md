# 🏗️ Diet Planner Application Architecture

## 📋 System Overview

The Diet Planner is a modern full-stack web application that uses AI to generate personalized meal plans. It follows a microservices-inspired architecture with clear separation of concerns.

```
┌─────────────────────────────────────────────────────────────────┐
│                        DIET PLANNER SYSTEM                     │
└─────────────────────────────────────────────────────────────────┘

┌──────────────┐    ┌──────────────┐    ┌──────────────┐
│   Frontend   │────│    Backend   │────│   Database   │
│  (React App) │    │  (Node.js)   │    │ (PostgreSQL) │
└──────────────┘    └──────────────┘    └──────────────┘
       │                     │                   │
       │            ┌──────────────┐             │
       └────────────│   External   │─────────────┘
                    │   Services   │
                    └──────────────┘
```

## 🎯 Application Architecture Layers

### 1. **Presentation Layer (Frontend)**
```
┌─────────────────────────────────────────────────────┐
│                  REACT FRONTEND                     │
├─────────────────────────────────────────────────────┤
│  Components Layer                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │   Pages     │ │ Components  │ │  Contexts   │   │
│  │             │ │             │ │             │   │
│  │ • Landing   │ │ • Header    │ │ • Auth      │   │
│  │ • Dashboard │ │ • Login     │ │ • Theme     │   │
│  │ • CreatePlan│ │ • Register  │ │             │   │
│  │ • DietPlans │ │ • Forms     │ │             │   │
│  │ • Profile   │ │             │ │             │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
├─────────────────────────────────────────────────────┤
│  Services Layer                                     │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ API Service │ │TanStack Qry │ │Form Validtn │   │
│  │             │ │             │ │             │   │
│  │ • HTTP Req  │ │ • Caching   │ │ • Zod       │   │
│  │ • Auth      │ │ • Mutations │ │ • RHF       │   │
│  │ • Error Hnd │ │ • Queries   │ │ • Real-time │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
├─────────────────────────────────────────────────────┤
│  State Management                                   │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │ React Query │ │Local Storage│ │   Context   │   │
│  │             │ │             │ │             │   │
│  │ • Server    │ │ • Auth Token│ │ • User Auth │   │
│  │   State     │ │ • User Prefs│ │ • Theme     │   │
│  │ • Cache     │ │             │ │             │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 2. **Application Layer (Backend)**
```
┌─────────────────────────────────────────────────────┐
│                  NODE.JS BACKEND                    │
├─────────────────────────────────────────────────────┤
│  API Layer                                          │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │  GraphQL    │ │   REST API  │ │Middleware   │   │
│  │             │ │             │ │             │   │
│  │ • Resolvers │ │ • Routes    │ │ • Auth      │   │
│  │ • Schema    │ │ • Controllers│ │ • CORS     │   │
│  │ • Types     │ │ • Validation│ │ • Rate Lmt  │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
├─────────────────────────────────────────────────────┤
│  Business Logic Layer                               │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │  Services   │ │   Utils     │ │  AI Engine  │   │
│  │             │ │             │ │             │   │
│  │ • Diet Plan │ │ • Validators│ │ • OpenAI    │   │
│  │ • User Mgmt │ │ • Helpers   │ │ • Prompts   │   │
│  │ • PDF Gen   │ │ • Constants │ │ • Processing│   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
├─────────────────────────────────────────────────────┤
│  Data Access Layer                                  │
│  ┌─────────────┐ ┌─────────────┐ ┌─────────────┐   │
│  │   Prisma    │ │  Database   │ │   Models    │   │
│  │             │ │             │ │             │   │
│  │ • ORM       │ │ • Queries   │ │ • User      │   │
│  │ • Migrations│ │ • Transactions│ │ • DietPlan │   │
│  │ • Schema    │ │ • Connection│ │ • Meal      │   │
│  └─────────────┘ └─────────────┘ └─────────────┘   │
└─────────────────────────────────────────────────────┘
```

### 3. **Data Layer**
```
┌─────────────────────────────────────────────────────┐
│                  POSTGRESQL DATABASE                │
├─────────────────────────────────────────────────────┤
│  Tables & Relationships                             │
│                                                     │
│  ┌─────────────┐     ┌─────────────┐               │
│  │    User     │────▶│  DietPlan   │               │
│  │             │     │             │               │
│  │ • id        │     │ • id        │               │
│  │ • email     │     │ • userId    │               │
│  │ • password  │     │ • name      │               │
│  │ • profile   │     │ • weekStart │               │
│  └─────────────┘     └─────────────┘               │
│                             │                       │
│                             ▼                       │
│                      ┌─────────────┐               │
│                      │    Meal     │               │
│                      │             │               │
│                      │ • id        │               │
│                      │ • planId    │               │
│                      │ • day       │               │
│                      │ • type      │               │
│                      │ • recipe    │               │
│                      └─────────────┘               │
└─────────────────────────────────────────────────────┘
```

## 🔄 Data Flow Architecture

### Request-Response Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Browser   │    │   Server    │    │  Database   │
│             │    │             │    │             │
│ 1. User     │────▶ 2. Validate  │────▶ 3. Query    │
│    Action   │    │    Request   │    │    Data     │
│             │    │             │    │             │
│ 6. Update   │◀────│ 5. Process  │◀────│ 4. Return   │
│    UI       │    │    Response │    │    Results  │
└─────────────┘    └─────────────┘    └─────────────┘
```

### AI Diet Plan Generation Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Frontend  │    │   Backend   │    │   OpenAI    │    │  Database   │
│             │    │             │    │             │    │             │
│ 1. Submit   │────▶ 2. Process   │────▶ 3. Generate │    │             │
│    Form     │    │    Input     │    │    Plan     │    │             │
│             │    │             │    │             │    │             │
│ 8. Display  │◀────│ 7. Return   │◀────│ 4. AI       │────▶ 5. Store   │
│    Plan     │    │    Plan     │    │    Response │    │    Plan     │
│             │    │             │    │             │◀────│ 6. Save     │
│             │    │             │    │             │    │    Success  │
└─────────────┘    └─────────────┘    └─────────────┘    └─────────────┘
```

## 📁 Project Structure

```
diet-planner/
├── 📱 client/                          # Frontend Application
│   ├── 📁 public/                      # Static assets
│   │   └── index.html
│   ├── 📁 src/
│   │   ├── 📁 components/              # Reusable UI components
│   │   │   ├── Header.tsx
│   │   │   ├── Login.tsx
│   │   │   └── Register.tsx
│   │   ├── 📁 pages/                   # Route components
│   │   │   ├── Landing.tsx
│   │   │   ├── Dashboard.tsx
│   │   │   ├── CreatePlan.tsx
│   │   │   ├── DietPlans.tsx
│   │   │   └── Profile.tsx
│   │   ├── 📁 contexts/                # React contexts
│   │   │   └── AuthContext.tsx
│   │   ├── 📁 services/                # API services
│   │   │   └── api.ts                  # Main API service
│   │   ├── 📁 providers/               # Context providers
│   │   │   └── QueryProvider.tsx
│   │   ├── 📁 types/                   # TypeScript types
│   │   │   └── index.ts
│   │   ├── 📁 hooks/                   # Custom React hooks
│   │   ├── 📁 utils/                   # Utility functions
│   │   ├── App.tsx
│   │   └── index.tsx
│   ├── package.json                    # Dependencies
│   └── tsconfig.json                   # TypeScript config
│
├── 🖥️ server/                          # Backend Application
│   ├── 📁 src/
│   │   ├── 📁 graphql/                 # GraphQL layer
│   │   │   ├── resolvers.ts
│   │   │   └── schema.ts
│   │   ├── 📁 middleware/              # Express middleware
│   │   │   └── auth.ts
│   │   ├── 📁 services/                # Business logic
│   │   │   ├── ai.service.ts
│   │   │   └── pdf.service.ts
│   │   ├── 📁 data/                    # Seed data
│   │   │   └── defaultDietPlan.ts
│   │   └── index.ts                    # Server entry point
│   ├── 📁 prisma/                      # Database layer
│   │   ├── schema.prisma               # Database schema
│   │   ├── seed.ts                     # Seed data
│   │   └── migrations/                 # DB migrations
│   ├── package.json
│   └── tsconfig.json
│
├── 📚 docs/                            # Documentation
│   ├── MODERN_STACK_2024.md
│   ├── MODERN_SERVER_GUIDE.md
│   ├── IMPLEMENTATION_SUMMARY.md
│   └── ARCHITECTURE.md                 # This file
│
├── 🔧 config/                          # Configuration files
│   ├── .env.example
│   ├── docker-compose.yml
│   └── nginx.conf
│
└── 📋 README.md                        # Project overview
```

## 🔌 Component Architecture

### Frontend Component Hierarchy
```
App
├── QueryProvider                       # React Query setup
├── ThemeProvider                      # Material-UI theme
├── AuthProvider                       # Authentication context
└── Router
    ├── PublicRoutes
    │   ├── Landing                    # Home page
    │   ├── Login                      # User authentication
    │   └── Register                   # User registration
    └── ProtectedRoutes
        ├── Dashboard                  # User overview
        ├── CreatePlan                 # Diet plan creation
        ├── DietPlans                  # Plan management
        └── Profile                    # User settings

Components (Shared)
├── Header                            # Navigation bar
├── Footer                            # Site footer
├── Layout                            # Page wrapper
├── Forms
│   ├── LoginForm                     # Login component
│   ├── RegisterForm                  # Registration
│   └── DietPlanForm                  # Plan creation
└── UI
    ├── Button                        # Custom button
    ├── Input                         # Form inputs
    ├── Modal                         # Pop-up dialogs
    └── LoadingSpinner               # Loading states
```

### Backend Service Architecture
```
Express Application
├── Middleware Stack
│   ├── CORS                          # Cross-origin requests
│   ├── Authentication                # JWT validation
│   ├── Rate Limiting                 # API protection
│   └── Error Handling               # Global error handler
├── GraphQL Layer
│   ├── Schema Definition             # API structure
│   ├── Resolvers                     # Business logic
│   └── Type Definitions             # Data types
├── Services
│   ├── AuthService                   # User authentication
│   ├── DietPlanService              # Plan generation
│   ├── ModernAIService              # LangChain AI integration
│   └── PDFService                   # Document generation
└── Data Layer
    ├── Prisma Client                # Database ORM
    ├── Models                       # Data models
    └── Migrations                   # Schema changes
```

## 🌐 API Architecture

### GraphQL Schema
```graphql
type User {
  id: ID!
  email: String!
  name: String!
  age: Int
  weight: Float
  height: Float
  goal: Goal
  dietPlans: [DietPlan!]!
  createdAt: DateTime!
}

type DietPlan {
  id: ID!
  name: String!
  description: String
  weekStart: DateTime!
  user: User!
  meals: [Meal!]!
  preferences: [String!]!
  createdAt: DateTime!
}

type Meal {
  id: ID!
  day: Day!
  type: MealType!
  name: String!
  ingredients: [String!]!
  instructions: String!
  nutrition: NutritionInfo
  dietPlan: DietPlan!
}

enum Goal {
  WEIGHT_LOSS
  WEIGHT_GAIN
  MAINTENANCE
  MUSCLE_BUILDING
}

enum Day {
  MONDAY
  TUESDAY
  WEDNESDAY
  THURSDAY
  FRIDAY
  SATURDAY
  SUNDAY
}

enum MealType {
  BREAKFAST
  LUNCH
  DINNER
  SNACK
}
```

### REST API Endpoints (Alternative)
```
Authentication
POST   /auth/login              # User login
POST   /auth/register           # User registration
POST   /auth/refresh            # Token refresh
POST   /auth/logout             # User logout

Users
GET    /users/me                # Current user profile
PUT    /users/me                # Update profile
DELETE /users/me                # Delete account

Diet Plans
GET    /diet-plans              # List user's plans
POST   /diet-plans              # Create new plan
GET    /diet-plans/:id          # Get specific plan
PUT    /diet-plans/:id          # Update plan
DELETE /diet-plans/:id          # Delete plan
GET    /diet-plans/:id/pdf      # Download as PDF

AI Generation
POST   /ai/generate-plan        # Generate diet plan
POST   /ai/suggest-meals        # Meal suggestions
```

## 🔐 Security Architecture

### Authentication Flow
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Client    │    │   Server    │    │  Database   │
│             │    │             │    │             │
│ 1. Login    │────▶ 2. Validate │────▶ 3. Check    │
│    Request  │    │    Creds    │    │    User     │
│             │    │             │    │             │
│ 6. Store    │◀────│ 5. Return   │◀────│ 4. User     │
│    Token    │    │    JWT      │    │    Found    │
│             │    │             │    │             │
│ 7. Include  │────▶ 8. Verify   │    │             │
│    in Req   │    │    JWT      │    │             │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Security Layers
1. **Frontend**: Input validation, XSS protection
2. **Network**: HTTPS, CORS configuration
3. **Backend**: JWT authentication, rate limiting
4. **Database**: Parameterized queries, encryption
5. **Infrastructure**: Environment variables, secrets management

## 📊 Performance Architecture

### Caching Strategy
```
Browser Cache
├── Static Assets (CSS, JS, Images)
├── Service Worker (Offline support)
└── LocalStorage (User preferences)

Application Cache (React Query)
├── API Responses (5min TTL)
├── User Profile (30min TTL)
└── Diet Plans (10min TTL)

Server Cache
├── Database Queries (Redis)
├── AI Responses (1 hour TTL)
└── Generated PDFs (24 hour TTL)
```

### Optimization Strategies
1. **Code Splitting**: Lazy loading of routes
2. **Bundle Optimization**: Tree shaking, minification
3. **Image Optimization**: WebP format, lazy loading
4. **Database**: Query optimization, indexing
5. **CDN**: Static asset delivery
6. **Compression**: Gzip, Brotli

## 🚀 Deployment Architecture

### Development Environment
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│  Frontend   │    │   Backend   │    │  Database   │
│             │    │             │    │             │
│ localhost   │────│ localhost   │────│ localhost   │
│ :3000       │    │ :4000       │    │ :5432       │
│             │    │             │    │             │
│ React Dev   │    │ Node.js     │    │ PostgreSQL  │
│ Server      │    │ Express     │    │ Docker      │
└─────────────┘    └─────────────┘    └─────────────┘
```

### Production Environment
```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│   Vercel    │    │   Railway   │    │ Supabase    │
│             │    │             │    │             │
│ Static Site │────│ Node.js API │────│ PostgreSQL  │
│ React App   │    │ Auto Deploy │    │ Managed DB  │
│             │    │             │    │             │
│ CDN         │    │ Docker      │    │ Backups     │
│ SSL/TLS     │    │ SSL/TLS     │    │ Monitoring  │
└─────────────┘    └─────────────┘    └─────────────┘
```

## 🔄 Modern Architecture Benefits

### Current Implementation
- **Frontend**: React + TypeScript + Material-UI
- **State**: TanStack Query + React Hook Form + Zod
- **Backend**: Node.js + Express + GraphQL + Prisma
- **Database**: PostgreSQL with proper relationships
- **AI**: OpenAI GPT-4 integration
- **Auth**: JWT-based authentication

### Modern Enhancements (Recommended)
- **Build**: Vite (3x faster than CRA)
- **Backend**: Fastify + tRPC (type-safe APIs)
- **Auth**: Lucia (modern session management)
- **Testing**: Vitest + Testing Library
- **Linting**: Biome (faster than ESLint)
- **Deployment**: Edge functions + CDN

This architecture provides a solid foundation for a scalable, maintainable, and modern web application! 🏗️✨