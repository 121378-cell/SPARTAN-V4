"use client";

import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "./ui";
import { Clock, Activity } from "lucide-react";
import type { WorkoutPlan } from '../lib/types';

interface WorkoutDetailScreenProps {
    workoutPlan: WorkoutPlan;
    onBack: () => void;
    onComplete: () => void;
    onCheckForm: (exerciseName: string) => void;
}

export default function WorkoutDetailScreen({ workoutPlan, onBack, onComplete, onCheckForm }: WorkoutDetailScreenProps) {
    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold">{workoutPlan.name}</h1>
                    <Button variant="outline" size="default" onClick={onBack}>
                        Volver a Entrenamientos
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <div className="flex justify-between items-center">
                            <div>
                                <CardTitle>Detalles del Entrenamiento</CardTitle>
                                <CardDescription>{workoutPlan.description}</CardDescription>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                <Clock className="h-4 w-4" />
                                {workoutPlan.duration && <span>{workoutPlan.duration} minutos</span>}
                            </div>
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {workoutPlan.days.map((day, dayIndex) => (
                                <div key={dayIndex} className="border rounded-lg p-4">
                                    <h3 className="font-semibold text-lg mb-2">Día {day.day}: {day.focus}</h3>
                                    <div className="space-y-2">
                                        {day.exercises.map((exercise, index) => (
                                            <div key={index} className="border rounded-lg p-4 bg-gray-50">
                                                <div className="flex justify-between items-center">
                                                    <h3 className="font-semibold">{exercise.name}</h3>
                                                    <Button variant="outline" size="sm" onClick={() => onCheckForm(exercise.name)}>
                                                        <Activity className="h-4 w-4 mr-2" />
                                                        Verificar Técnica
                                                    </Button>
                                                </div>
                                                <div className="mt-2 text-sm text-muted-foreground">
                                                    <span>{exercise.sets} series × {exercise.reps ? `${exercise.reps} reps` : ''}</span>
                                                    <span className="mx-2">|</span>
                                                    <span>Descanso: {exercise.rest} segundos entre series</span>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end gap-2">
                        <Button variant="outline" size="default">Editar Plan</Button>
                        <Button variant="default" size="default" onClick={onComplete}>Marcar como Completado</Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}