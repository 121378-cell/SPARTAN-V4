
"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label } from "./ui";
import { Trash2, Plus } from "lucide-react";
import type { WorkoutPlan, DayPlan, Exercise } from '../lib/types';

interface WorkoutEditorScreenProps {
    initialPlan: WorkoutPlan;
    onSave: (updatedPlan: WorkoutPlan) => void;
    onBack: () => void;
}

export default function WorkoutEditorScreen({ initialPlan, onSave, onBack }: WorkoutEditorScreenProps) {
    const [plan, setPlan] = useState<WorkoutPlan>(initialPlan);
    const [errors, setErrors] = useState<Record<string, string>>({});

    const handlePlanChange = (field: 'name' | 'description', value: string) => {
        setPlan(prev => ({ ...prev, [field]: value }));
    };

    const handleDayChange = (dayIndex: number, field: 'focus', value: string) => {
        const newDays = [...plan.days];
        newDays[dayIndex] = { ...newDays[dayIndex], [field]: value };
        setPlan(prev => ({ ...prev, days: newDays }));
    };

    const handleExerciseChange = (dayIndex: number, exIndex: number, field: keyof Exercise, value: string | number) => {
        const newDays = [...plan.days];
        const newExercises = [...newDays[dayIndex].exercises];
        newExercises[exIndex] = { ...newExercises[exIndex], [field]: value };
        newDays[dayIndex].exercises = newExercises;
        setPlan(prev => ({ ...prev, days: newDays }));
    };
    
    const addExercise = (dayIndex: number) => {
        const newExercise: Exercise = { name: "Nuevo Ejercicio", sets: 3, reps: "10", rest: 60, equipment: "Ninguno" };
        const newDays = [...plan.days];
        newDays[dayIndex].exercises.push(newExercise);
        setPlan(prev => ({ ...prev, days: newDays }));
    };

    const removeExercise = (dayIndex: number, exIndex: number) => {
        const newDays = [...plan.days];
        newDays[dayIndex].exercises.splice(exIndex, 1);
        setPlan(prev => ({ ...prev, days: newDays }));
    };
    
    const handleSaveChanges = () => {
        const newErrors: Record<string, string> = {};
        plan.days.forEach((day, dayIndex) => {
            day.exercises.forEach((ex, exIndex) => {
                const keyPrefix = `${dayIndex}-${exIndex}`;
                if (!ex.name.trim()) newErrors[`${keyPrefix}-name`] = "El nombre no puede estar vacío.";
                if (ex.sets <= 0 || !Number.isInteger(ex.sets)) newErrors[`${keyPrefix}-sets`] = "Debe ser un número entero positivo.";
                if (!ex.reps.trim()) newErrors[`${keyPrefix}-reps`] = "Las repeticiones no pueden estar vacías.";
                if (ex.rest <= 0 || !Number.isInteger(ex.rest)) newErrors[`${keyPrefix}-rest`] = "Debe ser un número entero positivo.";
            });
        });

        setErrors(newErrors);

        if (Object.keys(newErrors).length === 0) {
            onSave(plan);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold">Editar Plan de Entrenamiento</h1>
                    <div>
                        <Button variant="outline" size="default" onClick={onBack} className="mr-2">
                            Cancelar
                        </Button>
                        <Button variant="default" size="default" onClick={handleSaveChanges}>
                            Guardar Cambios
                        </Button>
                    </div>
                </div>

                <Card>
                    <CardHeader>
                        <div className="space-y-2">
                            <Label htmlFor="planName">Nombre del Plan</Label>
                            <Input
                                id="planName"
                                value={plan.name}
                                onChange={(e) => handlePlanChange('name', e.target.value)}
                                className="text-lg font-semibold"
                            />
                        </div>
                        <div className="space-y-2 mt-2">
                            <Label htmlFor="planDescription">Descripción del Plan</Label>
                            <Input
                                id="planDescription"
                                value={plan.description}
                                onChange={(e) => handlePlanChange('description', e.target.value)}
                            />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {plan.days.map((day, dayIndex) => (
                                <div key={dayIndex} className="border rounded-lg p-4">
                                    <div className="space-y-2 mb-4">
                                        <Label htmlFor={`dayFocus-${dayIndex}`}>Enfoque del Día {day.day}</Label>
                                        <Input
                                            id={`dayFocus-${dayIndex}`}
                                            value={day.focus}
                                            onChange={(e) => handleDayChange(dayIndex, 'focus', e.target.value)}
                                            className="font-semibold text-lg"
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        {day.exercises.map((exercise, exIndex) => (
                                            <div key={exIndex} className="border rounded-lg p-4 bg-gray-50 relative">
                                                <Button variant="destructive" size="icon" className="absolute top-2 right-2 h-7 w-7" onClick={() => removeExercise(dayIndex, exIndex)}>
                                                    <Trash2 className="h-4 w-4" />
                                                </Button>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="space-y-2 col-span-2">
                                                        <Label htmlFor={`exName-${dayIndex}-${exIndex}`}>Nombre del Ejercicio</Label>
                                                        <Input id={`exName-${dayIndex}-${exIndex}`} value={exercise.name} onChange={(e) => handleExerciseChange(dayIndex, exIndex, 'name', e.target.value)} className={errors[`${dayIndex}-${exIndex}-name`] ? 'border-red-500' : ''} />
                                                        {errors[`${dayIndex}-${exIndex}-name`] && <p className="text-sm text-red-600">{errors[`${dayIndex}-${exIndex}-name`]}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`exSets-${dayIndex}-${exIndex}`}>Series</Label>
                                                        <Input id={`exSets-${dayIndex}-${exIndex}`} type="number" value={exercise.sets} onChange={(e) => handleExerciseChange(dayIndex, exIndex, 'sets', parseInt(e.target.value) || 0)} className={errors[`${dayIndex}-${exIndex}-sets`] ? 'border-red-500' : ''} />
                                                        {errors[`${dayIndex}-${exIndex}-sets`] && <p className="text-sm text-red-600">{errors[`${dayIndex}-${exIndex}-sets`]}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`exReps-${dayIndex}-${exIndex}`}>Repeticiones</Label>
                                                        <Input id={`exReps-${dayIndex}-${exIndex}`} value={exercise.reps} onChange={(e) => handleExerciseChange(dayIndex, exIndex, 'reps', e.target.value)} className={errors[`${dayIndex}-${exIndex}-reps`] ? 'border-red-500' : ''} />
                                                        {errors[`${dayIndex}-${exIndex}-reps`] && <p className="text-sm text-red-600">{errors[`${dayIndex}-${exIndex}-reps`]}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`exRest-${dayIndex}-${exIndex}`}>Descanso (s)</Label>
                                                        <Input id={`exRest-${dayIndex}-${exIndex}`} type="number" value={exercise.rest} onChange={(e) => handleExerciseChange(dayIndex, exIndex, 'rest', parseInt(e.target.value) || 0)} className={errors[`${dayIndex}-${exIndex}-rest`] ? 'border-red-500' : ''} />
                                                        {errors[`${dayIndex}-${exIndex}-rest`] && <p className="text-sm text-red-600">{errors[`${dayIndex}-${exIndex}-rest`]}</p>}
                                                    </div>
                                                    <div className="space-y-2">
                                                        <Label htmlFor={`exEquip-${dayIndex}-${exIndex}`}>Equipamiento</Label>
                                                        <Input id={`exEquip-${dayIndex}-${exIndex}`} value={exercise.equipment} onChange={(e) => handleExerciseChange(dayIndex, exIndex, 'equipment', e.target.value)} />
                                                    </div>
                                                    <div className="space-y-2 col-span-2">
                                                        <Label htmlFor={`exNotes-${dayIndex}-${exIndex}`}>Notas (Opcional)</Label>
                                                        <Input 
                                                            id={`exNotes-${dayIndex}-${exIndex}`} 
                                                            value={exercise.notes || ''} 
                                                            onChange={(e) => handleExerciseChange(dayIndex, exIndex, 'notes', e.target.value)}
                                                            placeholder="Ej: Enfocarse en la fase excéntrica"
                                                        />
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                    <Button variant="outline" size="sm" className="mt-4" onClick={() => addExercise(dayIndex)}>
                                        <Plus className="h-4 w-4 mr-2" />
                                        Añadir Ejercicio
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
