"use client";

import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Progress, Alert, AlertTitle, AlertDescription, Badge } from "./ui";
import { RotateCcw, AlertTriangle, Check, Video, Activity, Zap, ArrowLeft } from "lucide-react";

type Exercise = {
  name: string;
  commonMistakes: Mistake[];
  optimalRange: {
    jointAngles: number[];
    speed: number[];
    symmetry: number[];
  };
  videoUrl: string;
};

type Mistake = {
  name: string;
  description: string;
  correction: string;
  severity: 'low' | 'medium' | 'high';
  sensorsDetected: string[];
};

type Feedback = {
  exercise: string;
  mistakes: {
    mistake: Mistake;
    confidence: number;
    frame?: string;
    data: {
      actual: number[];
      ideal: number[];
    };
  }[];
  overallScore: number;
  timestamp: Date;
};

interface ExerciseFormCheckerProps {}

export default function ExerciseFormChecker({}: ExerciseFormCheckerProps) {
  const navigate = useNavigate();
  const { exerciseName } = useParams<{ exerciseName: string }>();

  const [currentExercise, setCurrentExercise] = useState<Exercise | null>(null);
  const [isMonitoring, setIsMonitoring] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [sensorData, setSensorData] = useState<any>(null);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);

  // Base de datos de ejercicios y errores comunes
  const exerciseDatabase: Exercise[] = [
    {
      name: "Sentadilla",
      videoUrl: "https://videos.pexels.com/video-files/3837489/3837489-hd_1920_1080_25fps.mp4",
      commonMistakes: [
        {
          name: "Valgo de rodillas",
          description: "Las rodillas colapsan hacia adentro durante el movimiento",
          correction: "Mantener las rodillas alineadas con los dedos de los pies, activar glúteo medio",
          severity: 'high',
          sensorsDetected: ['cámara', 'IMU rodilla']
        },
        {
          name: "Profundidad insuficiente",
          description: "No alcanza la paralela (cadera por encima de la rodilla)",
          correction: "Trabajar movilidad de tobillo y cadera, usar box como guía",
          severity: 'medium',
          sensorsDetected: ['cámara', 'IMU cadera']
        },
        {
          name: "Curvatura lumbar",
          description: "Pérdida de neutralidad en columna lumbar",
          correction: "Activar core, mantener pecho alto, considerar menor peso",
          severity: 'high',
          sensorsDetected: ['cámara', 'EMG lumbar']
        }
      ],
      optimalRange: {
        jointAngles: [120, 145, 90], // Cadera, rodilla, tobillo
        speed: [0.8, 1.2], // m/s
        symmetry: [85, 100] // % simetría izquierda/derecha
      }
    },
    {
      name: "Press Banca",
      videoUrl: "https://videos.pexels.com/video-files/8062272/8062272-hd_1920_1080_30fps.mp4",
      commonMistakes: [
        {
          name: "Arqueo excesivo lumbar",
          description: "Hiperextensión lumbar que compromete la columna",
          correction: "Mantener pelvis neutra, pies firmes en el suelo",
          severity: 'high',
          sensorsDetected: ['cámara', 'EMG lumbar']
        },
        {
          name: "Recorrido incompleto",
          description: "No toca el pecho en la fase excéntrica",
          correction: "Reducir peso, trabajar movilidad de hombros",
          severity: 'medium',
          sensorsDetected: ['cámara', 'IMU muñeca']
        },
        {
          name: "Desbalance lateral",
          description: "Un brazo se mueve más rápido o más lejos que el otro",
          correction: "Trabajar con peso unilateral primero, concentrarse en simetría",
          severity: 'medium',
          sensorsDetected: ['cámara', 'IMU bilateral']
        }
      ],
      optimalRange: {
        jointAngles: [75, 170, 45], // Hombro, codo, muñeca
        speed: [0.5, 0.9], // m/s
        symmetry: [90, 100] // % simetría izquierda/derecha
        }
    },
    {
      name: "Peso Muerto",
      videoUrl: "https://videos.pexels.com/video-files/5377545/5377545-hd_1080_1920_25fps.mp4",
      commonMistakes: [
        {
          name: "Espalda redondeada",
          description: "La espalda baja se curva durante el levantamiento, perdiendo la neutralidad.",
          correction: "Activar el core, mantener el pecho erguido, y asegurar la retracción escapular.",
          severity: 'high',
          sensorsDetected: ['cámara', 'EMG lumbar']
        },
        {
          name: "Tirar con los brazos",
          description: "Iniciar el movimiento flexionando los codos en lugar de empujar con las piernas.",
          correction: "Mantener los brazos rectos como \"ganchos\", pensar en empujar el suelo con los pies.",
          severity: 'medium',
          sensorsDetected: ['cámara', 'IMU codo']
        }
      ],
      optimalRange: {
        jointAngles: [160, 170, 90],
        speed: [0.6, 1.0],
        symmetry: [90, 100]
      }
    },
    {
      name: "Remo con Barra",
      videoUrl: "https://videos.pexels.com/video-files/6932908/6932908-hd_1920_1080_25fps.mp4",
      commonMistakes: [
        {
          name: "Impulso excesivo",
          description: "Mover el torso arriba y abajo para levantar el peso.",
          correction: "Mantener el torso estable y paralelo al suelo. Reducir el peso si es necesario.",
          severity: 'medium',
          sensorsDetected: ['cámara', 'IMU cadera']
        },
        {
          name: "Codos abiertos",
          description: "Los codos se alejan del cuerpo en lugar de moverse hacia atrás.",
          correction: "Mantener los codos cerca del torso, enfocarse en apretar los omóplatos.",
          severity: 'low',
          sensorsDetected: ['cámara', 'IMU hombro']
        }
      ],
      optimalRange: {
        jointAngles: [45, 90, 90],
        speed: [0.7, 1.1],
        symmetry: [88, 100]
      }
    },
    {
      name: "Press Militar",
      videoUrl: "https://videos.pexels.com/video-files/8062275/8062275-hd_1920_1080_30fps.mp4",
      commonMistakes: [
        {
          name: "Arqueo lumbar excesivo",
          description: "Hiperextender la espalda baja para empujar el peso hacia arriba.",
          correction: "Apretar los glúteos y el abdomen para mantener la pelvis neutra.",
          severity: 'high',
          sensorsDetected: ['cámara', 'EMG lumbar']
        },
        {
          name: "Recorrido incompleto",
          description: "No extender completamente los brazos en la parte superior del movimiento.",
          correction: "Asegurar un bloqueo completo en la parte superior, con la cabeza \"a través\" de los brazos.",
          severity: 'medium',
          sensorsDetected: ['cámara', 'IMU codo']
        }
      ],
      optimalRange: {
        jointAngles: [170, 175, 180],
        speed: [0.5, 0.9],
        symmetry: [90, 100]
      }
    }
  ];

  // Simular datos de sensores
  const simulateSensorData = (exercise: Exercise) => {
    const mistakes = [...exercise.commonMistakes];
    const randomMistakes = Math.random() > 0.3 
      ? [mistakes[Math.floor(Math.random() * mistakes.length)]] 
      : [];

    const sensorData = {
      jointAngles: [
        exercise.optimalRange.jointAngles[0] + (Math.random() * 30 - 15),
        exercise.optimalRange.jointAngles[1] + (Math.random() * 30 - 15),
        exercise.optimalRange.jointAngles[2] + (Math.random() * 20 - 10)
      ],
      speed: [exercise.optimalRange.speed[0] + (Math.random() * 0.4 - 0.2)],
      symmetry: [exercise.optimalRange.symmetry[0] + (Math.random() * 20 - 10)],
      detectedMistakes: randomMistakes
    };

    return sensorData;
  };

  const startExercise = (exercise: Exercise) => {
    setCurrentExercise(exercise);
    setCountdown(3);
  };

  const startMonitoring = () => {
    setIsMonitoring(true);
    setProgress(0);
    setFeedback(null);
    
    // Simular análisis en tiempo real
    const interval = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsMonitoring(false);
          analyzePerformance();
          return 100;
        }
        return prev + 10;
      });

      // Actualizar datos de sensores simulados
      if (currentExercise) {
        setSensorData(simulateSensorData(currentExercise));
      }
    }, 800);
  };

  const analyzePerformance = () => {
    if (!currentExercise || !sensorData) return;

    const detectedMistakes = sensorData.detectedMistakes.map((mistake: Mistake) => ({
      mistake,
      confidence: Math.floor(Math.random() * 30) + 70, // 70-100% de confianza
      data: {
        actual: sensorData.jointAngles,
        ideal: currentExercise.optimalRange.jointAngles
      }
    }));

    const score = detectedMistakes.length > 0 
      ? 100 - (detectedMistakes.length * 15)
      : 95 + Math.floor(Math.random() * 5);

    setFeedback({
      exercise: currentExercise.name,
      mistakes: detectedMistakes,
      overallScore: score,
      timestamp: new Date()
    });
  };

  // Efecto para el countdown
  useEffect(() => {
    if (countdown === null) return;

    const timer = setTimeout(() => {
      if (countdown > 0) {
        setCountdown(countdown - 1);
      } else {
        setCountdown(null);
        startMonitoring();
      }
    }, 1000);

    return () => clearTimeout(timer);
  }, [countdown]);

  useEffect(() => {
      if (exerciseName) {
          const decodedExerciseName = decodeURIComponent(exerciseName);
          const exerciseToStart = exerciseDatabase.find(ex => ex.name.toLowerCase() === decodedExerciseName.toLowerCase());
          if (exerciseToStart) {
              startExercise(exerciseToStart);
          }
      }
  }, [exerciseName]);
  
  const onBack = () => navigate(-1);

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
            <h1 className="text-3xl font-bold">Asistente Técnico de Ejercicios</h1>
            {/* FIX: Added missing size prop to Button component */}
            <Button variant="outline" size="default" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver al Entrenamiento
            </Button>
        </div>
        
        <div className="grid gap-8 md:grid-cols-3">
          {/* Panel de selección */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="h-5 w-5" />
                  Selecciona Ejercicio
                </CardTitle>
                <CardDescription>
                  El sistema analizará tu técnica usando sensores o cámara
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {exerciseDatabase.map(exercise => (
                  // FIX: Added missing size prop to Button component
                  <Button
                    key={exercise.name}
                    variant={currentExercise?.name === exercise.name ? 'default' : 'outline'}
                    size="default"
                    onClick={() => startExercise(exercise)}
                    className="w-full justify-start"
                    disabled={isMonitoring}
                  >
                    {exercise.name}
                  </Button>
                ))}
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Sensores Disponibles
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <Video className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium">Cámara 3D</p>
                    <p className="text-sm text-muted-foreground">Análisis de movimiento</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-purple-100 p-2 rounded-full">
                    <Activity className="h-5 w-5 text-purple-600" />
                  </div>
                  <div>
                    <p className="font-medium">IMUs</p>
                    <p className="text-sm text-muted-foreground">Sensores inerciales en articulaciones</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="bg-green-100 p-2 rounded-full">
                    <Activity className="h-5 w-5 text-green-600" />
                  </div>
                  <div>
                    <p className="font-medium">EMG</p>
                    <p className="text-sm text-muted-foreground">Actividad muscular</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          
          {/* Panel principal */}
          <div className="md:col-span-2 space-y-6">
            {!currentExercise ? (
              <Card>
                <CardHeader>
                  <CardTitle>Instrucciones</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* FIX: Added missing variant prop to Alert component */}
                    <Alert variant="default">
                      <AlertTriangle className="h-4 w-4" />
                      <div>
                        <AlertTitle>Selecciona un ejercicio</AlertTitle>
                        <AlertDescription>
                          Elige un ejercicio de la lista para comenzar el análisis de tu técnica.
                        </AlertDescription>
                      </div>
                    </Alert>
                    
                    <div className="space-y-2">
                      <h3 className="font-medium">Cómo funciona:</h3>
                      <ul className="list-disc pl-5 space-y-1 text-sm text-muted-foreground">
                        <li>Selecciona el ejercicio que vas a realizar</li>
                        <li>El sistema analizará tu movimiento en tiempo real</li>
                        <li>Recibirás feedback inmediato sobre errores técnicos</li>
                        <li>Te mostraremos cómo corregir cada problema detectado</li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <>
                {currentExercise.videoUrl && (
                  <Card>
                    <CardHeader>
                      <CardTitle>Demostración del Ejercicio</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <video
                        key={currentExercise.name}
                        width="100%"
                        controls
                        className="rounded-lg"
                        src={currentExercise.videoUrl}
                        aria-label={`Video de demostración para ${currentExercise.name}`}
                      >
                        Tu navegador no soporta el tag de video.
                      </video>
                    </CardContent>
                  </Card>
                )}
                {countdown !== null ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="text-center">Preparados...</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-center py-8">
                        <p className="text-6xl font-bold text-primary">{countdown}</p>
                        <p className="text-lg mt-4">Posiciónate para comenzar {currentExercise.name}</p>
                      </div>
                    </CardContent>
                  </Card>
                ) : isMonitoring ? (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center justify-between">
                        <span>Analizando {currentExercise.name}</span>
                        <span>{progress}%</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <Progress value={progress} className="h-2 mb-6" />
                      
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="border rounded-lg p-3 text-center">
                          <p className="text-sm text-muted-foreground">Ángulos</p>
                          <p className="font-mono text-lg">
                            {sensorData?.jointAngles.map(a => Math.floor(a)).join('° / ')}°
                          </p>
                        </div>
                        <div className="border rounded-lg p-3 text-center">
                          <p className="text-sm text-muted-foreground">Velocidad</p>
                          <p className="font-mono text-lg">
                            {sensorData?.speed[0].toFixed(2)} m/s
                          </p>
                        </div>
                        <div className="border rounded-lg p-3 text-center">
                          <p className="text-sm text-muted-foreground">Simetría</p>
                          <p className="font-mono text-lg">
                            {Math.floor(sensorData?.symmetry[0])}%
                          </p>
                        </div>
                      </div>
                      
                      {sensorData?.detectedMistakes.length > 0 && (
                        <Alert variant="destructive">
                          <AlertTriangle className="h-4 w-4" />
                          <div>
                            <AlertTitle>Error detectado!</AlertTitle>
                            <AlertDescription>
                              {sensorData.detectedMistakes[0].name} - {sensorData.detectedMistakes[0].description}
                            </AlertDescription>
                          </div>
                        </Alert>
                      )}
                    </CardContent>
                  </Card>
                ) : feedback ? (
                  <Card>
                    <CardHeader>
                      <CardTitle>Resultados: {feedback.exercise}</CardTitle>
                      <CardDescription>
                        Análisis completado el {feedback.timestamp.toLocaleTimeString()}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Puntuación Técnica</p>
                          <p className="text-3xl font-bold">
                            {feedback.overallScore}/100
                          </p>
                        </div>
                        <div>
                          {feedback.overallScore > 85 ? (
                            // FIX: Added missing variant prop to Badge component
                            <Badge variant="default" className="bg-green-100 text-green-800">
                              <Check className="h-4 w-4 mr-1" />
                              Excelente técnica
                            </Badge>
                          ) : feedback.overallScore > 70 ? (
                            // FIX: Added missing variant prop to Badge component
                            <Badge variant="default" className="bg-yellow-100 text-yellow-800">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Técnica aceptable
                            </Badge>
                          ) : (
                            // FIX: Added missing variant prop to Badge component
                            <Badge variant="default" className="bg-red-100 text-red-800">
                              <AlertTriangle className="h-4 w-4 mr-1" />
                              Necesita correcciones
                            </Badge>
                          )}
                        </div>
                      </div>
                      
                      {feedback.mistakes.length > 0 ? (
                        <>
                          <h3 className="font-semibold">Errores detectados:</h3>
                          <div className="space-y-4">
                            {feedback.mistakes.map((mistake, index) => (
                              <Alert key={index} variant={mistake.mistake.severity === 'high' ? 'destructive' : 'warning'}>
                                <AlertTriangle className="h-4 w-4" />
                                <div>
                                  <AlertTitle>{mistake.mistake.name} ({mistake.confidence}% confianza)</AlertTitle>
                                  <AlertDescription className="mt-1">
                                    <p>{mistake.mistake.description}</p>
                                    <p className="font-medium mt-2">Corrección: {mistake.mistake.correction}</p>
                                    <div className="mt-2 text-xs text-muted-foreground">
                                      Detectado por: {mistake.mistake.sensorsDetected.join(', ')}
                                    </div>
                                  </AlertDescription>
                                </div>
                              </Alert>
                            ))}
                          </div>
                        </>
                      ) : (
                        // FIX: Added missing variant prop to Alert component
                        <Alert variant="default">
                          <Check className="h-4 w-4" />
                          <div>
                            <AlertTitle>¡Técnica correcta!</AlertTitle>
                            <AlertDescription>
                              No se detectaron errores significativos en tu ejecución.
                            </AlertDescription>
                          </div>
                        </Alert>
                      )}
                      
                      <div className="grid grid-cols-2 gap-4">
                        {/* FIX: Added missing size prop to Button component */}
                        <Button
                          variant="outline"
                          size="default"
                          onClick={() => startExercise(currentExercise)}
                          className="w-full"
                        >
                          <RotateCcw className="h-4 w-4 mr-2" />
                          Repetir Análisis
                        </Button>
                        {/* FIX: Added missing variant and size props to Button component */}
                        <Button
                          variant="default"
                          size="default"
                          onClick={() => setCurrentExercise(null)}
                          className="w-full"
                        >
                          Elegir Otro Ejercicio
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ) : (
                  <Card>
                    <CardHeader>
                      <CardTitle>Listo para {currentExercise.name}</CardTitle>
                      <CardDescription>
                        El sistema analizará tu técnica usando sensores de movimiento
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <h3 className="font-medium">Errores comunes que detectaremos:</h3>
                        <ul className="list-disc pl-5 space-y-2 text-sm text-muted-foreground">
                          {currentExercise.commonMistakes.map((mistake, index) => (
                            <li key={index}>
                              <span className="font-medium">{mistake.name}:</span> {mistake.description}
                            </li>
                          ))}
                        </ul>
                        
                        {/* FIX: Added missing variant prop to Button component */}
                        <Button
                          onClick={startMonitoring}
                          className="w-full mt-6"
                          size="lg"
                          variant="default"
                        >
                          Comenzar Análisis
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}