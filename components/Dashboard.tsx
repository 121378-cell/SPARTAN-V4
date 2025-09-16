"use client";

import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Badge } from "./ui";
import { User, Settings, Plus, Utensils, Clock, Zap, Droplets, StretchHorizontal, Heart, ClipboardList, BarChart, CheckCircle, ArrowRight, Ruler, Flame } from "lucide-react";
import type { WorkoutPlan } from '../lib/types';
import { useAppStore } from "../lib/stores";
import { Logo } from "./Logo";

interface DashboardProps {}

const StatCard = ({ icon, title, value, subtitle }: { icon: React.ReactNode, title: string, value: string, subtitle?: string }) => (
    <Card>
        <CardHeader className="p-4">
            <div className="flex items-center gap-3">
                <div className="bg-secondary p-2 rounded-lg">
                    {icon}
                </div>
                <div>
                    <CardDescription>{title}</CardDescription>
                    <CardTitle className="text-xl">{value}</CardTitle>
                </div>
            </div>
            {subtitle && <p className="text-xs text-muted-foreground pt-2">{subtitle}</p>}
        </CardHeader>
    </Card>
);

const ToolCard = ({ icon, title, description, onClick }: { icon: React.ReactNode, title: string, description: string, onClick: () => void }) => (
    <Card 
        className="cursor-pointer hover:border-primary transition-colors group"
        onClick={onClick}
    >
        <CardHeader>
            <div className="flex justify-between items-start">
                <div className="bg-secondary p-3 rounded-lg text-primary">
                    {icon}
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
            </div>
            <CardTitle className="pt-4">{title}</CardTitle>
            <CardDescription>{description}</CardDescription>
        </CardHeader>
    </Card>
);

export default function Dashboard(props: DashboardProps) {
    const navigate = useNavigate();
    const { userData, workoutPlans, progressData, isGenerating: isGeneratingWorkout } = useAppStore();
    
    const nextWorkout = workoutPlans.length > 0 ? workoutPlans[0] : null;

    const tools = [
        { icon: <Utensils className="h-6 w-6" />, title: "Planifica tu Nutrición", description: "Genera recetas inteligentes según tus objetivos de macros.", onClick: () => navigate('/recipes') },
        { icon: <Clock className="h-6 w-6" />, title: "Optimizador Circadiano", description: "Sincroniza tu estilo de vida con tu reloj biológico.", onClick: () => navigate('/circadian') },
        { icon: <Zap className="h-6 w-6" />, title: "Integración con Wearables", description: "Conecta tus dispositivos para obtener información detallada.", onClick: () => navigate('/wearable') },
        { icon: <Droplets className="h-6 w-6" />, title: "Análisis de Sangre", description: "Obtén información de tus análisis con IA.", onClick: () => navigate('/blood-test') },
        { icon: <StretchHorizontal className="h-6 w-6" />, title: "Detección de Sobrecarga", description: "Identifica la tensión y obtén ejercicios correctivos.", onClick: () => navigate('/overload') },
        { icon: <Ruler className="h-6 w-6" />, title: "Medidas Corporales", description: "Realiza un seguimiento de tu progreso físico con mediciones detalladas.", onClick: () => navigate('/measurements') },
    ];

    return (
        <div className="min-h-screen bg-gray-50">
            <header className="bg-white sticky top-0 z-10 shadow-sm">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
                    <div className="flex items-center gap-4">
                        <Logo showText={false} />
                        <div>
                            <h1 className="text-2xl font-bold text-primary">Spartan V4</h1>
                            <p className="text-muted-foreground">¡Hola, {userData.name.split(' ')[0]}!</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2">
                        <Button variant="ghost" size="icon" onClick={() => navigate('/profile')}>
                            <User className="h-5 w-5" />
                        </Button>
                        <Button variant="ghost" size="icon">
                            <Settings className="h-5 w-5" />
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
                
                {/* Next Workout or CTA */}
                <Card className="bg-primary text-primary-foreground">
                    <CardContent className="p-6">
                        {nextWorkout ? (
                            <>
                                <CardDescription className="text-primary-foreground/80">Siguiente Entrenamiento</CardDescription>
                                <CardTitle className="text-2xl mt-1">{nextWorkout.name}</CardTitle>
                                <p className="mt-2 text-sm text-primary-foreground/80 line-clamp-2">{nextWorkout.description}</p>
                                <div className="flex items-center gap-2 mt-4">
                                    <Button variant="secondary" size="lg" onClick={() => navigate(`/workout/${nextWorkout.id}`)}>
                                        Comenzar Entrenamiento
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        size="lg"
                                        className="text-primary-foreground hover:bg-white/20"
                                        onClick={() => alert('Iniciando calentamiento dinámico de 5-10 minutos...')}
                                    >
                                        <Flame className="mr-2 h-5 w-5" />
                                        Iniciar Calentamiento
                                    </Button>
                                </div>
                            </>
                        ) : (
                            <>
                                <CardTitle className="text-2xl">¡Bienvenido a tu viaje de fitness!</CardTitle>
                                <p className="mt-2 text-sm text-primary-foreground/80">Genera tu primer plan de entrenamiento personalizado con IA para empezar.</p>
                                <Button variant="secondary" size="lg" className="mt-4" onClick={() => navigate('/generator')} disabled={isGeneratingWorkout}>
                                    {isGeneratingWorkout ? 'Generando...' : 'Generar Nuevo Plan'}
                                </Button>
                            </>
                        )}
                    </CardContent>
                </Card>

                {/* Quick Stats */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                    <StatCard 
                        icon={<Heart className="h-5 w-5 text-red-500" />} 
                        title="Completados"
                        value={progressData.length.toString()}
                    />
                     <StatCard 
                        icon={<ClipboardList className="h-5 w-5 text-blue-500" />} 
                        title="Planes Activos"
                        value={workoutPlans.length.toString()}
                    />
                     <StatCard 
                        icon={<BarChart className="h-5 w-5 text-green-500" />} 
                        title="Nivel Actual"
                        value={userData.fitnessLevel.charAt(0).toUpperCase() + userData.fitnessLevel.slice(1)}
                    />
                     <StatCard 
                        icon={<Zap className="h-5 w-5 text-yellow-500" />} 
                        title="Objetivo Principal"
                        value={userData.goals[0] || 'No definido'}
                    />
                </div>
                
                {/* My Workout Plans */}
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h2 className="text-xl font-bold">Mis Planes de Entrenamiento</h2>
                        <Button onClick={() => navigate('/generator')} disabled={isGeneratingWorkout} variant="outline" size="sm">
                            <Plus className="mr-2 h-4 w-4" />
                            Nuevo Plan
                        </Button>
                    </div>
                    {workoutPlans.length > 0 ? (
                        <div className="flex overflow-x-auto space-x-4 pb-4 -m-2 p-2">
                           {workoutPlans.map(plan => (
                                <Card 
                                    key={plan.id} 
                                    className="min-w-[250px] cursor-pointer hover:shadow-lg transition-shadow flex-shrink-0"
                                    onClick={() => navigate(`/workout/${plan.id}`)}
                                >
                                    <CardHeader className="p-4">
                                        <CardTitle className="text-base truncate">{plan.name}</CardTitle>
                                        <CardDescription className="line-clamp-2 h-10">{plan.description}</CardDescription>
                                    </CardHeader>
                                    <CardContent className="p-4 pt-0">
                                        <div className="flex flex-wrap gap-1">
                                            {plan.focus.slice(0, 2).map(f => <Badge key={f} variant="secondary">{f}</Badge>)}
                                        </div>
                                    </CardContent>
                                </Card>
                           ))}
                        </div>
                    ) : (
                        <Card>
                            <CardContent className="py-8 text-center">
                                <p className="text-muted-foreground">Aún no tienes planes de entrenamiento.</p>
                                <Button className="mt-3" onClick={() => navigate('/generator')} disabled={isGeneratingWorkout} variant="default" size="default">
                                    {isGeneratingWorkout ? 'Generando...' : 'Crea tu Primer Plan'}
                                </Button>
                            </CardContent>
                        </Card>
                    )}
                </div>

                {/* Explore Tools */}
                 <div className="space-y-4">
                    <h2 className="text-xl font-bold">Explora tus Herramientas</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tools.map(tool => (
                            <ToolCard key={tool.title} {...tool} />
                        ))}
                    </div>
                </div>

                {/* Workout History */}
                <div className="space-y-4">
                    <h2 className="text-xl font-bold">Historial de Entrenamientos</h2>
                     <Card>
                        {progressData.length > 0 ? (
                             <CardContent className="p-4 space-y-3">
                                {[...progressData].reverse().map((progress) => {
                                    const workout = workoutPlans.find(w => w.id === progress.workoutId);
                                    return (
                                        <div key={progress.date} className="flex justify-between items-center p-3 bg-secondary rounded-lg">
                                            <div className="flex items-center gap-3">
                                                <CheckCircle className="h-5 w-5 text-green-600" />
                                                <div>
                                                    <p className="font-semibold">{workout?.name || 'Entrenamiento'}</p>
                                                    <p className="text-sm text-muted-foreground">{new Date(progress.date).toLocaleDateString()}</p>
                                                </div>
                                            </div>
                                            <Badge variant="outline">Completado</Badge>
                                        </div>
                                    );
                                })}
                            </CardContent>
                        ) : (
                            <CardContent className="py-8 text-center">
                                <p className="text-muted-foreground">Completa un entrenamiento para ver tu historial aquí.</p>
                            </CardContent>
                        )}
                    </Card>
                </div>
            </main>
        </div>
    );
}