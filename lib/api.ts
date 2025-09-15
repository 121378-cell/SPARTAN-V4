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
        .join(', ') || 'ninguno';

    const injuryInfo = params.injuryHistory.hasInjuries 
        ? `El usuario tiene las siguientes lesiones a considerar: ${params.injuryHistory.injuries}. Por favor, proporciona alternativas seguras y modificaciones.`
        : 'El usuario no ha reportado lesiones.';

    const prompt = `
        Eres un entrenador personal y preparador físico certificado de clase mundial. Tu tarea es crear un plan de entrenamiento de varios días, altamente personalizado, basado en el perfil detallado del usuario.

        Perfil del Usuario:
        - Nivel de Condición Física: ${params.level}
        - Días de Entrenamiento por Semana: ${params.availableDays}
        - Lugar Principal de Entrenamiento: ${params.trainingLocation}
        - Equipamiento Disponible: ${availableEquipment}
        - Objetivos Principales de Fitness: ${params.goals.join(', ')}
        - Historial de Lesiones: ${injuryInfo}
        - Progreso/Historial Previo: ${params.previousProgress || 'No se ha proporcionado progreso previo.'}

        Instrucciones:
        1.  Crea un plan de entrenamiento completo para el número de días especificado.
        2.  Cada día debe tener un enfoque claro (ej: Empuje, Tirón, Piernas, Cuerpo Completo, Tren Superior, Tren Inferior, Recuperación Activa).
        3.  Para cada ejercicio, especifica el nombre, número de series, rango de repeticiones (ej: "8-12"), período de descanso en segundos y equipamiento requerido.
        4.  Si el usuario tiene lesiones, incluye notas específicas o ejercicios alternativos para garantizar la seguridad. Por ejemplo, si tiene una lesión de rodilla, sugiere sentadillas a un cajón en lugar de sentadillas profundas.
        5.  El nombre y la descripción del plan deben ser motivadores y reflejar los objetivos del usuario.
        6.  La selección de ejercicios debe ser apropiada para el nivel del usuario, sus objetivos y el equipamiento disponible.
        7.  Devuelve la respuesta como un único objeto JSON que se adhiera estrictamente al esquema proporcionado. No incluyas ningún formato markdown.
    `;

    const exerciseSchema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            sets: { type: Type.INTEGER },
            reps: { type: Type.STRING, description: 'Rango de repeticiones, ej: "8-12" o "AMRAP"' },
            rest: { type: Type.INTEGER, description: 'Tiempo de descanso en segundos entre series' },
            equipment: { type: Type.STRING },
            notes: { type: Type.STRING, description: 'Notas opcionales sobre técnica, seguridad o alternativas.' },
        },
        required: ['name', 'sets', 'reps', 'rest', 'equipment']
    };

    const dayPlanSchema = {
        type: Type.OBJECT,
        properties: {
            day: { type: Type.INTEGER },
            focus: { type: Type.STRING, description: 'ej: "Día de Empuje", "Fuerza de Cuerpo Completo"' },
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
            name: { type: Type.STRING, description: "Un nombre creativo y motivador para el plan de entrenamiento." },
            description: { type: Type.STRING, description: "Una descripción breve y alentadora del plan." },
            focus: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Los objetivos principales de este plan." },
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
        Eres un científico deportivo experto y un profesional de la medicina funcional especializado en optimizar el rendimiento humano.
        Analiza los siguientes resultados de análisis de sangre para una persona activa. Proporciona un resumen conciso, un desglose detallado de cada marcador y recomendaciones prácticas relacionadas con el fitness, la nutrición y el estilo de vida.

        Datos de Biomarcadores del Usuario:
        ${JSON.stringify(biomarkers, null, 2)}

        Instrucciones:
        1.  **Resumen:** Proporciona una visión general breve y fácil de entender de los resultados, destacando los hallazgos clave.
        2.  **Desglose de Biomarcadores:** Para cada marcador proporcionado por el usuario:
            -   Indica el nombre del marcador, el valor del usuario y la unidad estándar.
            -   Proporciona un rango óptimo generalmente aceptado para individuos activos.
            -   Asigna un estado: "Óptimo", "Límite", "Alto" o "Bajo".
            -   Escribe una breve interpretación de lo que este marcador indica para la salud y el rendimiento deportivo.
        3.  **Recomendaciones:** Basado en los resultados, proporciona consejos específicos y prácticos categorizados en:
            -   **Nutrición:** Alimentos específicos para incorporar o reducir.
            -   **Suplementos:** Posibles suplementos que podrían ayudar (ej: "Considera suplementar con Vitamina D...").
            -   **Estilo de Vida y Entrenamiento:** Sugerencias sobre sueño, gestión del estrés o posibles modificaciones en el entrenamiento.
        4.  **Descargo de Responsabilidad:** Incluye un claro descargo de responsabilidad de que este análisis es para fines informativos y no sustituye el consejo médico profesional.
        5.  Devuelve la respuesta como un único objeto JSON que se adhiera estrictamente al esquema proporcionado. No incluyas ningún formato markdown.
    `;

    const analyzedMarkerSchema = {
        type: Type.OBJECT,
        properties: {
            name: { type: Type.STRING },
            value: { type: Type.STRING },
            unit: { type: Type.STRING },
            optimalRange: { type: Type.STRING },
            status: { type: Type.STRING, enum: ["Óptimo", "Límite", "Alto", "Bajo"] },
            interpretation: { type: Type.STRING }
        },
        required: ["name", "value", "unit", "optimalRange", "status", "interpretation"]
    };

    const recommendationsSchema = {
        type: Type.OBJECT,
        properties: {
            nutrition: { type: Type.ARRAY, items: { type: Type.STRING } },
            supplements: { type: Type.ARRAY, items: { type: Type.STRING } },
            lifestyle: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Recomendaciones de estilo de vida y entrenamiento" }
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

    const preferences = params.dietaryPreferences.length > 0 ? `Preferencias dietéticas: ${params.dietaryPreferences.join(', ')}.` : '';
    const allergiesInfo = params.allergies.length > 0 ? `El usuario es alérgico a: ${params.allergies.join(', ')}. Evita estos ingredientes estrictamente.` : '';

    const prompt = `
        Eres un nutricionista deportivo experto. Tu tarea es generar 2-3 recetas deliciosas, saludables y fáciles de hacer basadas en los objetivos de macros y las restricciones dietéticas del usuario.

        Perfil del Usuario:
        - Objetivo de Calorías: ${params.macroGoals.calories} kcal
        - Objetivo de Proteínas: ${params.macroGoals.protein} g
        - Objetivo de Carbohidratos: ${params.macroGoals.carbs} g
        - Objetivo de Grasas: ${params.macroGoals.fats} g
        - ${preferences}
        - ${allergiesInfo}

        Instrucciones:
        1.  Genera 2 o 3 recetas distintas (ej: desayuno, almuerzo, cena).
        2.  Para cada receta, proporciona un nombre, descripción, tipo de comida, tiempos de preparación y cocción, una lista de ingredientes con cantidades, instrucciones paso a paso y macros totales.
        3.  Los macros de cada receta deben ser estimados y contribuir razonablemente a los objetivos diarios del usuario.
        4.  Para cada ingrediente, proporciona su nombre, cantidad, macros estimados (calorías, proteína, carbohidratos, grasas), una categoría (ej: proteína, carbohidrato, vegetal, grasa), y una lista de posibles sustitutos.
        5.  Asegúrate de que las instrucciones sean claras y concisas.
        6.  Devuelve la respuesta como un único array JSON de objetos de receta que se adhiera estrictamente al esquema proporcionado. No incluyas ningún formato markdown.
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