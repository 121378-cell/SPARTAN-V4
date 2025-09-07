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
                    <h1 className="text-xl font-bold text-primary">AI Fitness Coach</h1>
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
                    {/* FIX: Added missing size prop to Button component */}
                    <Button
                        variant={activeTab === 'dashboard' ? 'secondary' : 'ghost'}
                        size="default"
                        onClick={() => setActiveTab('dashboard')}
                    >
                        Dashboard
                    </Button>
                    {/* FIX: Added missing size prop to Button component */}
                    <Button
                        variant={activeTab === 'workouts' ? 'secondary' : 'ghost'}
                        size="default"
                        onClick={() => setActiveTab('workouts')}
                    >
                        Workouts
                    </Button>
                    {/* FIX: Added missing size prop to Button component */}
                    <Button
                        variant={activeTab === 'progress' ? 'secondary' : 'ghost'}
                        size="default"
                        onClick={() => setActiveTab('progress')}
                    >
                        Progress
                    </Button>
                </div>

                {activeTab === 'dashboard' && (
                    <div className="space-y-8">
                        <div className="grid gap-6 md:grid-cols-3">
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Workouts Completed</CardTitle>
                                    <Heart className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{progressData.length}</div>
                                    <p className="text-xs text-muted-foreground">Keep up the great work!</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Latest Workout Plan</CardTitle>
                                    <Calendar className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold truncate">
                                        {workoutPlans.length > 0 ? workoutPlans[0].name : 'None'}
                                    </div>
                                    {/* FIX: Property 'duration' does not exist on type 'WorkoutPlan'. Check if it exists. */}
                                    <p className="text-xs text-muted-foreground">
                                        {workoutPlans.length > 0 ? (workoutPlans[0].duration ? `${workoutPlans[0].duration} min` : '') : 'Generate a plan'}
                                    </p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                                    <CardTitle className="text-sm font-medium">Fitness Level</CardTitle>
                                    <User className="h-4 w-4 text-muted-foreground" />
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold capitalize">{userData.fitnessLevel}</div>
                                    <p className="text-xs text-muted-foreground truncate">{userData.goals.join(', ')}</p>
                                </CardContent>
                            </Card>
                        </div>
                        <Card>
                            <CardHeader>
                                <CardTitle>Ready for a New Challenge?</CardTitle>
                                <CardDescription>Generate a new personalized AI workout plan based on your current profile.</CardDescription>
                            </CardHeader>
                            <CardContent>
                                {/* FIX: Added missing variant prop to Button component */}
                                <Button onClick={onGenerateWorkout} disabled={isGeneratingWorkout} size="lg" variant="default">
                                    {isGeneratingWorkout ? 'Generating...' : 'Generate New Workout Plan'}
                                </Button>
                            </CardContent>
                        </Card>
                        <div className="grid md:grid-cols-2 gap-6">
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Utensils className="h-5 w-5" />
                                        Plan Your Nutrition
                                    </CardTitle>
                                    <CardDescription>Generate intelligent meal plans and recipes based on your macro goals.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button onClick={onNavigateToRecipes} size="default" variant="default">
                                        Go to Recipe Generator
                                    </Button>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Clock className="h-5 w-5" />
                                        Circadian Rhythm Optimizer
                                    </CardTitle>
                                    <CardDescription>Sync your lifestyle with your biological clock for peak performance.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button onClick={onNavigateToCircadian} size="default" variant="default">
                                        Optimize My Rhythm
                                    </Button>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Zap className="h-5 w-5" />
                                        Wearable Integration
                                    </CardTitle>
                                    <CardDescription>Connect your devices to get deep insights into your health.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button onClick={onNavigateToWearable} size="default" variant="default">
                                        Connect & Analyze
                                    </Button>
                                </CardContent>
                            </Card>
                             <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <Droplets className="h-5 w-5" />
                                        Blood Test Analyzer
                                    </CardTitle>
                                    <CardDescription>Get AI-powered insights from your blood test results for peak performance.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button onClick={onNavigateToBloodTestAnalyzer} size="default" variant="default">
                                        Analyze My Results
                                    </Button>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <StretchHorizontal className="h-5 w-5" />
                                        Overload Detection
                                    </CardTitle>
                                    <CardDescription>Identify muscle tension and get corrective exercise recommendations.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <Button onClick={onNavigateToOverloadDetection} size="default" variant="default">
                                        Analyze Now
                                    </Button>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                )}

                {activeTab === 'workouts' && (
                    <div className="space-y-4">
                        <div className="flex justify-between items-center">
                            <h2 className="text-xl font-bold">Your Workout Plans</h2>
                            {/* FIX: Added missing variant and size props to Button component */}
                            <Button onClick={onGenerateWorkout} disabled={isGeneratingWorkout} variant="default" size="default">
                                <Plus className="mr-2 h-4 w-4" />
                                {isGeneratingWorkout ? 'Generating...' : 'New Plan'}
                            </Button>
                        </div>
                        {workoutPlans.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <p className="text-muted-foreground">No workout plans yet. Generate your first AI-powered plan!</p>
                                    {/* FIX: Added missing variant and size props to Button component */}
                                    <Button className="mt-4" onClick={onGenerateWorkout} disabled={isGeneratingWorkout} variant="default" size="default">
                                        {isGeneratingWorkout ? 'Generating...' : 'Generate Workout Plan'}
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
                                                {/* FIX: Property 'duration' does not exist on type 'WorkoutPlan'. Check if it exists. */}
                                                {plan.duration && <span>{plan.duration} minutes</span>}
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
                        <h2 className="text-xl font-bold">Your Progress</h2>
                        {progressData.length === 0 ? (
                            <Card>
                                <CardContent className="py-12 text-center">
                                    <p className="text-muted-foreground">No progress data yet. Complete a workout to track your progress!</p>
                                </CardContent>
                            </Card>
                        ) : (
                            <Card>
                                <CardHeader>
                                    <CardTitle>Workout History</CardTitle>
                                    <CardDescription>Your completed workout sessions, sorted by most recent.</CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className="space-y-4">
                                        {progressData.map((progress, index) => {
                                            const workout = workoutPlans.find(w => w.id === progress.workoutId);
                                            return (
                                                <div key={index} className="border rounded-lg p-4 flex justify-between items-center">
                                                    <div>
                                                        <h3 className="font-semibold">{workout?.name || 'Unknown Workout'}</h3>
                                                        <p className="text-sm text-muted-foreground">{progress.date.toLocaleDateString()}</p>
                                                        {progress.notes && (
                                                            <p className="mt-2 text-sm text-muted-foreground">Notes: {progress.notes}</p>
                                                        )}
                                                    </div>
                                                    <Badge variant="secondary" className="bg-green-100 text-green-800 border-green-200">
                                                        Completed
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