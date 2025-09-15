"use client";

import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Input, Label } from "./ui";
import { Check } from "lucide-react";
import type { UserData } from '../lib/types';

interface ProfileScreenProps {
    userData: UserData;
    setUserData: (data: UserData) => void;
    onBack: () => void;
}

export default function ProfileScreen({ userData, setUserData, onBack }: ProfileScreenProps) {
    const handleGoalToggle = (goal: string) => {
        const newGoals = userData.goals.includes(goal)
            ? userData.goals.filter(g => g !== goal)
            : [...userData.goals, goal];
        setUserData({ ...userData, goals: newGoals });
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-4xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold">Ajustes del Perfil</h1>
                    <Button variant="outline" size="default" onClick={onBack}>
                        Volver al Panel
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Información Personal</CardTitle>
                        <CardDescription>Actualiza tu perfil de fitness</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Nombre</Label>
                                <Input
                                    id="name"
                                    value={userData.name}
                                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="age">Edad</Label>
                                <Input
                                    id="age"
                                    type="number"
                                    value={userData.age}
                                    onChange={(e) => setUserData({ ...userData, age: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="weight">Peso (kg)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    value={userData.weight}
                                    onChange={(e) => setUserData({ ...userData, weight: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="height">Altura (cm)</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    value={userData.height}
                                    onChange={(e) => setUserData({ ...userData, height: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            <Label>Nivel de Condición Física</Label>
                            <div className="flex flex-wrap gap-2">
                                {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
                                    <Button
                                        key={level}
                                        variant={userData.fitnessLevel === level ? 'default' : 'secondary'}
                                        size="sm"
                                        className="rounded-full"
                                        onClick={() => setUserData({ ...userData, fitnessLevel: level })}
                                    >
                                        {level === 'beginner' ? 'Principiante' : level === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            <Label>Días de Entrenamiento por Semana</Label>
                            <div className="flex flex-wrap gap-2">
                                {([1, 2, 3, 4, 5, 6] as const).map(days => (
                                    <Button
                                        key={days}
                                        variant={userData.trainingDays === days ? 'default' : 'secondary'}
                                        size="sm"
                                        className="rounded-full"
                                        onClick={() => setUserData({ ...userData, trainingDays: days })}
                                    >
                                        {days}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            <Label>Objetivos de Fitness</Label>
                            <div className="flex flex-wrap gap-2">
                                {['Pérdida de Peso', 'Ganancia Muscular', 'Resistencia', 'Flexibilidad', 'Fuerza'].map(goal => (
                                    <Button
                                        key={goal}
                                        variant={userData.goals.includes(goal) ? 'default' : 'secondary'}
                                        size="sm"
                                        className="rounded-full"
                                        onClick={() => handleGoalToggle(goal)}
                                    >
                                        {goal}
                                        {userData.goals.includes(goal) && <Check className="ml-2 h-4 w-4" />}
                                    </Button>
                                ))}
                            </div>
                        </div>
                    </CardContent>
                    <CardFooter className="flex justify-end">
                        <Button variant="default" size="default" onClick={onBack}>
                            Guardar Cambios
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}