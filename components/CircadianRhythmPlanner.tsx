"use client";

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Slider } from "./ui";
import { Sun, Moon, Clock, Droplet, MoonStar, AlarmClock, Activity, ArrowLeft, Utensils } from "lucide-react";

interface CircadianRhythmPlannerProps {}

type Chronotype = 'matutino' | 'intermedio' | 'vespertino';
type SleepQuality = number;
type ActivityLevel = 'sedentario' | 'ligero' | 'moderado' | 'intenso' | 'atleta';

export default function CircadianRhythmPlanner({}: CircadianRhythmPlannerProps) {
  const navigate = useNavigate();
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
      recommendation = { title: "Mediodía Energético", icon: <Activity className="h-5 w-5" />, items: [ `Almuerza cerca de las ${plan.