import puppeteer from 'puppeteer';

interface DietPlan {
  id: string;
  name: string;
  description?: string;
  weekStart: Date;
  weekEnd: Date;
  user: {
    name: string;
    email: string;
    age?: number;
    weight?: number;
    height?: number;
    goal?: string;
  };
  meals: Array<{
    day: string;
    mealType: string;
    name: string;
    description?: string;
    calories?: number;
    protein?: number;
    carbs?: number;
    fat?: number;
    fiber?: number;
    ingredients: string[];
    instructions?: string;
    prepTime?: number;
    cookTime?: number;
    servings?: number;
  }>;
}

export class PDFService {
  async generateDietPlanPDF(dietPlan: DietPlan): Promise<Buffer> {
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    try {
      const page = await browser.newPage();
      
      const htmlContent = this.generateHTMLContent(dietPlan);
      
      await page.setContent(htmlContent, {
        waitUntil: 'networkidle0'
      });

      const pdfBuffer = await page.pdf({
        format: 'A4',
        printBackground: true,
        margin: {
          top: '20mm',
          right: '15mm',
          bottom: '20mm',
          left: '15mm'
        }
      });

      return Buffer.from(pdfBuffer);
    } finally {
      await browser.close();
    }
  }

  private generateHTMLContent(dietPlan: DietPlan): string {
    const daysOfWeek = ['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'];
    const mealTypes = ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK'];

    const mealsByDay = daysOfWeek.map(day => ({
      day,
      meals: mealTypes.map(mealType => 
        dietPlan.meals.find(meal => meal.day === day && meal.mealType === mealType)
      ).filter(Boolean)
    }));

    const formatDate = (date: Date) => {
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    };

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Diet Plan - ${dietPlan.name}</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', sans-serif;
            line-height: 1.6;
            color: #333;
            background: #fff;
        }
        
        .header {
            text-align: center;
            padding: 20px 0;
            border-bottom: 3px solid #4CAF50;
            margin-bottom: 30px;
        }
        
        .header h1 {
            color: #4CAF50;
            font-size: 2.5em;
            margin-bottom: 10px;
        }
        
        .header .subtitle {
            color: #666;
            font-size: 1.2em;
        }
        
        .user-info {
            background: #f8f9fa;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
            border-left: 4px solid #4CAF50;
        }
        
        .user-info h2 {
            color: #4CAF50;
            margin-bottom: 15px;
        }
        
        .user-info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
        }
        
        .info-label {
            font-weight: bold;
            color: #555;
        }
        
        .plan-overview {
            margin-bottom: 30px;
        }
        
        .plan-overview h2 {
            color: #4CAF50;
            margin-bottom: 10px;
        }
        
        .date-range {
            background: #e8f5e8;
            padding: 15px;
            border-radius: 5px;
            margin-bottom: 20px;
        }
        
        .day-section {
            margin-bottom: 40px;
            page-break-inside: avoid;
        }
        
        .day-header {
            background: linear-gradient(135deg, #4CAF50, #45a049);
            color: white;
            padding: 15px 20px;
            border-radius: 8px 8px 0 0;
            font-size: 1.3em;
            font-weight: bold;
            text-transform: capitalize;
        }
        
        .meals-container {
            border: 1px solid #ddd;
            border-top: none;
            border-radius: 0 0 8px 8px;
        }
        
        .meal {
            padding: 20px;
            border-bottom: 1px solid #eee;
        }
        
        .meal:last-child {
            border-bottom: none;
        }
        
        .meal-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .meal-type {
            background: #f0f0f0;
            padding: 5px 15px;
            border-radius: 20px;
            font-size: 0.9em;
            font-weight: bold;
            color: #666;
            text-transform: uppercase;
        }
        
        .meal-name {
            font-size: 1.3em;
            font-weight: bold;
            color: #333;
            margin-bottom: 10px;
        }
        
        .meal-description {
            color: #666;
            margin-bottom: 15px;
            font-style: italic;
        }
        
        .nutrition-info {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 10px;
            margin-bottom: 15px;
            background: #f8f9fa;
            padding: 15px;
            border-radius: 5px;
        }
        
        .nutrition-item {
            text-align: center;
        }
        
        .nutrition-value {
            font-size: 1.2em;
            font-weight: bold;
            color: #4CAF50;
        }
        
        .nutrition-label {
            font-size: 0.8em;
            color: #666;
            text-transform: uppercase;
        }
        
        .ingredients {
            margin-bottom: 15px;
        }
        
        .ingredients h4 {
            color: #555;
            margin-bottom: 8px;
        }
        
        .ingredients-list {
            display: flex;
            flex-wrap: wrap;
            gap: 5px;
        }
        
        .ingredient {
            background: #e8f5e8;
            padding: 4px 8px;
            border-radius: 12px;
            font-size: 0.9em;
            color: #2e7d32;
        }
        
        .instructions {
            background: #fff3cd;
            padding: 15px;
            border-radius: 5px;
            border-left: 4px solid #ffc107;
        }
        
        .instructions h4 {
            color: #856404;
            margin-bottom: 8px;
        }
        
        .time-info {
            display: flex;
            gap: 20px;
            margin-top: 10px;
            font-size: 0.9em;
            color: #666;
        }
        
        .time-item {
            display: flex;
            align-items: center;
            gap: 5px;
        }
        
        .footer {
            text-align: center;
            padding: 30px 0;
            border-top: 2px solid #4CAF50;
            margin-top: 40px;
            color: #666;
        }
        
        @media print {
            .day-section {
                page-break-inside: avoid;
                break-inside: avoid;
            }
            
            .meal {
                page-break-inside: avoid;
                break-inside: avoid;
            }
        }
    </style>
</head>
<body>
    <div class="header">
        <h1>${dietPlan.name}</h1>
        <div class="subtitle">Personalized Diet Plan</div>
    </div>
    
    <div class="user-info">
        <h2>Personal Information</h2>
        <div class="user-info-grid">
            <div class="info-item">
                <span class="info-label">Name:</span>
                <span>${dietPlan.user.name}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Email:</span>
                <span>${dietPlan.user.email}</span>
            </div>
            ${dietPlan.user.age ? `
            <div class="info-item">
                <span class="info-label">Age:</span>
                <span>${dietPlan.user.age} years</span>
            </div>
            ` : ''}
            ${dietPlan.user.weight ? `
            <div class="info-item">
                <span class="info-label">Weight:</span>
                <span>${dietPlan.user.weight} kg</span>
            </div>
            ` : ''}
            ${dietPlan.user.height ? `
            <div class="info-item">
                <span class="info-label">Height:</span>
                <span>${dietPlan.user.height} cm</span>
            </div>
            ` : ''}
            ${dietPlan.user.goal ? `
            <div class="info-item">
                <span class="info-label">Goal:</span>
                <span>${dietPlan.user.goal.replace('_', ' ')}</span>
            </div>
            ` : ''}
        </div>
    </div>
    
    <div class="plan-overview">
        <h2>Plan Overview</h2>
        <div class="date-range">
            <strong>Duration:</strong> ${formatDate(dietPlan.weekStart)} - ${formatDate(dietPlan.weekEnd)}
        </div>
        ${dietPlan.description ? `<p>${dietPlan.description}</p>` : ''}
    </div>
    
    ${mealsByDay.map(({ day, meals }) => `
    <div class="day-section">
        <div class="day-header">${day.toLowerCase()}</div>
        <div class="meals-container">
            ${meals.map(meal => `
            <div class="meal">
                <div class="meal-header">
                    <div class="meal-type">${meal!.mealType}</div>
                </div>
                <div class="meal-name">${meal!.name}</div>
                ${meal!.description ? `<div class="meal-description">${meal!.description}</div>` : ''}
                
                ${meal!.calories || meal!.protein || meal!.carbs || meal!.fat || meal!.fiber ? `
                <div class="nutrition-info">
                    ${meal!.calories ? `
                    <div class="nutrition-item">
                        <div class="nutrition-value">${meal!.calories}</div>
                        <div class="nutrition-label">Calories</div>
                    </div>
                    ` : ''}
                    ${meal!.protein ? `
                    <div class="nutrition-item">
                        <div class="nutrition-value">${meal!.protein}g</div>
                        <div class="nutrition-label">Protein</div>
                    </div>
                    ` : ''}
                    ${meal!.carbs ? `
                    <div class="nutrition-item">
                        <div class="nutrition-value">${meal!.carbs}g</div>
                        <div class="nutrition-label">Carbs</div>
                    </div>
                    ` : ''}
                    ${meal!.fat ? `
                    <div class="nutrition-item">
                        <div class="nutrition-value">${meal!.fat}g</div>
                        <div class="nutrition-label">Fat</div>
                    </div>
                    ` : ''}
                    ${meal!.fiber ? `
                    <div class="nutrition-item">
                        <div class="nutrition-value">${meal!.fiber}g</div>
                        <div class="nutrition-label">Fiber</div>
                    </div>
                    ` : ''}
                </div>
                ` : ''}
                
                ${meal!.ingredients.length > 0 ? `
                <div class="ingredients">
                    <h4>Ingredients:</h4>
                    <div class="ingredients-list">
                        ${meal!.ingredients.map(ingredient => `
                        <span class="ingredient">${ingredient}</span>
                        `).join('')}
                    </div>
                </div>
                ` : ''}
                
                ${meal!.instructions ? `
                <div class="instructions">
                    <h4>Instructions:</h4>
                    <p>${meal!.instructions}</p>
                    ${meal!.prepTime || meal!.cookTime || meal!.servings ? `
                    <div class="time-info">
                        ${meal!.prepTime ? `<div class="time-item">⏱️ Prep: ${meal!.prepTime} min</div>` : ''}
                        ${meal!.cookTime ? `<div class="time-item">🔥 Cook: ${meal!.cookTime} min</div>` : ''}
                        ${meal!.servings ? `<div class="time-item">🍽️ Serves: ${meal!.servings}</div>` : ''}
                    </div>
                    ` : ''}
                </div>
                ` : ''}
            </div>
            `).join('')}
        </div>
    </div>
    `).join('')}
    
    <div class="footer">
        <p>Generated on ${new Date().toLocaleDateString('en-US', { 
          year: 'numeric', 
          month: 'long', 
          day: 'numeric' 
        })}</p>
        <p>Diet Planner App - Your Personal Nutrition Assistant</p>
    </div>
</body>
</html>`;
  }
}
