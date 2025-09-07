import { GoogleGenAI, Type } from "@google/genai";
import type { TrainingLevel, TrainingLocation, Equipment, InjuryHistory, TrainingDays, WorkoutPlan, BloodTestAnalysis, MacroGoals, Recipe, OverloadData, CorrectiveExercise, BodyPart } from "./types";

interface GenerationParams {
    level: TrainingLevel;
    availableDays: TrainingDays;
    trainingLocation: TrainingLocation;
    equipment: Equipment;
    injuryHistory: InjuryHistory;
    previousProgress: string;
    goals: string[];
}

// Omit id because it will be generated client-side
export const generateMultiGoalWorkoutPlanApi = async (params: GenerationParams): Promise<Omit<WorkoutPlan, 'id'>> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const availableEquipment = Object.entries(params.equipment)
        .filter(([_, value]) => value)
        .map(([key]) => key)
        .join(', ') || 'none';

    const injuryInfo = params.injuryHistory.hasInjuries 
        ? `The user has the following injuries to consider: ${params.injuryHistory.injuries}. Please provide safe alternatives and modifications.`
        : 'The user has no reported injuries.';

    const prompt = `
        You are a world-class certified personal trainer and fitness coach. Your task is to create a highly personalized, multi-day workout plan based on the user's detailed profile.

        User Profile:
        - Fitness Level: ${params.level}
        - Training Days per Week: ${params.availableDays}
        - Primary Training Location: ${params.trainingLocation}
        - Available Equipment: ${availableEquipment}
        - Primary Fitness Goals: ${params.goals.join(', ')}
        - Injury History: ${injuryInfo}
        - Previous Progress/History: ${params.previousProgress || 'No previous progress provided.'}

        Instructions:
        1.  Create a comprehensive workout plan for the specified number of training days.
        2.  Each day should have a clear focus (e.g., Push, Pull, Legs, Full Body, Upper Body, Lower Body, Active Recovery).
        3.  For each exercise, specify the name, number of sets, repetition range (e.g., "8-12"), rest period in seconds, and required equipment.
        4.  If the user has injuries, include specific notes or alternative exercises to ensure safety. For example, if they have a knee injury, suggest box squats instead of deep squats.
        5.  The plan's name and description should be motivating and reflect the user's goals.
        6.  The exercise selection should be appropriate for the user's level, goals, and available equipment.
        7.  Return the response as a single JSON object that strictly adheres to the provided schema. Do not include any markdown formatting.
    `;

    const exerciseSchema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            sets: { type: Type.INTEGER },
            reps: { type: Type.STRING, description: 'Repetition range, e.g., "8-12" or "AMRAP"' },
            rest: { type: Type.INTEGER, description: 'Rest time in seconds between sets' },
            equipment: { type: Type.STRING },
            notes: { type: Type.STRING, description: 'Optional notes for form, safety, or alternatives.' },
        },
        required: ['name', 'sets', 'reps', 'rest', 'equipment']
    };

    const dayPlanSchema = {
        type: Type.OBJECT,
        properties: {
            day: { type: Type.INTEGER },
            focus: { type: Type.STRING, description: 'e.g., "Push Day", "Full Body Strength"' },
            exercises: {
                type: Type.ARRAY,
                items: exerciseSchema
            }
        },
        required: ['day', 'focus', 'exercises']
    };

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING, description: "A creative and motivating name for the workout plan." },
            description: { type: Type.STRING, description: "A brief, encouraging description of the plan." },
            focus: { type: Type.ARRAY, items: { type: Type.STRING }, description: "The primary goals of this plan." },
            days: {
                type: Type.ARRAY,
                items: dayPlanSchema
            }
        },
        required: ['name', 'description', 'focus', 'days']
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const workoutData = JSON.parse(response.text);
    return workoutData;
};

export const analyzeBloodTestApi = async (biomarkers: Record<string, string>): Promise<BloodTestAnalysis> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
        You are an expert sports scientist and functional medicine practitioner specializing in optimizing human performance.
        Analyze the following blood test results for an active individual. Provide a concise summary, a detailed breakdown of each marker, and actionable recommendations related to fitness, nutrition, and lifestyle.

        User's Biomarker Data:
        ${JSON.stringify(biomarkers, null, 2)}

        Instructions:
        1.  **Summary:** Provide a brief, easy-to-understand overview of the results, highlighting key findings.
        2.  **Biomarker Breakdown:** For each marker provided by the user:
            -   State the marker's name, the user's value, and the standard unit.
            -   Provide a generally accepted optimal range for active individuals.
            -   Assign a status: "Optimal", "Borderline", "High", or "Low".
            -   Write a brief interpretation of what this marker indicates for health and athletic performance.
        3.  **Recommendations:** Based on the results, provide specific, actionable advice categorized into:
            -   **Nutrition:** Specific foods to incorporate or reduce.
            -   **Supplements:** Potential supplements that could help (e.g., "Consider supplementing with Vitamin D...").
            -   **Lifestyle & Training:** Suggestions regarding sleep, stress management, or potential training modifications.
        4.  **Disclaimer:** Include a clear disclaimer that this analysis is for informational purposes and is not a substitute for professional medical advice.
        5.  Return the response as a single JSON object that strictly adheres to the provided schema. Do not include any markdown formatting.
    `;

    const analyzedMarkerSchema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            value: { type: Type.STRING },
            unit: { type: Type.STRING },
            optimalRange: { type: Type.STRING },
            status: { type: Type.STRING, enum: ["Optimal", "Borderline", "High", "Low"] },
            interpretation: { type: Type.STRING }
        },
        required: ["name", "value", "unit", "optimalRange", "status", "interpretation"]
    };

    const recommendationsSchema = {
        type: Type.OBJECT,
        properties: {
            nutrition: { type: Type.ARRAY, items: { type: Type.STRING } },
            supplements: { type: Type.ARRAY, items: { type: Type.STRING } },
            lifestyle: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Lifestyle and Training recommendations" }
        },
        required: ["nutrition", "supplements", "lifestyle"]
    };

    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            summary: { type: Type.STRING },
            disclaimer: { type: Type.STRING },
            analyzedMarkers: { type: Type.ARRAY, items: analyzedMarkerSchema },
            recommendations: recommendationsSchema
        },
        required: ["summary", "disclaimer", "analyzedMarkers", "recommendations"]
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const analysisData = JSON.parse(response.text);
    return analysisData;
};

interface RecipeGenerationParams {
    macroGoals: MacroGoals;
    dietaryPreferences: string[];
    allergies: string[];
}

// Omit id because it will be generated client-side
export const generateRecipesApi = async (params: RecipeGenerationParams): Promise<Omit<Recipe, 'id'>[]> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const preferences = params.dietaryPreferences.length > 0 ? `Dietary preferences: ${params.dietaryPreferences.join(', ')}.` : '';
    const allergiesInfo = params.allergies.length > 0 ? `The user is allergic to: ${params.allergies.join(', ')}. Avoid these ingredients strictly.` : '';

    const prompt = `
        You are an expert sports nutritionist. Your task is to generate 2-3 delicious, healthy, and easy-to-make recipes based on the user's macro goals and dietary restrictions.

        User Profile:
        - Calorie Goal: ${params.macroGoals.calories} kcal
        - Protein Goal: ${params.macroGoals.protein} g
        - Carbohydrate Goal: ${params.macroGoals.carbs} g
        - Fat Goal: ${params.macroGoals.fats} g
        - ${preferences}
        - ${allergiesInfo}

        Instructions:
        1.  Generate 2 or 3 distinct recipes (e.g., breakfast, lunch, dinner).
        2.  For each recipe, provide a name, description, meal type, prep and cook times, a list of ingredients with amounts, step-by-step instructions, and total macros.
        3.  The macros for each recipe should be estimated and contribute reasonably to the user's daily goals.
        4.  For each ingredient, provide its name, amount, estimated macros (calories, protein, carbs, fats), a category (e.g., proteína, carbohidrato, vegetal, grasa), and a list of potential substitutes.
        5.  Ensure the instructions are clear and concise.
        6.  Return the response as a single JSON array of recipe objects that strictly adheres to the provided schema. Do not include any markdown formatting.
    `;

    const macroSchema = {
        type: Type.OBJECT,
        properties: {
            calories: { type: Type.NUMBER },
            protein: { type: Type.NUMBER },
            carbs: { type: Type.NUMBER },
            fats: { type: Type.NUMBER },
        },
        required: ['calories', 'protein', 'carbs', 'fats']
    };

    const ingredientSchema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            amount: { type: Type.STRING },
            macros: macroSchema,
            category: { type: Type.STRING },
            substitutes: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['name', 'amount', 'macros', 'category', 'substitutes']
    };

    const recipeSchema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            mealType: { type: Type.STRING, enum: ['breakfast', 'lunch', 'dinner', 'snack'] },
            prepTime: { type: Type.INTEGER },
            cookTime: { type: Type.INTEGER },
            ingredients: { type: Type.ARRAY, items: ingredientSchema },
            instructions: { type: Type.ARRAY, items: { type: Type.STRING } },
            totalMacros: macroSchema,
        },
        required: ['name', 'description', 'mealType', 'prepTime', 'cookTime', 'ingredients', 'instructions', 'totalMacros']
    };

    const responseSchema = {
        type: Type.ARRAY,
        items: recipeSchema
    };

    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const recipeData = JSON.parse(response.text);
    return recipeData;
};


interface OverloadDetectionParams {
    painAreas: BodyPart[];
    activityLevel: 'sedentario' | 'ligero' | 'moderado' | 'intenso' | 'atleta';
    recentWorkouts: string[];
}

interface OverloadDetectionResponse {
    overloadData: OverloadData[];
    correctiveExercises: CorrectiveExercise[];
}

export const detectOverloadApi = async (params: OverloadDetectionParams): Promise<OverloadDetectionResponse> => {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

    const prompt = `
        You are an expert sports physiotherapist and kinesiologist. Your task is to analyze a user's reported muscle/joint discomfort and activity profile to detect potential areas of overload and recommend corrective exercises.

        User Profile:
        - Areas of Discomfort/Tension: ${params.painAreas.join(', ')}
        - Activity Level: ${params.activityLevel}
        - Recent Workouts (if provided): ${params.recentWorkouts.join(', ') || 'Not provided'}

        Instructions:
        1.  Analyze the user's input to identify patterns of muscular, tendinous, or articular overload.
        2.  For each reported area of discomfort, generate an 'OverloadData' object.
            -   Estimate the 'severity' on a scale of 1-10.
            -   Determine the likely 'frequency' ('ocasional', 'frecuente', 'constante').
            -   Classify the 'type' of overload ('muscular', 'articular', 'tendinosa').
        3.  Based on the detected overloads, recommend a set of 3-5 appropriate 'CorrectiveExercise' objects.
            -   For each exercise, provide a name, a clear description, duration/reps, required equipment ('ninguno', 'banda', 'pelota', 'rodillo'), and the primary body part(s) it targets.
            -   The exercises should be focused on mobility, activation, or releasing tension in the affected areas and their related kinetic chains. For example, if the user reports knee pain, you might recommend glute activation and hip mobility exercises.
        4.  Return the response as a single JSON object containing two keys: 'overloadData' (an array) and 'correctiveExercises' (an array), strictly adhering to the provided schema. Do not include any markdown formatting.
    `;
    
    const overloadDataSchema = {
        type: Type.OBJECT,
        properties: {
            bodyPart: { type: Type.STRING },
            severity: { type: Type.INTEGER },
            lastIncident: { type: Type.STRING, description: "Optional: e.g., '2 days ago'" },
            frequency: { type: Type.STRING, enum: ['ocasional', 'frecuente', 'constante'] },
            type: { type: Type.STRING, enum: ['muscular', 'articular', 'tendinosa'] },
        },
        required: ['bodyPart', 'severity', 'frequency', 'type']
    };

    const correctiveExerciseSchema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            description: { type: Type.STRING },
            duration: { type: Type.STRING, description: "e.g., '3 sets x 10 reps' or '2 minutes'" },
            equipment: { type: Type.STRING, enum: ['ninguno', 'banda', 'pelota', 'rodillo'] },
            videoUrl: { type: Type.STRING },
            targetArea: { type: Type.ARRAY, items: { type: Type.STRING } },
        },
        required: ['name', 'description', 'duration', 'equipment', 'targetArea']
    };
    
    const responseSchema = {
        type: Type.OBJECT,
        properties: {
            overloadData: { type: Type.ARRAY, items: overloadDataSchema },
            correctiveExercises: { type: Type.ARRAY, items: correctiveExerciseSchema },
        },
        required: ['overloadData', 'correctiveExercises']
    };
    
    const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: prompt,
        config: {
            responseMimeType: "application/json",
            responseSchema: responseSchema,
        },
    });

    const overloadResponseData = JSON.parse(response.text);
    return overloadResponseData;
};