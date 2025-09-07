"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from "./ui";
import { Dumbbell, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import type { WorkoutPlan } from "../lib/types";

interface PlanDisplayProps {
    plan: WorkoutPlan | null;
    isGenerating: boolean;
    error: string | null;
}

export default function PlanDisplay({ plan, isGenerating, error }: PlanDisplayProps) {
    const [expandedDay, setExpandedDay] = useState<number | null>(1);

    const toggleDayExpansion = (day: number) => {
        setExpandedDay(expandedDay === day ? null : day);
    };
    
    if (isGenerating) {
        return (
            <Card>
                <CardContent className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center space-y-2 text-muted-foreground">
                        <Dumbbell className="mx-auto h-12 w-12 animate-bounce" />
                        <p>Generando tu plan personalizado...</p>
                        <p>Esto puede tardar unos segundos.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }
    
    if (error) {
        return (
            <Card className="border-red-500">
                <CardHeader>
                    <CardTitle className="text-red-600">Error</CardTitle>
                </CardHeader>
                <CardContent className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center space-y-2 text-red-500">
                        <AlertTriangle className="mx-auto h-12 w-12" />
                        <p>{error}</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    if (!plan) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle>Tu Rutina Personalizada</CardTitle>
                    <CardDescription>
                        Completa el formulario y genera una rutina adaptada a tus necesidades.
                    </CardDescription>
                </CardHeader>
                <CardContent className="min-h-[400px] flex items-center justify-center">
                    <div className="text-center space-y-2 text-muted-foreground">
                        <Dumbbell className="mx-auto h-12 w-12" />
                        <p>Configura tus preferencias y objetivos.</p>
                        <p>Haz clic en "Generar Rutina Personalizada".</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card>
            <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="flex flex-wrap gap-2 pt-2">
                    {plan.focus.map(goal => (
                        <Badge key={goal} variant="secondary" className="capitalize">
                            {goal}
                        </Badge>
                    ))}
                    <Badge variant="outline">{plan.days.length} días/semana</Badge>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {plan.days.map(day => (
                    <div key={day.day} className="border rounded-lg">
                        <div
                            className="flex justify-between items-center cursor-pointer p-4"
                            onClick={() => toggleDayExpansion(day.day)}
                            aria-expanded={expandedDay === day.day}
                        >
                            <h3 className="font-semibold text-lg">
                                Día {day.day}: {day.focus}
                            </h3>
                            {expandedDay === day.day ? (
                                <ChevronUp className="h-5 w-5" />
                            ) : (
                                <ChevronDown className="h-5 w-5" />
                            )}
                        </div>

                        {expandedDay === day.day && (
                            <div className="p-4 border-t space-y-4">
                                {day.exercises.map((exercise, idx) => (
                                    <div key={idx} className="border rounded p-3 bg-gray-50/50">
                                        <div className="flex justify-between items-start">
                                            <h4 className="font-medium">{exercise.name}</h4>
                                            <Badge variant="outline" className="text-xs">{exercise.equipment}</Badge>
                                        </div>
                                        <div className="mt-2 grid grid-cols-3 gap-2 text-sm">
                                            <div><span className="font-semibold">Series:</span> {exercise.sets}</div>
                                            <div><span className="font-semibold">Reps:</span> {exercise.reps}</div>
                                            <div><span className="font-semibold">Descanso:</span> {exercise.rest}s</div>
                                        </div>
                                        {exercise.notes && (
                                            <p className="mt-2 text-sm text-yellow-800 bg-yellow-100 p-2 rounded">
                                                <AlertTriangle className="inline h-4 w-4 mr-1" />
                                                Nota: {exercise.notes}
                                            </p>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}