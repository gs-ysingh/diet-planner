# ⚙️ Diet Planner Technical Specifications

## 📋 System Requirements & Specifications

### Runtime Environment
- **Node.js**: v18+ (LTS recommended)
- **NPM**: v8+ or Yarn v1.22+
- **Database**: PostgreSQL v14+
- **Browser**: Chrome 90+, Firefox 88+, Safari 14+

### Development Tools
- **TypeScript**: v5.3+
- **React**: v18.2+
- **Build Tool**: Create React App / Vite (recommended)
- **Package Manager**: NPM / Yarn

## 📦 Technology Stack Specifications

### Frontend Stack (Modern 2024-2025)

```json
{
  "framework": "React 18.2+",
  "language": "TypeScript 5.3+",
  "ui_library": "Material-UI v5.15+",
  "form_management": {
    "library": "React Hook Form v7.45+",
    "validation": "Zod v3.22+"
  },
  "state_management": {
    "server_state": "TanStack Query v5.8+",
    "client_state": "React Context / Zustand"
  },
  "routing": "React Router v6.20+",
  "animations": "Framer Motion v10.16+",
  "notifications": "Sonner v1.2+",
  "http_client": "Axios v1.6+ / Fetch API",
  "build_tool": "Vite v5.0+ (recommended) / CRA",
  "testing": "Vitest v1.0+ / Jest + RTL",
  "linting": "Biome v1.4+ / ESLint + Prettier"
}
```

### Backend Stack

```json
{
  "runtime": "Node.js v20 LTS",
  "framework": "Express v4.18+ / Fastify v4.24+ (recommended)",
  "api_layer": {
    "current": "GraphQL (Apollo Server v4.9+)",
    "recommended": "tRPC v10.45+ (type-safe)"
  },
  "database": {
    "engine": "PostgreSQL v14+",
    "orm": "Prisma v5.7+",
    "migrations": "Prisma Migrate"
  },
  "authentication": {
    "current": "JWT",
    "recommended": "Lucia Auth v3.0+"
  },
  "ai_integration": "OpenAI API v4.20+",
  "pdf_generation": "@react-pdf/renderer v3.1+",
  "validation": "Zod v3.22+",
  "security": {
    "password_hashing": "bcryptjs v2.4+",
    "rate_limiting": "express-rate-limit / @fastify/rate-limit",
    "cors": "@fastify/cors / cors",
    "helmet": "@fastify/helmet / helmet"
  }
}
```

## 🏗️ Architecture Patterns

### Frontend Architecture Patterns

#### 1. **Component Architecture**
```typescript
// Component Structure Pattern
interface ComponentProps {
  // Props interface
}

const Component: React.FC<ComponentProps> = ({ ...props }) => {
  // Hooks (top-level)
  const { data, isLoading } = useQuery();
  const mutation = useMutation();
  
  // Event handlers
  const handleSubmit = useCallback(() => {
    // Handler logic
  }, []);
  
  // Render logic
  return (
    <Container>
      {/* Component JSX */}
    </Container>
  );
};

export default Component;
```

#### 2. **Custom Hooks Pattern**
```typescript
// Custom Hook for API Integration
export const useDietPlans = () => {
  return useQuery({
    queryKey: ['diet-plans'],
    queryFn: () => api.getDietPlans(),
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};

// Custom Hook for Form Logic
export const useDietPlanForm = () => {
  const mutation = useGenerateDietPlan();
  
  const form = useForm({
    resolver: zodResolver(dietPlanSchema),
    defaultValues: initialValues,
  });
  
  const onSubmit = async (data) => {
    await mutation.mutateAsync(data);
  };
  
  return { form, onSubmit, isLoading: mutation.isPending };
};
```

#### 3. **Error Boundary Pattern**
```typescript
class ErrorBoundary extends Component {
  state = { hasError: false, error: null };
  
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  
  componentDidCatch(error, errorInfo) {
    console.error('Error caught by boundary:', error, errorInfo);
  }
  
  render() {
    if (this.state.hasError) {
      return <ErrorFallback error={this.state.error} />;
    }
    return this.props.children;
  }
}
```

### Backend Architecture Patterns

#### 1. **Service Layer Pattern**
```typescript
// Service class for business logic
export class DietPlanService {
  constructor(
    private db: PrismaClient,
    private aiService: OpenAIService
  ) {}
  
  async generateDietPlan(input: DietPlanInput, userId: string): Promise<DietPlan> {
    // Validate input
    const validatedInput = dietPlanSchema.parse(input);
    
    // Generate with AI
    const aiResponse = await this.aiService.generatePlan(validatedInput);
    
    // Save to database
    const dietPlan = await this.db.dietPlan.create({
      data: {
        ...aiResponse,
        userId,
      },
    });
    
    return dietPlan;
  }
}
```

#### 2. **Repository Pattern** (Optional)
```typescript
// Repository for data access
export class DietPlanRepository {
  constructor(private db: PrismaClient) {}
  
  async create(data: DietPlanCreateInput): Promise<DietPlan> {
    return this.db.dietPlan.create({ data });
  }
  
  async findByUserId(userId: string): Promise<DietPlan[]> {
    return this.db.dietPlan.findMany({
      where: { userId },
      include: { meals: true },
    });
  }
  
  async findById(id: string, userId: string): Promise<DietPlan | null> {
    return this.db.dietPlan.findUnique({
      where: { id, userId },
      include: { meals: true },
    });
  }
}
```

#### 3. **Middleware Pattern**
```typescript
// Authentication middleware
export const authenticate = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }
    
    const decoded = jwt.verify(token, process.env.JWT_SECRET!);
    req.user = decoded;
    
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};
```

## 📊 Database Design Specifications

### Database Schema (Prisma)

```prisma
// User model
model User {
  id          String   @id @default(cuid())
  email       String   @unique
  name        String
  password    String
  age         Int?
  weight      Float?
  height      Float?
  gender      Gender?
  nationality String?
  goal        Goal?
  activityLevel ActivityLevel?
  preferences String[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  
  dietPlans   DietPlan[]
  
  @@map("users")
}

// Diet Plan model
model DietPlan {
  id                String   @id @default(cuid())
  name              String
  description       String?
  weekStart         DateTime
  preferences       String[]
  customRequirements String?
  createdAt         DateTime @default(now())
  updatedAt         DateTime @updatedAt
  
  userId            String
  user              User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  meals             Meal[]
  
  @@map("diet_plans")
}

// Meal model
model Meal {
  id           String      @id @default(cuid())
  day          Day
  type         MealType
  name         String
  ingredients  String[]
  instructions String
  nutritionInfo Json?
  createdAt    DateTime    @default(now())
  
  dietPlanId   String
  dietPlan     DietPlan    @relation(fields: [dietPlanId], references: [id], onDelete: Cascade)
  
  @@map("meals")
}

// Enums
enum Gender {
  MALE
  FEMALE
  OTHER
}

enum Goal {
  WEIGHT_LOSS
  WEIGHT_GAIN
  MAINTENANCE
  MUSCLE_BUILDING
}

enum ActivityLevel {
  SEDENTARY
  LIGHTLY_ACTIVE
  MODERATELY_ACTIVE
  VERY_ACTIVE
  EXTREMELY_ACTIVE
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

### Database Indexes

```sql
-- Performance indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_diet_plans_user_id ON diet_plans(user_id);
CREATE INDEX idx_diet_plans_created_at ON diet_plans(created_at DESC);
CREATE INDEX idx_meals_diet_plan_id ON meals(diet_plan_id);
CREATE INDEX idx_meals_day_type ON meals(day, type);

-- Composite indexes for common queries
CREATE INDEX idx_diet_plans_user_week ON diet_plans(user_id, week_start);
CREATE INDEX idx_meals_plan_day ON meals(diet_plan_id, day);
```

## 🔧 Configuration Specifications

### Environment Variables

```bash
# Server Configuration
NODE_ENV=development|production
PORT=4000
HOST=localhost

# Database
DATABASE_URL="postgresql://username:password@localhost:5432/diet_planner"

# Authentication
JWT_SECRET="your-super-secret-key"
JWT_EXPIRES_IN="7d"

# OpenAI Integration
OPENAI_API_KEY="sk-your-openai-api-key"
OPENAI_MODEL="gpt-4-turbo-preview"

# Client Configuration
REACT_APP_API_URL="http://localhost:4000"
REACT_APP_ENV=development|production

# Optional: External Services
SMTP_HOST="smtp.gmail.com"
SMTP_PORT=587
SMTP_USER="your-email@gmail.com"
SMTP_PASS="your-app-password"

# Redis Cache (Optional)
REDIS_URL="redis://localhost:6379"

# File Upload (Optional)
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_S3_BUCKET="diet-planner-uploads"
```

### TypeScript Configuration

```json
// tsconfig.json (Frontend)
{
  "compilerOptions": {
    "target": "ES2020",
    "lib": ["DOM", "DOM.Iterable", "ES6"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "strict": true,
    "forceConsistentCasingInFileNames": true,
    "noFallthroughCasesInSwitch": true,
    "module": "ESNext",
    "moduleResolution": "node",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "baseUrl": "src",
    "paths": {
      "@/*": ["*"],
      "@/components/*": ["components/*"],
      "@/pages/*": ["pages/*"],
      "@/services/*": ["services/*"],
      "@/types/*": ["types/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "build", "dist"]
}

// tsconfig.json (Backend)
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "baseUrl": "./src",
    "paths": {
      "@/*": ["*"],
      "@/services/*": ["services/*"],
      "@/types/*": ["types/*"]
    }
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
```

## 🚀 Performance Specifications

### Frontend Performance Targets
- **First Contentful Paint (FCP)**: < 1.5s
- **Largest Contentful Paint (LCP)**: < 2.5s
- **First Input Delay (FID)**: < 100ms
- **Cumulative Layout Shift (CLS)**: < 0.1
- **Time to Interactive (TTI)**: < 3.5s

### Backend Performance Targets
- **API Response Time**: < 200ms (95th percentile)
- **Database Query Time**: < 100ms (95th percentile)
- **AI Generation Time**: < 10s (OpenAI dependent)
- **Concurrent Users**: 1000+
- **Requests per Second**: 500+

### Optimization Strategies

#### Frontend Optimizations
```typescript
// Code splitting with React.lazy()
const CreatePlan = lazy(() => import('./pages/CreatePlan'));
const DietPlans = lazy(() => import('./pages/DietPlans'));

// Component memoization
const MemoizedMealCard = memo(MealCard);

// Query optimization
const { data } = useQuery({
  queryKey: ['diet-plans', filters],
  queryFn: () => getDietPlans(filters),
  staleTime: 5 * 60 * 1000, // 5 minutes
  select: (data) => data.slice(0, 10), // Limit results
});
```

#### Backend Optimizations
```typescript
// Database query optimization
const dietPlans = await prisma.dietPlan.findMany({
  where: { userId },
  select: {
    id: true,
    name: true,
    createdAt: true,
    // Only select needed fields
  },
  take: 20, // Pagination
  orderBy: { createdAt: 'desc' },
});

// Response caching
app.get('/api/diet-plans', cache('5 minutes'), async (req, res) => {
  // Cached response logic
});
```

## 🔒 Security Specifications

### Frontend Security
- **XSS Protection**: Content Security Policy, input sanitization
- **CSRF Protection**: SameSite cookies, CSRF tokens
- **Input Validation**: Zod schemas, client-side validation
- **Secure Storage**: No sensitive data in localStorage

### Backend Security
- **Authentication**: JWT with secure headers
- **Authorization**: Role-based access control
- **Rate Limiting**: 100 requests/minute per IP
- **Input Validation**: Zod schemas, parameterized queries
- **Password Security**: bcrypt with salt rounds: 12
- **HTTPS**: SSL/TLS certificates, secure headers

### Security Headers
```typescript
// Helmet.js security headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
```

This comprehensive technical specification provides all the details needed for implementation and deployment! ⚙️✨