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
                    <h1 className="text-2xl font-bold">Profile Settings</h1>
                    {/* FIX: Added missing size prop to Button component */}
                    <Button variant="outline" size="default" onClick={onBack}>
                        Back to Dashboard
                    </Button>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Personal Information</CardTitle>
                        <CardDescription>Update your fitness profile</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="space-y-2">
                                <Label htmlFor="name">Name</Label>
                                <Input
                                    id="name"
                                    value={userData.name}
                                    onChange={(e) => setUserData({ ...userData, name: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="age">Age</Label>
                                <Input
                                    id="age"
                                    type="number"
                                    value={userData.age}
                                    onChange={(e) => setUserData({ ...userData, age: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="weight">Weight (kg)</Label>
                                <Input
                                    id="weight"
                                    type="number"
                                    value={userData.weight}
                                    onChange={(e) => setUserData({ ...userData, weight: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="height">Height (cm)</Label>
                                <Input
                                    id="height"
                                    type="number"
                                    value={userData.height}
                                    onChange={(e) => setUserData({ ...userData, height: parseInt(e.target.value) || 0 })}
                                />
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            <Label>Fitness Level</Label>
                            <div className="flex gap-4">
                                {(['beginner', 'intermediate', 'advanced'] as const).map(level => (
                                    // FIX: Added missing size prop to Button component
                                    <Button
                                        key={level}
                                        variant={userData.fitnessLevel === level ? 'default' : 'outline'}
                                        size="default"
                                        onClick={() => setUserData({ ...userData, fitnessLevel: level })}
                                    >
                                        {level.charAt(0).toUpperCase() + level.slice(1)}
                                    </Button>
                                ))}
                            </div>
                        </div>

                        <div className="mt-4 space-y-2">
                            <Label>Fitness Goals</Label>
                            <div className="flex flex-wrap gap-2">
                                {['Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility', 'Strength'].map(goal => (
                                    <Button
                                        key={goal}
                                        variant={userData.goals.includes(goal) ? 'default' : 'outline'}
                                        size="sm"
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
                        {/* FIX: Added missing variant and size props to Button component */}
                        <Button variant="default" size="default" onClick={onBack}>
                            Save Changes
                        </Button>
                    </CardFooter>
                </Card>
            </div>
        </div>
    );
}