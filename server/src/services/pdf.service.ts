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
            font-family: 'Inter', 'Segoe UI', 'Roboto', 'Helvetica Neue', Arial, sans-serif;
            line-height: 1.6;
            color: #212121;
            background: #f8fafc;
        }
        
        .header {
            background: linear-gradient(135deg, #4ca6c9 0%, #3c89af 100%);
            color: white;
            padding: 40px 0;
            text-align: center;
            border-radius: 12px 12px 0 0;
            margin-bottom: 30px;
            position: relative;
            overflow: hidden;
        }
        
        .header::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background: radial-gradient(circle at 80% 20%, rgba(255,255,255,0.1) 0%, transparent 50%);
        }
        
        .header h1 {
            color: white;
            font-size: 2.5em;
            margin-bottom: 10px;
            font-weight: 700;
            position: relative;
            z-index: 1;
        }
        
        .header .subtitle {
            color: rgba(255,255,255,0.95);
            font-size: 1.2em;
            font-weight: 400;
            position: relative;
            z-index: 1;
        }
        
        .user-info {
            background: white;
            padding: 25px;
            border-radius: 12px;
            margin-bottom: 30px;
            border: 1px solid #e0e0e0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        
        .user-info h2 {
            color: #212121;
            margin-bottom: 20px;
            font-size: 1.5em;
            font-weight: 700;
        }
        
        .user-info-grid {
            display: grid;
            grid-template-columns: repeat(2, 1fr);
            gap: 15px;
        }
        
        .info-item {
            display: flex;
            justify-content: space-between;
            padding: 10px 0;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .info-label {
            font-weight: 600;
            color: #757575;
        }
        
        .info-value {
            color: #212121;
            font-weight: 500;
        }
        
        .plan-overview {
            margin-bottom: 30px;
            background: white;
            padding: 25px;
            border-radius: 12px;
            border: 1px solid #e0e0e0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        
        .plan-overview h2 {
            color: #212121;
            margin-bottom: 15px;
            font-size: 1.5em;
            font-weight: 700;
        }
        
        .date-range {
            background: rgba(76, 166, 201, 0.08);
            padding: 15px;
            border-radius: 8px;
            margin-bottom: 15px;
            border-left: 4px solid #4ca6c9;
        }
        
        .day-section {
            margin-bottom: 40px;
            page-break-inside: avoid;
            background: white;
            border-radius: 12px;
            overflow: hidden;
            border: 1px solid #e0e0e0;
            box-shadow: 0 1px 3px rgba(0, 0, 0, 0.08);
        }
        
        .day-header {
            background: linear-gradient(135deg, #4ca6c9 0%, #3c89af 100%);
            color: white;
            padding: 20px 25px;
            font-size: 1.4em;
            font-weight: 700;
            text-transform: capitalize;
        }
        
        .meals-container {
            padding: 0;
        }
        
        .meal {
            padding: 25px;
            border-bottom: 1px solid #f0f0f0;
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
            background: rgba(76, 166, 201, 0.1);
            color: #4ca6c9;
            padding: 6px 16px;
            border-radius: 8px;
            font-size: 0.85em;
            font-weight: 600;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .meal-name {
            font-size: 1.4em;
            font-weight: 700;
            color: #212121;
            margin-bottom: 10px;
        }
        
        .meal-description {
            color: #757575;
            margin-bottom: 15px;
            font-style: normal;
            line-height: 1.7;
        }
        
        .nutrition-info {
            display: grid;
            grid-template-columns: repeat(5, 1fr);
            gap: 12px;
            margin-bottom: 20px;
            background: #f8fafc;
            padding: 20px;
            border-radius: 8px;
            border: 1px solid #e0e0e0;
        }
        
        .nutrition-item {
            text-align: center;
        }
        
        .nutrition-value {
            font-size: 1.3em;
            font-weight: 700;
            color: #4ca6c9;
            margin-bottom: 4px;
        }
        
        .nutrition-label {
            font-size: 0.75em;
            color: #757575;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            font-weight: 600;
        }
        
        .ingredients {
            margin-bottom: 20px;
        }
        
        .ingredients h4 {
            color: #212121;
            margin-bottom: 12px;
            font-weight: 700;
            font-size: 1.1em;
        }
        
        .ingredients-list {
            display: flex;
            flex-wrap: wrap;
            gap: 8px;
        }
        
        .ingredient {
            background: rgba(76, 166, 201, 0.08);
            color: #4ca6c9;
            padding: 6px 12px;
            border-radius: 6px;
            font-size: 0.9em;
            font-weight: 500;
            border: 1px solid rgba(76, 166, 201, 0.2);
        }
        
        .instructions {
            background: rgba(255, 152, 0, 0.05);
            padding: 20px;
            border-radius: 8px;
            border-left: 4px solid #ff9800;
        }
        
        .instructions h4 {
            color: #212121;
            margin-bottom: 12px;
            font-weight: 700;
            font-size: 1.1em;
        }
        
        .instructions p {
            color: #424242;
            line-height: 1.8;
        }
        
        .time-info {
            display: flex;
            gap: 20px;
            margin-top: 15px;
            font-size: 0.9em;
            color: #757575;
            font-weight: 500;
        }
        
        .time-item {
            display: flex;
            align-items: center;
            gap: 6px;
        }
        
        .footer {
            text-align: center;
            padding: 30px 0;
            margin-top: 40px;
            color: #757575;
            border-top: 2px solid #e0e0e0;
        }
        
        .footer p {
            margin: 5px 0;
        }
        
        @media print {
            body {
                background: white;
            }
            
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
                <span class="info-value">${dietPlan.user.name}</span>
            </div>
            <div class="info-item">
                <span class="info-label">Email:</span>
                <span class="info-value">${dietPlan.user.email}</span>
            </div>
            ${dietPlan.user.age ? `
            <div class="info-item">
                <span class="info-label">Age:</span>
                <span class="info-value">${dietPlan.user.age} years</span>
            </div>
            ` : ''}
            ${dietPlan.user.weight ? `
            <div class="info-item">
                <span class="info-label">Weight:</span>
                <span class="info-value">${dietPlan.user.weight} kg</span>
            </div>
            ` : ''}
            ${dietPlan.user.height ? `
            <div class="info-item">
                <span class="info-label">Height:</span>
                <span class="info-value">${dietPlan.user.height} cm</span>
            </div>
            ` : ''}
            ${dietPlan.user.goal ? `
            <div class="info-item">
                <span class="info-label">Goal:</span>
                <span class="info-value">${dietPlan.user.goal.replace('_', ' ')}</span>
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
