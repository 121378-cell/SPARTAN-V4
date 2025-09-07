"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Slider } from "./ui";
import { Sun, Moon, Clock, Droplet, MoonStar, AlarmClock, Activity, ArrowLeft, Utensils } from "lucide-react";

interface CircadianRhythmPlannerProps {
    onBack: () => void;
}

type Chronotype = 'matutino' | 'intermedio' | 'vespertino';
type SleepQuality = number;
type ActivityLevel = 'sedentario' | 'ligero' | 'moderado' | 'intenso' | 'atleta';

export default function CircadianRhythmPlanner({ onBack }: CircadianRhythmPlannerProps) {
  const [chronotype, setChronotype] = useState<Chronotype>('intermedio');
  const [wakeTime, setWakeTime] = useState<string>('07:00');
  const [sleepQuality, setSleepQuality] = useState<SleepQuality>(3);
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('moderado');
  const [currentTime, setCurrentTime] = useState<string>('');
  const [currentPhase, setCurrentPhase] = useState<string>('');
  const [plan, setPlan] = useState<any>(null);

  // Update current time every minute
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      const hours = now.getHours().toString().padStart(2, '0');
      const minutes = now.getMinutes().toString().padStart(2, '0');
      setCurrentTime(`${hours}:${minutes}`);
      
      const currentHour = now.getHours();
      if (currentHour >= 5 && currentHour < 10) setCurrentPhase('mañana-temprano');
      else if (currentHour >= 10 && currentHour < 14) setCurrentPhase('mediodía');
      else if (currentHour >= 14 && currentHour < 18) setCurrentPhase('tarde');
      else if (currentHour >= 18 && currentHour < 22) setCurrentPhase('noche-temprana');
      else setCurrentPhase('noche-tardía');
    };
    
    updateTime();
    const interval = setInterval(updateTime, 60000);
    return () => clearInterval(interval);
  }, []);

  const calculateSleepTime = () => {
    const [hours, minutes] = wakeTime.split(':').map(Number);
    let bedtimeHours = hours;
    
    if (chronotype === 'matutino') bedtimeHours -= 8;
    else if (chronotype === 'vespertino') bedtimeHours -= 7;
    else bedtimeHours -= 7.5;
    
    if (bedtimeHours < 0) bedtimeHours += 24;
    
    return `${Math.floor(bedtimeHours).toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  const generatePlan = () => {
    const bedtime = calculateSleepTime();
    const [wakeHour, wakeMinute] = wakeTime.split(':').map(Number);
    
    let breakfastTime, lunchTime, dinnerTime;
    
    if (chronotype === 'matutino') {
      breakfastTime = addMinutes(wakeTime, 30);
      lunchTime = addMinutes(breakfastTime, 4 * 60);
      dinnerTime = addMinutes(lunchTime, 5 * 60);
    } else if (chronotype === 'vespertino') {
      breakfastTime = addMinutes(wakeTime, 90);
      lunchTime = addMinutes(breakfastTime, 5 * 60);
      dinnerTime = addMinutes(lunchTime, 4 * 60);
    } else {
      breakfastTime = addMinutes(wakeTime, 60);
      lunchTime = addMinutes(breakfastTime, 4.5 * 60);
      dinnerTime = addMinutes(lunchTime, 4.5 * 60);
    }
    
    const activityMultiplier = {
      'sedentario': 1, 'ligero': 1.1, 'moderado': 1.2, 'intenso': 1.35, 'atleta': 1.5
    };
    
    setPlan({
      sleepSchedule: {
        bedtime,
        wakeTime,
        recommendedNap: chronotype === 'vespertino' ? '15:00-15:20' : '13:00-13:20',
        windDownStart: addMinutes(bedtime, -60)
      },
      nutritionPlan: {
        breakfast: { time: breakfastTime, description: "Alto en proteína, carbohidratos complejos.", foods: ["Huevos", "Avena", "Aguacate"] },
        lunch: { time: lunchTime, description: "Comida balanceada con proteína magra.", foods: ["Pollo/Pescado", "Quinoa", "Vegetales"] },
        dinner: { time: dinnerTime, description: "Cena ligera, fácil de digerir.", foods: ["Pescado blanco", "Boniato", "Espinacas"] },
        hydration: { morning: "500ml al despertar", day: "200ml cada hora", evening: "Limitar 2h antes de dormir" }
      },
      activityRecommendations: {
        morning: chronotype === 'matutino' ? "Ejercicio intenso" : "Ejercicio ligero",
        afternoon: "Exposición a luz solar",
        evening: "Ejercicio relajante"
      },
      lightExposure: {
        morning: "Luz brillante al despertar",
        evening: "Reducir luz azul 2h antes de dormir",
        bedroom: "Oscuridad total"
      }
    });
  };

  const addMinutes = (time: string, minutes: number) => {
    const [hours, mins] = time.split(':').map(Number);
    const date = new Date();
    date.setHours(hours, mins, 0, 0);
    date.setMinutes(date.getMinutes() + minutes);
    return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
  };

  const getCurrentRecommendation = () => {
    if (!plan) return null;
    
    let recommendation;
    if (currentPhase === 'mañana-temprano') {
      recommendation = { title: "Rutina Matutina", icon: <Sun className="h-5 w-5" />, items: [ `Bebe ${plan.nutritionPlan.hydration.morning}`, `Desayuna cerca de las ${plan.nutritionPlan.breakfast.time}`, plan.activityRecommendations.morning, plan.lightExposure.morning ] };
    } else if (currentPhase === 'mediodía') {
      recommendation = { title: "Mediodía Energético", icon: <Activity className="h-5 w-5" />, items: [ `Almuerza cerca de las ${plan.nutritionPlan.lunch.time}`, plan.activityRecommendations.afternoon, `Mantén hidratación` ] };
    } else if (currentPhase === 'tarde') {
      recommendation = { title: "Tarde Productiva", icon: <Clock className="h-5 w-5" />, items: [ "Considera una caminata corta", "Evita cafeína después de las 16:00" ] };
    } else if (currentPhase === 'noche-temprana') {
      recommendation = { title: "Transición Nocturna", icon: <MoonStar className="h-5 w-5" />, items: [ `Cena cerca de las ${plan.nutritionPlan.dinner.time}`, plan.activityRecommendations.evening, plan.lightExposure.evening ] };
    } else {
      recommendation = { title: "Preparación para el Sueño", icon: <Moon className="h-5 w-5" />, items: [ `Comienza rutina de relajación a las ${plan.sleepSchedule.windDownStart}`, "Evita pantallas", plan.lightExposure.bedroom ] };
    }
    return recommendation;
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h1 className="text-3xl font-bold">Optimizador Circadiano</h1>
                <p className="text-muted-foreground mt-1">Sincroniza tu estilo de vida con tu reloj biológico.</p>
            </div>
            <Button variant="outline" size="default" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
            </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Moon className="h-5 w-5" />Cronotipo</CardTitle><CardDescription>Tu predisposición natural</CardDescription></CardHeader>
            <CardContent className="flex flex-col gap-2">
              <Button variant={chronotype === 'matutino' ? 'default' : 'outline'} size="default" onClick={() => setChronotype('matutino')} className="justify-start">Matutino (alondra)</Button>
              <Button variant={chronotype === 'intermedio' ? 'default' : 'outline'} size="default" onClick={() => setChronotype('intermedio')} className="justify-start">Intermedio</Button>
              <Button variant={chronotype === 'vespertino' ? 'default' : 'outline'} size="default" onClick={() => setChronotype('vespertino')} className="justify-start">Vespertino (búho)</Button>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><AlarmClock className="h-5 w-5" />Horario</CardTitle><CardDescription>Tus horas de sueño</CardDescription></CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2"><Label>Hora de despertar</Label><Input type="time" value={wakeTime} onChange={(e) => setWakeTime(e.target.value)} /></div>
              <div className="space-y-2"><Label>Calidad de sueño (1-5)</Label><Slider defaultValue={[sleepQuality]} max={5} min={1} step={1} onValueChange={(value) => setSleepQuality(value[0])} /><div className="flex justify-between text-sm text-muted-foreground"><span>Mala</span><span>Excelente</span></div></div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Actividad</CardTitle><CardDescription>Tu nivel de actividad</CardDescription></CardHeader>
            <CardContent className="grid grid-cols-2 gap-2">
              <Button variant={activityLevel === 'sedentario' ? 'default' : 'outline'} size="sm" onClick={() => setActivityLevel('sedentario')}>Sedentario</Button>
              <Button variant={activityLevel === 'ligero' ? 'default' : 'outline'} size="sm" onClick={() => setActivityLevel('ligero')}>Ligero</Button>
              <Button variant={activityLevel === 'moderado' ? 'default' : 'outline'} size="sm" onClick={() => setActivityLevel('moderado')}>Moderado</Button>
              <Button variant={activityLevel === 'intenso' ? 'default' : 'outline'} size="sm" onClick={() => setActivityLevel('intenso')}>Intenso</Button>
              <Button variant={activityLevel === 'atleta' ? 'default' : 'outline'} size="sm" onClick={() => setActivityLevel('atleta')} className="col-span-2">Atleta</Button>
            </CardContent>
          </Card>
        </div>
        
        <Button onClick={generatePlan} className="w-full mb-8" size="lg" variant="default">Generar Plan Circadiano</Button>
        
        {plan && (
          <div className="space-y-8">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Clock className="h-5 w-5" />Recomendación Actual ({currentTime})</CardTitle><CardDescription className="capitalize">{currentPhase.replace('-', ' ')}</CardDescription></CardHeader>
              <CardContent>
                {getCurrentRecommendation() && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-lg font-medium">{getCurrentRecommendation()?.icon}{getCurrentRecommendation()?.title}</div>
                    <ul className="space-y-1.5 pl-5 list-disc text-muted-foreground">{getCurrentRecommendation()?.items.map((item, idx) => <li key={idx}>{item}</li>)}</ul>
                  </div>
                )}
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><MoonStar className="h-5 w-5" />Ritmo de Sueño</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Hora de dormir:</span><span className="font-medium">{plan.sleepSchedule.bedtime}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Hora de despertar:</span><span className="font-medium">{plan.sleepSchedule.wakeTime}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Siesta recomendada:</span><span className="font-medium">{plan.sleepSchedule.recommendedNap}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Inicio relajación:</span><span className="font-medium">{plan.sleepSchedule.windDownStart}</span></div>
                </CardContent>
              </Card>
              
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Utensils className="h-5 w-5" />Plan Nutricional</CardTitle></CardHeader>
                <CardContent className="space-y-3 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Desayuno:</span><span className="font-medium">{plan.nutritionPlan.breakfast.time}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Almuerzo:</span><span className="font-medium">{plan.nutritionPlan.lunch.time}</span></div>
                  <div className="flex justify-between"><span className="text-muted-foreground">Cena:</span><span className="font-medium">{plan.nutritionPlan.dinner.time}</span></div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}