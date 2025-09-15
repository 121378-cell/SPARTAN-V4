

"use client";

import { useState, useRef, useEffect } from "react";
import { generateMultiGoalWorkoutPlanApi } from "../lib/api";
import type { TrainingLevel, TrainingLocation, Equipment, InjuryHistory, TrainingDays, WorkoutPlan } from "../lib/types";
import GeneratorForm from "./GeneratorForm";
import PlanDisplay from "./PlanDisplay";
import { Button } from "./ui";

interface WorkoutGeneratorScreenProps {
    onPlanGenerated: (plan: WorkoutPlan) => void;
    onBack: () => void;
    setIsGenerating: (isGenerating: boolean) => void;
}

export default function WorkoutGeneratorScreen({ onPlanGenerated, onBack, setIsGenerating }: WorkoutGeneratorScreenProps) {
  // State for the form inputs
  const [level, setLevel] = useState<TrainingLevel>('intermediate');
  const [availableDays, setAvailableDays] = useState<TrainingDays>(3);
  const [trainingLocation, setTrainingLocation] = useState<TrainingLocation>('gym');
  const [equipment, setEquipment] = useState<Equipment>({
    dumbbells: true,
    barbell: true,
    kettlebells: false,
    resistanceBands: false,
    pullUpBar: true,
    bench: true,
    machine: true,
  });
  const [injuryHistory, setInjuryHistory] = useState<InjuryHistory>({
    hasInjuries: false,
    injuries: ''
  });
  const [previousProgress, setPreviousProgress] = useState<string>('');
  const [goals, setGoals] = useState<Record<string, boolean>>({
    strength: true,
    hypertrophy: true,
    definition: false,
    mobility: true,
    endurance: false
  });

  // State for the generated plan and loading status
  const [generatedPlan, setGeneratedPlan] = useState<WorkoutPlan | null>(null);
  const [isGeneratingState, setIsGeneratingState] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
    };
  }, []);


  const handleGeneratePlan = async () => {
    setIsGeneratingState(true);
    setIsGenerating(true);
    setFormErrors({});
    setError(null);
    setGeneratedPlan(null);

    const activeGoals = Object.entries(goals)
      .filter(([_, selected]) => selected)
      .map(([goal]) => goal);
    
    const newErrors: Record<string, string> = {};
    if (activeGoals.length === 0) {
        newErrors.goals = "Por favor, selecciona al menos un objetivo de entrenamiento.";
    }
    if (injuryHistory.hasInjuries && !injuryHistory.injuries.trim()) {
        newErrors.injuries = "Por favor, describe tus lesiones para continuar.";
    }

    if (Object.keys(newErrors).length > 0) {
        setFormErrors(newErrors);
        setIsGeneratingState(false);
        setIsGenerating(false);
        return;
    }

    try {
      const planData = await generateMultiGoalWorkoutPlanApi({
        level,
        availableDays,
        trainingLocation,
        equipment,
        injuryHistory,
        previousProgress,
        goals: activeGoals
      });
      if (isMounted.current) {
        const newPlan = { ...planData, id: Date.now().toString() };
        setGeneratedPlan(newPlan);
      }
    } catch (e) {
      console.error("Failed to generate workout plan:", e);
      if (isMounted.current) {
        setError("Ocurrió un error al generar el plan. Por favor, inténtalo de nuevo.");
      }
    } finally {
      if (isMounted.current) {
        setIsGeneratingState(false);
        setIsGenerating(false);
      }
    }
  };

  const handleSavePlan = () => {
      if (generatedPlan) {
          onPlanGenerated(generatedPlan);
      }
  };

  const formProps = {
    level, setLevel,
    availableDays, setAvailableDays,
    trainingLocation, setTrainingLocation,
    equipment, setEquipment,
    injuryHistory, setInjuryHistory,
    previousProgress, setPreviousProgress,
    goals, setGoals,
    isGenerating: isGeneratingState,
    formErrors,
    onGenerate: handleGeneratePlan
  };
  
  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Generador de Rutinas</h1>
            <Button variant="outline" size="default" onClick={onBack}>Volver al Dashboard</Button>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          <div className="md:col-span-1 space-y-6">
            <GeneratorForm {...formProps} />
          </div>
          
          <div className="md:col-span-2 space-y-4">
            <PlanDisplay 
              plan={generatedPlan} 
              isGenerating={isGeneratingState}
              error={error}
            />
            {generatedPlan && !isGeneratingState && (
                <div className="text-right">
                    <Button size="lg" variant="default" onClick={handleSavePlan}>
                        Guardar y Volver al Panel
                    </Button>
                </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
