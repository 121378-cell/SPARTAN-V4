"use client";

import { useState, FormEvent } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Input, Label } from "./ui";

interface AuthScreenProps {
    onLoginSuccess: () => void;
}

export default function AuthScreen({ onLoginSuccess }: AuthScreenProps) {
    const [authView, setAuthView] = useState<'login' | 'register'>('login');
    const [authForm, setAuthForm] = useState({
        email: '',
        password: '',
        confirmPassword: ''
    });

    const handleAuthSubmit = (e: FormEvent) => {
        e.preventDefault();
        if (authView === 'register' && authForm.password !== authForm.confirmPassword) {
            alert("Passwords don't match!");
            return;
        }
        onLoginSuccess();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader>
                    <CardTitle className="text-center">
                        {authView === 'login' ? 'Welcome Back' : 'Create Account'}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {authView === 'login'
                            ? 'Sign in to your fitness journey'
                            : 'Start your personalized fitness journey'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Email</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="your@email.com"
                                value={authForm.email}
                                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Password</Label>
                            <Input
                                id="password"
                                type="password"
                                value={authForm.password}
                                onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                                required
                            />
                        </div>
                        {authView === 'register' && (
                            <div className="space-y-2">
                                <Label htmlFor="confirmPassword">Confirm Password</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={authForm.confirmPassword}
                                    onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                        )}
                        {/* FIX: Added missing variant and size props to Button component */}
                        <Button type="submit" className="w-full" variant="default" size="default">
                            {authView === 'login' ? 'Sign In' : 'Register'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    {/* FIX: Added missing size prop to Button component */}
                    <Button
                        variant="link"
                        size="default"
                        onClick={() => setAuthView(authView === 'login' ? 'register' : 'login')}
                    >
                        {authView === 'login'
                            ? "Don't have an account? Register"
                            : "Already have an account? Sign In"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}