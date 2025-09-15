"use client";

import { useState, FormEvent } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Input, Label } from "./ui";
import { Logo } from "./Logo";

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
            alert("¡Las contraseñas no coinciden!");
            return;
        }
        onLoginSuccess();
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
            <Card className="w-full max-w-md">
                <CardHeader className="items-center">
                    <Logo />
                    <CardTitle className="text-center pt-3">
                        {authView === 'login' ? 'Bienvenido de nuevo' : 'Crear cuenta'}
                    </CardTitle>
                    <CardDescription className="text-center">
                        {authView === 'login'
                            ? 'Inicia sesión en tu viaje de fitness'
                            : 'Comienza tu viaje de fitness personalizado'}
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleAuthSubmit} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="email">Correo electrónico</Label>
                            <Input
                                id="email"
                                type="email"
                                placeholder="tu@email.com"
                                value={authForm.email}
                                onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="password">Contraseña</Label>
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
                                <Label htmlFor="confirmPassword">Confirmar contraseña</Label>
                                <Input
                                    id="confirmPassword"
                                    type="password"
                                    value={authForm.confirmPassword}
                                    onChange={(e) => setAuthForm({ ...authForm, confirmPassword: e.target.value })}
                                    required
                                />
                            </div>
                        )}
                        <Button type="submit" className="w-full" variant="default" size="default">
                            {authView === 'login' ? 'Iniciar sesión' : 'Registrarse'}
                        </Button>
                    </form>
                </CardContent>
                <CardFooter className="flex justify-center">
                    <Button
                        variant="link"
                        size="default"
                        onClick={() => setAuthView(authView === 'login' ? 'register' : 'login')}
                    >
                        {authView === 'login'
                            ? "¿No tienes una cuenta? Regístrate"
                            : "¿Ya tienes una cuenta? Inicia sesión"}
                    </Button>
                </CardFooter>
            </Card>
        </div>
    );
}