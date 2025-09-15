export type TrainingLevel = 'beginner' | 'intermediate' | 'advanced';
export type TrainingLocation = 'gym' | 'home' | 'outdoor';
export type Equipment = {
  dumbbells: boolean;
  barbell: boolean;
  kettlebells: boolean;
  resistanceBands: boolean;
  pullUpBar: boolean;
  bench: boolean;
  machine: boolean;
};
export type InjuryHistory = {
  hasInjuries: boolean;
  injuries: string;
};
export type TrainingDays = 1 | 2 | 3 | 4 | 5 | 6;

// FIX: Added UserData type based on usage in ProfileScreen.tsx.
export type UserData = {
  name: string;
  age: number;
  weight: number;
  height: number;
  fitnessLevel: TrainingLevel;
  goals: string[];
  trainingDays: TrainingDays;
};

// FIX: Added ProgressData type based on usage in Dashboard.tsx.
export type ProgressData = {
  workoutId: string;
  date: Date;
  notes?: string;
};

export type Exercise = {
  name: string;
  sets: number;
  reps: string; // e.g., "8-12" or "15"
  rest: number; // in seconds
  equipment: string;
  notes?: string;
};

export type DayPlan = {
  day: number;
  focus: string;
  exercises: Exercise[];
};

export type WorkoutPlan = {
  id: string;
  name:string;
  description: string;
  focus: string[];
  days: DayPlan[];
  // FIX: Added optional duration property to fix type errors in components.
  duration?: number;
};

// Types for Recipe Generator
export type MacroGoals = {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
};

export type Ingredient = {
  name: string;
  amount: string;
  macros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
  category: string;
  substitutes: string[];
};

export type Recipe = {
  id: string;
  name: string;
  description: string;
  mealType: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  prepTime: number;
  cookTime: number;
  ingredients: Ingredient[];
  instructions: string[];
  totalMacros: {
    calories: number;
    protein: number;
    carbs: number;
    fats: number;
  };
};

export type ShoppingListItem = {
  ingredient: string;
  amount: string;
  category: string;
  purchased: boolean;
};

// Types for Blood Test Analyzer
export type AnalyzedMarker = {
  name: string;
  value: string;
  unit: string;
  optimalRange: string;
  // FIX: Changed status to Spanish to align with API schema and UI.
  status: 'Óptimo' | 'Límite' | 'Alto' | 'Bajo';
  interpretation: string;
};

export type Recommendations = {
  nutrition: string[];
  supplements: string[];
  lifestyle: string[];
};

export type BloodTestAnalysis = {
  summary: string;
  disclaimer: string;
  analyzedMarkers: AnalyzedMarker[];
  recommendations: Recommendations;
};

// Types for Overload Detection
export type BodyPart = 'hombros' | 'columna' | 'caderas' | 'rodillas' | 'tobillos' | 'cuello' | 'muñecas' | 'lumbar' | 'isquios' | 'gemelos';

export type OverloadData = {
  bodyPart: BodyPart;
  severity: number; // 1-10
  lastIncident?: string;
  frequency: 'ocasional' | 'frecuente' | 'constante';
  type: 'muscular' | 'articular' | 'tendinosa';
};

export type CorrectiveExercise = {
  name: string;
  description: string;
  duration: string;
  equipment: 'ninguno' | 'banda' | 'pelota' | 'rodillo';
  videoUrl?: string;
  targetArea: BodyPart[];
};

// Types for Body Measurement Tracker
export type BodyMeasurement = {
  date: string; // ISO string for date e.g. "2024-05-21"
  weight?: number;
  chest?: number;
  waist?: number;
  hips?: number;
  biceps?: number;
};