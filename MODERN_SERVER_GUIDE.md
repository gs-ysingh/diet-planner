# Modern Server Stack Implementation Guide

## 🚀 Server Modernization (2024-2025)

### Current vs Modern Backend

**Current:**
- Express.js
- Apollo Server + GraphQL
- JWT Authentication
- Prisma ORM

**Modern (Recommended):**
- Fastify (3x faster than Express)
- tRPC (Type-safe APIs)
- Lucia Auth (Modern authentication)
- Prisma with Edge functions

### Step-by-Step Migration

#### 1. Modern Package.json

```json
{
  "name": "diet-planner-server",
  "version": "1.0.0",
  "type": "module",
  "description": "Modern backend server for diet planner application",
  "main": "dist/index.js",
  "scripts": {
    "dev": "tsx watch --clear-screen=false src/index.ts",
    "build": "tsc && tsc-alias",
    "start": "node dist/index.js",
    "test": "vitest",
    "test:watch": "vitest --watch",
    "lint": "biome check .",
    "lint:fix": "biome check --apply .",
    "format": "biome format --write .",
    "db:generate": "prisma generate",
    "db:migrate": "prisma migrate dev",
    "db:studio": "prisma studio",
    "db:seed": "tsx src/prisma/seed.ts",
    "db:reset": "prisma migrate reset --force"
  },
  "dependencies": {
    "@fastify/cors": "^9.0.1",
    "@fastify/helmet": "^11.1.1", 
    "@fastify/rate-limit": "^9.1.0",
    "@trpc/server": "^10.45.0",
    "@lucia-auth/adapter-prisma": "^4.0.1",
    "lucia": "^3.0.1",
    "fastify": "^4.24.3",
    "zod": "^3.22.4",
    "@prisma/client": "^5.7.1",
    "openai": "^4.24.0",
    "@react-pdf/renderer": "^3.1.14",
    "bcryptjs": "^2.4.3",
    "dotenv": "^16.3.1",
    "oslo": "^1.1.2"
  },
  "devDependencies": {
    "@types/bcryptjs": "^2.4.6",
    "@types/node": "^20.10.6",
    "typescript": "^5.3.3",
    "tsx": "^4.6.2",
    "tsc-alias": "^1.8.8",
    "@biomejs/biome": "^1.4.1",
    "vitest": "^1.1.0",
    "prisma": "^5.7.1"
  }
}
```

#### 2. Modern Fastify Server Setup

```typescript
// src/server.ts - Modern Fastify setup
import Fastify from 'fastify';
import cors from '@fastify/cors';
import helmet from '@fastify/helmet';
import rateLimit from '@fastify/rate-limit';
import { createTRPCHandler } from '@trpc/server/adapters/fastify';
import { appRouter } from './trpc/router';
import { createContext } from './trpc/context';

const fastify = Fastify({
  logger: {
    level: process.env.NODE_ENV === 'production' ? 'warn' : 'info',
  },
});

// Security plugins
await fastify.register(helmet);
await fastify.register(cors, {
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true,
});

// Rate limiting
await fastify.register(rateLimit, {
  max: 100,
  timeWindow: '1 minute',
});

// tRPC handler
fastify.register(async function (fastify) {
  await fastify.register(createTRPCHandler, {
    prefix: '/trpc',
    router: appRouter,
    createContext,
  });
});

// Health check
fastify.get('/health', async () => {
  return { status: 'ok', timestamp: new Date().toISOString() };
});

const start = async () => {
  try {
    const port = Number(process.env.PORT) || 4000;
    await fastify.listen({ port, host: '0.0.0.0' });
    console.log(`🚀 Server ready at http://localhost:${port}`);
  } catch (err) {
    fastify.log.error(err);
    process.exit(1);
  }
};

start();
```

#### 3. tRPC Router Setup

```typescript
// src/trpc/router.ts - Type-safe API routes
import { z } from 'zod';
import { router, protectedProcedure, publicProcedure } from './trpc';
import { TRPCError } from '@trpc/server';
import { generateDietPlan } from '../services/openai.service';

export const appRouter = router({
  // Auth routes
  auth: router({
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
      }))
      .mutation(async ({ input, ctx }) => {
        // Modern auth implementation
        const user = await ctx.db.user.findUnique({
          where: { email: input.email },
        });

        if (!user || !await bcrypt.compare(input.password, user.password)) {
          throw new TRPCError({
            code: 'UNAUTHORIZED',
            message: 'Invalid credentials',
          });
        }

        // Create session with Lucia
        const session = await ctx.auth.createSession(user.id, {});
        
        return {
          user: { id: user.id, email: user.email, name: user.name },
          sessionId: session.id,
        };
      }),

    register: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(6),
        name: z.string().min(2),
      }))
      .mutation(async ({ input, ctx }) => {
        const hashedPassword = await bcrypt.hash(input.password, 12);
        
        const user = await ctx.db.user.create({
          data: {
            email: input.email,
            password: hashedPassword,
            name: input.name,
          },
        });

        const session = await ctx.auth.createSession(user.id, {});
        
        return {
          user: { id: user.id, email: user.email, name: user.name },
          sessionId: session.id,
        };
      }),
  }),

  // Diet plan routes
  dietPlans: router({
    getAll: protectedProcedure
      .query(async ({ ctx }) => {
        return ctx.db.dietPlan.findMany({
          where: { userId: ctx.user.id },
          orderBy: { createdAt: 'desc' },
          include: {
            meals: true,
          },
        });
      }),

    getById: protectedProcedure
      .input(z.string())
      .query(async ({ input, ctx }) => {
        const plan = await ctx.db.dietPlan.findUnique({
          where: { id: input, userId: ctx.user.id },
          include: { meals: true },
        });

        if (!plan) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Diet plan not found',
          });
        }

        return plan;
      }),

    generate: protectedProcedure
      .input(z.object({
        name: z.string().min(1).max(100),
        description: z.string().optional(),
        weekStart: z.string().datetime(),
        preferences: z.array(z.string()),
        customRequirements: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        // Generate plan with OpenAI
        const generatedPlan = await generateDietPlan(input, ctx.user);
        
        // Save to database
        const dietPlan = await ctx.db.dietPlan.create({
          data: {
            ...generatedPlan,
            userId: ctx.user.id,
          },
          include: { meals: true },
        });

        return dietPlan;
      }),

    delete: protectedProcedure
      .input(z.string())
      .mutation(async ({ input, ctx }) => {
        await ctx.db.dietPlan.delete({
          where: { id: input, userId: ctx.user.id },
        });
        
        return { success: true };
      }),
  }),

  // User routes
  user: router({
    me: protectedProcedure
      .query(async ({ ctx }) => {
        return ctx.user;
      }),

    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        age: z.number().optional(),
        weight: z.number().optional(),
        height: z.number().optional(),
        goal: z.enum(['WEIGHT_LOSS', 'WEIGHT_GAIN', 'MAINTENANCE']).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const user = await ctx.db.user.update({
          where: { id: ctx.user.id },
          data: input,
        });

        return user;
      }),
  }),
});

export type AppRouter = typeof appRouter;
```

#### 4. Modern Client Integration

```typescript
// src/lib/trpc.ts - Client setup
import { createTRPCReact } from '@trpc/react-query';
import type { AppRouter } from '../server/trpc/router';

export const trpc = createTRPCReact<AppRouter>();

// src/lib/trpc-client.ts
import { httpBatchLink } from '@trpc/client';
import { trpc } from './trpc';

export const trpcClient = trpc.createClient({
  links: [
    httpBatchLink({
      url: process.env.NEXT_PUBLIC_API_URL + '/trpc' || 'http://localhost:4000/trpc',
      headers: () => {
        const token = localStorage.getItem('token');
        return token ? { Authorization: `Bearer ${token}` } : {};
      },
    }),
  ],
});
```

#### 5. Usage in React Components

```typescript
// Modern API usage in components
import { trpc } from '../lib/trpc';

const CreatePlan: React.FC = () => {
  // Type-safe queries and mutations
  const { data: dietPlans, isLoading } = trpc.dietPlans.getAll.useQuery();
  
  const generatePlan = trpc.dietPlans.generate.useMutation({
    onSuccess: () => {
      // Auto-invalidates cache
      trpc.useContext().dietPlans.getAll.invalidate();
    },
  });

  const handleSubmit = (data: FormData) => {
    generatePlan.mutate({
      name: data.name,
      description: data.description,
      weekStart: data.weekStart,
      preferences: data.preferences,
      customRequirements: data.customRequirements,
    });
  };

  return (
    <div>
      {/* Fully type-safe, auto-complete, and cached */}
      {isLoading ? 'Loading...' : dietPlans?.map(plan => (
        <div key={plan.id}>{plan.name}</div>
      ))}
    </div>
  );
};
```

### Benefits of Modern Stack

1. **Type Safety**: End-to-end type safety from database to UI
2. **Performance**: 3x faster with Fastify vs Express
3. **Developer Experience**: Auto-complete, compile-time error checking
4. **Security**: Modern authentication with Lucia
5. **Caching**: Built-in with tRPC and React Query
6. **Real-time**: Easy WebSocket integration
7. **Testing**: Better testability with tRPC procedures

### Migration Strategy

1. **Phase 1**: Install modern dependencies
2. **Phase 2**: Set up tRPC alongside existing GraphQL
3. **Phase 3**: Migrate routes one by one
4. **Phase 4**: Replace frontend API calls
5. **Phase 5**: Remove old GraphQL/Express code

This modern stack provides exceptional developer experience with full type safety and performance! 🚀