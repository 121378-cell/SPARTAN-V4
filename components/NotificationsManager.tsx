import { useEffect, useRef } from 'react';
import type { NotificationSettings } from '../lib/types';

interface NotificationsManagerProps {
    settings: NotificationSettings;
    hasActiveWorkout: boolean;
}

const sendNotification = (title: string, options: NotificationOptions) => {
    if ('Notification' in window && Notification.permission === 'granted') {
        new Notification(title, options);
    }
};

export default function NotificationsManager({ settings, hasActiveWorkout }: NotificationsManagerProps) {
    const intervalsRef = useRef<NodeJS.Timeout[]>([]);

    // Solicitar permiso al montar el componente
    useEffect(() => {
        if ('Notification' in window && Notification.permission !== 'granted' && Notification.permission !== 'denied') {
            Notification.requestPermission();
        }
    }, []);

    // Configurar o limpiar los temporizadores cuando cambian los ajustes
    useEffect(() => {
        // Limpiar intervalos anteriores
        intervalsRef.current.forEach(clearInterval);
        intervalsRef.current = [];

        const now = new Date();

        // Recordatorios de hidratación (cada 2 horas)
        if (settings.hydration) {
            const hydrationInterval = setInterval(() => {
                sendNotification('💧 Recordatorio de Hidratación', {
                    body: '¡Es hora de beber agua para mantenerte enérgico y saludable!',
                    icon: '/favicon.ico',
                });
            }, 2 * 60 * 60 * 1000); // 2 horas
            intervalsRef.current.push(hydrationInterval);
        }

        // Recordatorios de comidas
        if (settings.meals) {
            const mealTimes = [8, 13, 19]; // 8 AM, 1 PM, 7 PM
            const mealLabels = ['desayuno', 'almuerzo', 'cena'];
            
            const mealInterval = setInterval(() => {
                const currentHour = new Date().getHours();
                const currentMinute = new Date().getMinutes();
                if(mealTimes.includes(currentHour) && currentMinute === 0) {
                     const mealIndex = mealTimes.indexOf(currentHour);
                     sendNotification('🍴 ¡Hora de Comer!', {
                        body: `No te saltes tu ${mealLabels[mealIndex]}. ¡Recarga tus músculos!`,
                        icon: '/favicon.ico',
                    });
                }
            }, 60 * 1000); // Revisa cada minuto
            intervalsRef.current.push(mealInterval);
        }

        // Recordatorio de entrenamiento (una vez al día si hay plan activo)
        if (settings.workouts && hasActiveWorkout) {
             const workoutInterval = setInterval(() => {
                const currentHour = new Date().getHours();
                const currentMinute = new Date().getMinutes();
                // Enviar a las 5 PM
                if(currentHour === 17 && currentMinute === 0) {
                     sendNotification('💪 ¡Es Hora de Entrenar!', {
                        body: 'Tu plan de entrenamiento te está esperando. ¡Vamos a por ello!',
                        icon: '/favicon.ico',
                    });
                }
            }, 60 * 1000); // Revisa cada minuto
            intervalsRef.current.push(workoutInterval);
        }

        // Función de limpieza para desmontar el componente
        return () => {
            intervalsRef.current.forEach(clearInterval);
        };
    }, [settings, hasActiveWorkout]);

    return null; // Este componente no renderiza nada
}