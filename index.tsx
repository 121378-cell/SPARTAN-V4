"use client";

import { useState } from "react";
import { createRoot } from "react-dom/client";
import type { UserData, WorkoutPlan, ProgressData } from "./lib/types";
import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import ProfileScreen from "./components/ProfileScreen";
import WorkoutDetailScreen from "./components/WorkoutDetailScreen";
import WorkoutGeneratorScreen from "./components/WorkoutGeneratorScreen";
import ExerciseFormChecker from "./components/ExerciseFormChecker";
import RecipeGenerator from "./components/RecipeGenerator";
import CircadianRhythmPlanner from "./components/CircadianRhythmPlanner";
import WearableIntegration from "./components/WearableIntegration";
import BloodTestAnalyzer from "./components/BloodTestAnalyzer";
import OverloadDetection from "./components/OverloadDetection";

// App's main component, acts as a router and state manager
export default function App() {
  type Screen = 'auth' | 'dashboard' | 'generator' | 'profile' | 'workoutDetail' | 'exerciseFormChecker' | 'recipeGenerator' | 'circadianPlanner' | 'wearableIntegration' | 'bloodTestAnalyzer' | 'overloadDetection';
  
  const [currentScreen, setCurrentScreen] = useState<Screen>('auth');
  
  // Mock user data
  const [userData, setUserData] = useState<UserData>({
    name: 'Usuario Spartan',
    age: 30,
    weight: 75,
    height: 180,
    fitnessLevel: 'intermediate',
    goals: ['Ganancia Muscular', 'Fuerza'],
  });

  const [workoutPlans, setWorkoutPlans] = useState<WorkoutPlan[]>([]);
  const [progressData, setProgressData] = useState<ProgressData[]>([]);
  const [selectedWorkout, setSelectedWorkout] = useState<WorkoutPlan | null>(null);
  const [exerciseToCheck, setExerciseToCheck] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  const handleLoginSuccess = () => setCurrentScreen('dashboard');
  
  const handleGenerateWorkout = () => setCurrentScreen('generator');
  
  const handleProfileClick = () => setCurrentScreen('profile');
  
  const handleSelectWorkout = (plan: WorkoutPlan) => {
    setSelectedWorkout(plan);
    setCurrentScreen('workoutDetail');
  };
  
  const handleBackToDashboard = () => setCurrentScreen('dashboard');

  const handleBackToDashboardFromDetail = () => {
    setSelectedWorkout(null);
    setCurrentScreen('dashboard');
  };

  const handleCheckForm = (exerciseName: string) => {
    setExerciseToCheck(exerciseName);
    setCurrentScreen('exerciseFormChecker');
  };

  const handleBackToDetail = () => {
    setExerciseToCheck(null);
    setCurrentScreen('workoutDetail');
  };

  const handlePlanGenerated = (plan: WorkoutPlan) => {
    setWorkoutPlans([plan, ...workoutPlans]);
    setCurrentScreen('dashboard');
  };

  const handleWorkoutComplete = () => {
    if (selectedWorkout) {
      setProgressData([
        ...progressData,
        {
          workoutId: selectedWorkout.id,
          date: new Date(),
        },
      ]);
      setSelectedWorkout(null);
      setCurrentScreen('dashboard');
    }
  };

  const handleNavigateToRecipes = () => setCurrentScreen('recipeGenerator');
  const handleNavigateToCircadian = () => setCurrentScreen('circadianPlanner');
  const handleNavigateToWearable = () => setCurrentScreen('wearableIntegration');
  const handleNavigateToBloodTestAnalyzer = () => setCurrentScreen('bloodTestAnalyzer');
  const handleNavigateToOverloadDetection = () => setCurrentScreen('overloadDetection');


  const renderScreen = () => {
    switch (currentScreen) {
      case 'auth':
        return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
      
      case 'dashboard':
        return <Dashboard 
                  userData={userData}
                  workoutPlans={workoutPlans}
                  progressData={progressData}
                  onGenerateWorkout={handleGenerateWorkout}
                  isGeneratingWorkout={isGenerating}
                  onSelectWorkout={handleSelectWorkout}
                  onProfileClick={handleProfileClick}
                  onNavigateToRecipes={handleNavigateToRecipes}
                  onNavigateToCircadian={handleNavigateToCircadian}
                  onNavigateToWearable={handleNavigateToWearable}
                  onNavigateToBloodTestAnalyzer={handleNavigateToBloodTestAnalyzer}
                  onNavigateToOverloadDetection={handleNavigateToOverloadDetection}
                />;
      
      case 'generator':
        return <WorkoutGeneratorScreen 
                  onPlanGenerated={handlePlanGenerated}
                  onBack={handleBackToDashboard}
                  setIsGenerating={setIsGenerating}
               />;
      
      case 'profile':
        return <ProfileScreen 
                  userData={userData}
                  setUserData={setUserData}
                  onBack={handleBackToDashboard}
                />;
      
      case 'workoutDetail':
        if (!selectedWorkout) {
            // A prueba de fallos, no debería ocurrir en el flujo normal
            setCurrentScreen('dashboard');
            return null;
        }
        return <WorkoutDetailScreen 
                  workoutPlan={selectedWorkout}
                  onBack={handleBackToDashboardFromDetail}
                  onComplete={handleWorkoutComplete}
                  onCheckForm={handleCheckForm}
                />;

      case 'exerciseFormChecker':
        return <ExerciseFormChecker
                  exerciseName={exerciseToCheck}
                  onBack={handleBackToDetail}
                />;
      
      case 'recipeGenerator':
        return <RecipeGenerator onBack={handleBackToDashboard} />;

      case 'circadianPlanner':
        return <CircadianRhythmPlanner onBack={handleBackToDashboard} />;

      case 'wearableIntegration':
        return <WearableIntegration onBack={handleBackToDashboard} />;

      case 'bloodTestAnalyzer':
        return <BloodTestAnalyzer onBack={handleBackToDashboard} />;
      
      case 'overloadDetection':
        return <OverloadDetection onBack={handleBackToDashboard} />;

      default:
        return <AuthScreen onLoginSuccess={handleLoginSuccess} />;
    }
  };

  return <div className="app-container">{renderScreen()}</div>;
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}