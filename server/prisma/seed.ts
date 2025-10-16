import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting seed...');

  // Create a test user
  const hashedPassword = await bcrypt.hash('password123', 12);
  
  const user = await prisma.user.upsert({
    where: { email: 'test@example.com' },
    update: {},
    create: {
      email: 'test@example.com',
      name: 'Test User',
      password: hashedPassword,
      age: 25,
      weight: 70.0,
      height: 175.0,
      gender: 'MALE',
      nationality: 'US',
      goal: 'MAINTENANCE',
      activityLevel: 'MODERATELY_ACTIVE',
      preferences: ['vegetarian', 'low-carb']
    }
  });

  console.log('Created user:', user);

  // Create a sample diet plan
  const dietPlan = await prisma.dietPlan.create({
    data: {
      userId: user.id,
      name: 'Weekly Balanced Diet',
      description: 'A balanced diet plan for maintenance',
      weekStart: new Date('2024-01-01'),
      weekEnd: new Date('2024-01-07'),
      isActive: true,
      meals: {
        create: [
          {
            day: 'MONDAY',
            mealType: 'BREAKFAST',
            name: 'Oatmeal with Berries',
            description: 'Healthy oatmeal with fresh berries and nuts',
            calories: 350,
            protein: 12.0,
            carbs: 55.0,
            fat: 8.0,
            fiber: 8.0,
            ingredients: ['oats', 'blueberries', 'almonds', 'honey'],
            instructions: 'Cook oats, add berries and nuts, drizzle with honey',
            prepTime: 5,
            cookTime: 10,
            servings: 1
          },
          {
            day: 'MONDAY',
            mealType: 'LUNCH',
            name: 'Grilled Chicken Salad',
            description: 'Fresh salad with grilled chicken breast',
            calories: 450,
            protein: 35.0,
            carbs: 15.0,
            fat: 25.0,
            fiber: 6.0,
            ingredients: ['chicken breast', 'mixed greens', 'tomatoes', 'cucumber', 'olive oil'],
            instructions: 'Grill chicken, mix with fresh vegetables and dressing',
            prepTime: 15,
            cookTime: 15,
            servings: 1
          }
        ]
      }
    }
  });

  console.log('Created diet plan:', dietPlan);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
