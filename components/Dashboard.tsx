"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from "./ui";
import { Calendar, Clock, Heart, User, Settings, Plus, Utensils, Zap, Droplets, StretchHorizontal } from "lucide-react";
import type { UserData, WorkoutPlan, ProgressData } from '../lib/types';

interface DashboardProps {
    userData: UserData;
    workoutPlans: WorkoutPlan[];
    progressData: ProgressData[];
    onGenerateWorkout: () => void;
    isGeneratingWorkout: boolean;
    onSelectWorkout: (plan: WorkoutPlan) => void;
    onProfileClick: () => void;
    onNavigateToRecipes: () => void;
    onNavigateToCircadian: () => void;
    onNavigateToWearable: () => void;
    onNavigateToBloodTestAnalyzer: () => void;
    onNavigateToOverloadDetection: () => void;
}

export default function Dashboard({
    userData,
    workoutPlans,
    progressData,
    onGenerateWorkout,
    isGeneratingWorkout,
    onSelectWorkout,
    onProfileClick,
    onNavigateToRecipes,
    onNavigateToCircadian,
    onNavigateToWearable,
    onNavigateToBloodTestAnalyzer,
    onNavigateToOverloadDetection,
}: DashboardProps) {
    const [activeTab, setActiveTab] = useState<'dashboard' | 'workouts' | 'progress'>('dashboard');

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white shadow-sm">
                <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
                    <h1 className="text-xl font-bold text-primary">Entrenador Fitness IA</h1>
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={onProfileClick}>
                            <User className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 py-8">
                <div className="flex border-b mb-8">
                    <Button
                        variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'}
                        size="default"
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Panel
                    </Button>
                    <Button
                        variant={activeTab === 'workouts' ? 'secondary' : 'ghost'}
                        size="default"
                        onClick={() => setActiveTab('workouts')}
                    >
                        Entrenamientos
                    </Button>
                    <Button
                        variant={activeTab === 'progress' ? 'secondary' : 'ghost'}
                        size="default"
                        onClick={() => setActiveTab('progress')}
                    >
                        Progreso
                    </Button>
                </div>

                {activeTab === 'dashboard' && (
                    <div className="space-y-8">
                        <div className="grid gap-6 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Entrenamientos Completados</CardTitle>
                                    <Heart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{progressData.length}</div>
                                    <p className="text-xs text-muted-foreground">¡Sigue con el buen trabajo!</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Último Plan de Entrenamiento</CardTitle>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold truncate">
                                        {workoutPlans.length > 0 ? workoutPlans[0].name : 'Ninguno'}
                                    </div>
                                    <p className="text-xs text-muted-foreground">
                                        {workoutPlans.length > 0 ? (workoutPlans[0].duration ? `${workoutPlans[0].duration} min` : '') : 'Genera un plan'}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Nivel de Condición Física</CardTitle>
                                    <User className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold capitalize">{userData.fitnessLevel === 'beginner' ? 'Principiante' : userData.fitnessLevel === 'intermediate' ? 'Intermedio' : 'Avanzado'}</div>
                                    <p className="text-xs text-muted-foreground truncate">{userData.goals.join(', ')}</p>
                                </CardContent>
                            </Card>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>¿Listo para un nuevo reto?</CardTitle>
                                <CardDescription>Genera un nuevo plan de entrenamiento personalizado con IA basado en tu perfil actual.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                <Button onClick={onGenerateWorkout} disabled={isGeneratingWorkout} size="lg" variant="default">
                                    {isGeneratingWorkout ? 'Generando...' : 'Generar Nuevo Plan de Entrenamiento'}
                                </Button>
                            </CardContent>
                        </Card>
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Utensils className="h-5 w-5" />
                                        Planifica tu Nutrición
                                    </CardTitle>
                                    <CardDescription>Genera planes de comidas y recetas inteligentes según tus objetivos de macros.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button onClick={onNavigateToRecipes} size="default" variant="default">
                                        Ir al Generador de Recetas
                                    </Button>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Optimizador de Ritmo Circadiano
                                    </CardTitle>
                                    <CardDescription>Sincroniza tu estilo de vida con tu reloj biológico para un rendimiento óptimo.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button onClick={onNavigateToCircadian} size="default" variant="default">
                                        Optimizar mi Ritmo
                                    </Button>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5" />
                                        Integración con Wearables
                                    </CardTitle>
                                    <CardDescription>Conecta tus dispositivos para obtener información detallada sobre tu salud.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button onClick={onNavigateToWearable} size="default" variant="default">
                                        Conectar y Analizar
                                    </Button>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Droplets className="h-5 w-5" />
                                        Analizador de Análisis de Sangre
                                    </CardTitle>
                                    <CardDescription>Obtén información de tus análisis de sangre con IA para un rendimiento máximo.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button onClick={onNavigateToBloodTestAnalyzer} size="default" variant="default">
                                        Analizar mis Resultados
                                    </Button>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <StretchHorizontal className="h-5 w-5" />
                                        Detección de Sobrecarga
                                    </CardTitle>
                                    <CardDescription>Identifica la tensión muscular y obtén recomendaciones de ejercicios correctivos.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button onClick={onNavigateToOverloadDetection} size="default" variant="default">
                                        Analizar Ahora
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'workouts' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Tus Planes de Entrenamiento</h2>
                            <Button onClick={onGenerateWorkout} disabled={isGeneratingWorkout} variant="default" size="default">
                                <Plus className="mr-2 h-4 w-4" />
                                {isGeneratingWorkout ? 'Generando...' : 'Nuevo Plan'}
                            </Button>
                        </div>
                        {workoutPlans.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <p className="text-muted-foreground">Aún no hay planes de entrenamiento. ¡Genera tu primer plan con IA!</p>
                                    <Button className="mt-4" onClick={onGenerateWorkout} disabled={isGeneratingWorkout} variant="default" size="default">
                                        {isGeneratingWorkout ? 'Generando...' : 'Generar Plan de Entrenamiento'}
                                    </Button>
                                </CardContent>
                            </Card>
                        ) : (
                            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                                {workoutPlans.map(plan => (
                                    <Card
                                        key={plan.id}
                                        className="cursor-pointer hover:shadow-lg transition-shadow"
                                        onClick={() => onSelectWorkout(plan)}
                                    >
                                        <CardHeader>
                                            <CardTitle className="truncate">{plan.name}</CardTitle>
                                            <CardDescription className="line-clamp-2 h-10">{plan.description}</CardDescription>
                                        </CardHeader>
                                        <CardContent>
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                                <Clock className="h-4 w-4" />
                                                {plan.duration && <span>{plan.duration} minutos</span>}
                                            </div>
                                        </CardContent>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === 'progress' && (
                    <div className="space-y-4">
                        <h2 className="text-xl font-bold">Tu Progreso</h2>
                        {progressData.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <p className="text-muted-foreground">Aún no hay datos de progreso. ¡Completa un entrenamiento para seguir tu progreso!</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Historial de Entrenamientos</CardTitle>
                                    <CardDescription>Tus sesiones de entrenamiento completadas, ordenadas por las más recientes.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {progressData.map((progress, index) => {
                                            const workout = workoutPlans.find(w => w.id === progress.workoutId);
                                            return (
                                                <div key={index} className="border rounded-lg p-4 flex justify-between items-center">
                                                    <div>
                                                        <h3 className="font-semibold">{workout?.name || 'Entrenamiento Desconocido'}</h3>
                                                        <p className="text-sm text-muted-foreground">{progress.date.toLocaleDateString()}</p>
                                                        {progress.notes && (
                                                            <p className="mt-2 text-sm text-muted-foreground">Notas: {progress.notes}</p>
                                                        )}
                                                    </div>
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                                        Completado
                                                    </Badge>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </CardContent>
                            </Card>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}