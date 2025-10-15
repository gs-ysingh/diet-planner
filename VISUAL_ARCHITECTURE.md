# 🎨 Diet Planner Visual Architecture

## 📊 High-Level System Architecture

```mermaid
graph TB
    subgraph "Client Side"
        UI[React Frontend]
        RQ[TanStack Query]
        RHF[React Hook Form]
        ZOD[Zod Validation]
    end
    
    subgraph "Server Side"
        API[Express Server]
        GQL[GraphQL API]
        AUTH[JWT Auth]
        SVC[Business Services]
    end
    
    subgraph "Data Layer"
        DB[(PostgreSQL)]
        PRISMA[Prisma ORM]
    end
    
    subgraph "External Services"
        OPENAI[OpenAI GPT-4]
        PDF[PDF Generator]
    end
    
    UI --> RQ
    RQ --> API
    UI --> RHF
    RHF --> ZOD
    
    API --> GQL
    API --> AUTH
    API --> SVC
    
    SVC --> PRISMA
    PRISMA --> DB
    
    SVC --> OPENAI
    SVC --> PDF
```

## 🔄 Data Flow Architecture

```mermaid
sequenceDiagram
    participant U as User
    participant F as Frontend
    participant A as API Server
    participant AI as OpenAI
    participant D as Database
    
    U->>F: Fill Diet Plan Form
    F->>F: Validate with Zod
    F->>A: POST /generate-plan
    A->>A: Authenticate User
    A->>AI: Generate Meal Plan
    AI-->>A: Return AI Response
    A->>D: Save Diet Plan
    D-->>A: Confirm Save
    A-->>F: Return Plan Data
    F-->>U: Display Success
```

## 🏗️ Component Architecture

```mermaid
graph TD
    subgraph "React Application"
        APP[App Component]
        
        subgraph "Providers"
            QP[QueryProvider]
            TP[ThemeProvider] 
            AP[AuthProvider]
        end
        
        subgraph "Routing"
            ROUTER[React Router]
            PUB[Public Routes]
            PROT[Protected Routes]
        end
        
        subgraph "Pages"
            LAND[Landing]
            LOGIN[Login]
            DASH[Dashboard]
            CREATE[CreatePlan]
            PLANS[DietPlans]
            PROF[Profile]
        end
        
        subgraph "Components"
            HEADER[Header]
            FORMS[Forms]
            MODALS[Modals]
        end
    end
    
    APP --> QP
    APP --> TP
    APP --> AP
    APP --> ROUTER
    
    ROUTER --> PUB
    ROUTER --> PROT
    
    PUB --> LAND
    PUB --> LOGIN
    
    PROT --> DASH
    PROT --> CREATE
    PROT --> PLANS
    PROT --> PROF
    
    CREATE --> HEADER
    CREATE --> FORMS
    PROF --> MODALS
```

## 🗄️ Database Schema

```mermaid
erDiagram
    User {
        string id PK
        string email UK
        string name
        string password
        int age
        float weight
        float height
        enum gender
        string nationality
        enum goal
        enum activityLevel
        array preferences
        datetime createdAt
        datetime updatedAt
    }
    
    DietPlan {
        string id PK
        string userId FK
        string name
        string description
        datetime weekStart
        array preferences
        string customRequirements
        datetime createdAt
        datetime updatedAt
    }
    
    Meal {
        string id PK
        string dietPlanId FK
        enum day
        enum type
        string name
        array ingredients
        string instructions
        json nutritionInfo
        datetime createdAt
    }
    
    User ||--o{ DietPlan : creates
    DietPlan ||--o{ Meal : contains
```

## 🌐 API Architecture

```mermaid
graph LR
    subgraph "Client Requests"
        GET[GET Requests]
        POST[POST Requests]
        PUT[PUT Requests]
        DEL[DELETE Requests]
    end
    
    subgraph "API Layer"
        CORS[CORS Middleware]
        AUTH[Auth Middleware]
        RATE[Rate Limiting]
        GQL[GraphQL Endpoint]
        REST[REST Endpoints]
    end
    
    subgraph "Business Logic"
        RESOLV[GraphQL Resolvers]
        CTRL[Controllers]
        SERV[Services]
    end
    
    subgraph "Data Access"
        PRISMA[Prisma Client]
        DB[(Database)]
    end
    
    GET --> CORS
    POST --> CORS
    PUT --> CORS
    DEL --> CORS
    
    CORS --> AUTH
    AUTH --> RATE
    RATE --> GQL
    RATE --> REST
    
    GQL --> RESOLV
    REST --> CTRL
    
    RESOLV --> SERV
    CTRL --> SERV
    
    SERV --> PRISMA
    PRISMA --> DB
```

## 🔐 Security Architecture

```mermaid
graph TD
    subgraph "Client Security"
        INPUT[Input Validation]
        XSS[XSS Protection]
        CSP[Content Security Policy]
    end
    
    subgraph "Network Security"
        HTTPS[HTTPS/TLS]
        CORS_SEC[CORS Policy]
    end
    
    subgraph "API Security"
        JWT[JWT Authentication]
        RATE_LIM[Rate Limiting]
        HELMET[Security Headers]
    end
    
    subgraph "Data Security"
        HASH[Password Hashing]
        ENCRYPT[Data Encryption]
        PARAM[Parameterized Queries]
    end
    
    INPUT --> HTTPS
    XSS --> HTTPS
    CSP --> HTTPS
    
    HTTPS --> JWT
    CORS_SEC --> JWT
    
    JWT --> HASH
    RATE_LIM --> HASH
    HELMET --> HASH
    
    HASH --> ENCRYPT
    ENCRYPT --> PARAM
```

## 🚀 Deployment Architecture

```mermaid
graph TB
    subgraph "Development"
        DEV_FE[React Dev Server :3000]
        DEV_BE[Node.js Server :4000]
        DEV_DB[(PostgreSQL :5432)]
    end
    
    subgraph "Staging"
        STAGE_FE[Vercel Preview]
        STAGE_BE[Railway Staging]
        STAGE_DB[(Supabase Staging)]
    end
    
    subgraph "Production"
        PROD_FE[Vercel Production]
        PROD_BE[Railway Production]
        PROD_DB[(Supabase Production)]
        CDN[Vercel CDN]
    end
    
    subgraph "External Services"
        OPENAI_API[OpenAI API]
        EMAIL[Email Service]
        MONITORING[Monitoring]
    end
    
    DEV_FE --> DEV_BE
    DEV_BE --> DEV_DB
    
    STAGE_FE --> STAGE_BE
    STAGE_BE --> STAGE_DB
    
    PROD_FE --> CDN
    CDN --> PROD_BE
    PROD_BE --> PROD_DB
    
    PROD_BE --> OPENAI_API
    PROD_BE --> EMAIL
    PROD_BE --> MONITORING
```

## 📊 Performance Architecture

```mermaid
graph LR
    subgraph "Frontend Performance"
        CODE_SPLIT[Code Splitting]
        LAZY[Lazy Loading]
        MEMOIZATION[React Memoization]
    end
    
    subgraph "Caching Layers"
        BROWSER[Browser Cache]
        SERVICE_WORKER[Service Worker]
        REACT_QUERY[React Query Cache]
        REDIS[Redis Cache]
    end
    
    subgraph "Backend Performance"
        DB_INDEX[Database Indexing]
        QUERY_OPT[Query Optimization]
        CONNECTION_POOL[Connection Pooling]
    end
    
    CODE_SPLIT --> BROWSER
    LAZY --> SERVICE_WORKER
    MEMOIZATION --> REACT_QUERY
    
    BROWSER --> REDIS
    SERVICE_WORKER --> REDIS
    REACT_QUERY --> REDIS
    
    REDIS --> DB_INDEX
    DB_INDEX --> QUERY_OPT
    QUERY_OPT --> CONNECTION_POOL
```

## 🔄 State Management Flow

```mermaid
stateDiagram-v2
    [*] --> Loading
    Loading --> Success: Data Fetched
    Loading --> Error: Fetch Failed
    Success --> Updating: User Action
    Updating --> Success: Update Success
    Updating --> Error: Update Failed
    Error --> Loading: Retry
    Success --> [*]: Component Unmounted
    
    state Success {
        [*] --> Cached
        Cached --> Stale: Time Expires
        Stale --> Refetching: Background Refetch
        Refetching --> Fresh: New Data
        Fresh --> Cached: Data Stored
    }
```

This visual architecture provides a comprehensive overview of your modern diet planner application structure! 🎨✨