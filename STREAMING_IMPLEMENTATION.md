# Streaming Diet Plan Generation Implementation

## Overview
Implemented real-time streaming for diet plan generation to improve user experience by displaying meals as they are generated, rather than waiting for the entire week to be completed.

## Architecture

### Backend Changes

#### 1. REST API Endpoint (`server/src/index.ts`)
- **New Endpoint**: `POST /api/generate-diet-plan-stream`
- **Technology**: Server-Sent Events (SSE)
- **Features**:
  - Authenticates users via JWT token
  - Streams diet plan generation progress in real-time
  - Sends events for each day as meals are generated

#### 2. AI Service (`server/src/services/ai.service.ts`)
- **New Method**: `generateDietPlanStream()`
- **Functionality**:
  - Generates meals day by day instead of all 28 meals at once
  - Sends progress events after each day is completed
  - Falls back to default meals if AI generation fails
  - Uses separate API calls for each meal type (BREAKFAST, LUNCH, DINNER, SNACK)

#### 3. GraphQL Schema & Resolver (`server/src/graphql/`)
- **New Input**: `SaveDietPlanInput` - accepts pre-generated meals
- **New Input**: `MealInput` - structure for individual meals
- **New Mutation**: `saveDietPlan` - saves streamed meals to database

### Frontend Changes

#### 1. API Service (`client/src/services/api.ts`)
- **New Method**: `generateDietPlanStream()`
  - Uses Fetch API with ReadableStream
  - Parses Server-Sent Events
  - Provides progress callbacks
- **New Method**: `saveDietPlan()`
  - Saves generated meals to database after streaming completes

#### 2. CreatePlan Component (`client/src/pages/CreatePlan.tsx`)
- **Streaming State**:
  - `isGenerating`: tracks generation status
  - `streamProgress`: tracks current day, progress, and completed meals
- **UI Updates**:
  - Real-time progress indicator with percentage
  - Live display of completed days as they're generated
  - Shows each meal as it becomes available
  - Disabled navigation during generation

## Event Flow

1. **Start Event**: Initiated when generation begins
   ```json
   { "type": "start", "data": { "totalDays": 7 } }
   ```

2. **Progress Event**: Sent when starting a new day
   ```json
   { "type": "progress", "data": { "day": "MONDAY", "dayIndex": 0, "message": "Generating meals for MONDAY..." } }
   ```

3. **Day Complete Event**: Sent when all meals for a day are ready
   ```json
   { "type": "day_complete", "data": { "day": "MONDAY", "meals": [...], "dayIndex": 0 } }
   ```

4. **Plan Complete Event**: Sent when all days are generated
   ```json
   { "type": "plan_complete", "data": { "description": "...", "meals": [...], "totalMeals": 28 } }
   ```

5. **Complete Event**: Final event to close the stream
   ```json
   { "type": "complete" }
   ```

## Benefits

1. **Better UX**: Users see progress immediately instead of waiting
2. **Reduced Perceived Latency**: Incremental updates make the wait feel shorter
3. **Early Feedback**: Users can see meals being generated and cancel if needed
4. **Transparency**: Clear progress indication builds trust
5. **Error Resilience**: Individual meal failures don't break entire generation

## Usage

When a user clicks "Generate Plan" in the CreatePlan page:
1. The streaming endpoint is called
2. UI shows a progress bar and day counter
3. Each completed day appears in real-time
4. After all days complete, the plan is saved to database
5. User is redirected to the diet plans page

## Technical Notes

- Uses Server-Sent Events (SSE) instead of WebSockets for simplicity
- Graceful fallback to default meals if AI service fails
- All existing non-streaming functionality remains intact
- Compatible with the existing GraphQL API structure
