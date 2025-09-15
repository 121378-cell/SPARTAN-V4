
"use client";

import { useState, useRef, useEffect } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Progress, Input, Label, Alert, AlertDescription, AlertTitle } from "./ui";
import { Activity, AlertCircle, RotateCw, StretchHorizontal, ArrowLeft } from "lucide-react";
import type { BodyPart, OverloadData, CorrectiveExercise } from "../lib/types";
import { detectOverloadApi } from "../lib/api";

interface OverloadDetectionProps {
    onBack: () => void;
}

export default function OverloadDetection({ onBack }: OverloadDetectionProps) {
  const [userInput, setUserInput] = useState<{
    painAreas: BodyPart[];
    activityLevel: 'sedentario' | 'ligero' | 'moderado' | 'intenso' | 'atleta';
    recentWorkouts: string[];
  }>({
    painAreas: [],
    activityLevel: 'moderado',
    recentWorkouts: []
  });

  const [overloadData, setOverloadData] = useState<OverloadData[]>([]);
  const [correctiveExercises, setCorrectiveExercises] = useState<CorrectiveExercise[]>([]);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [showDetails, setShowDetails] = useState<BodyPart | null>(null);
  const [error, setError] = useState<string | null>(null);
  const isMounted = useRef(true);

  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  const detectOverload = async () => {
    setIsAnalyzing(true);
    setError(null);
    setOverloadData([]);
    setCorrectiveExercises([]);
    
    try {
        const result = await detectOverloadApi(userInput);
        if (isMounted.current) {
            setOverloadData(result.overloadData);
            setCorrectiveExercises(result.correctiveExercises);
        }
    } catch (e) {
        console.error("Failed to detect overload:", e);
        if (isMounted.current) {
            setError("An error occurred during analysis. Please try again.");
        }
    } finally {
        if (isMounted.current) {
            setIsAnalyzing(false);
        }
    }
  };

  const toggleBodyPart = (part: BodyPart) => {
    setUserInput(prev => {
      if (prev.painAreas.includes(part)) {
        return {
          ...prev,
          painAreas: prev.painAreas.filter(p => p !== part)
        };
      } else {
        return {
          ...prev,
          painAreas: [...prev.painAreas, part]
        };
      }
    });
  };

  const getSeverityColor = (severity: number) => {
    if (severity <= 3) return 'bg-green-500';
    if (severity <= 6) return 'bg-yellow-500';
    if (severity <= 8) return 'bg-orange-500';
    return 'bg-red-500';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-indigo-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h1 className="text-3xl font-bold mb-2">Detección de Sobrecarga Muscular</h1>
                <p className="text-muted-foreground">
                Identifica áreas de tensión acumulada y recibe ejercicios correctivos personalizados
                </p>
            </div>
            <Button variant="outline" size="default" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Volver
            </Button>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Panel de entrada */}
          <div className="md:col-span-1 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Tu Perfil de Actividad</CardTitle>
                <CardDescription>
                  Proporciona información para un análisis preciso
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label>Nivel de actividad física</Label>
                  <div className="flex flex-wrap gap-2">
                    {(['sedentario', 'ligero', 'moderado', 'intenso', 'atleta'] as const).map(level => (
                      <Button
                        key={level}
                        variant={userInput.activityLevel === level ? 'default' : 'outline'}
                        onClick={() => setUserInput({...userInput, activityLevel: level})}
                        size="sm"
                      >
                        {level.charAt(0).toUpperCase() + level.slice(1)}
                      </Button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Entrenamientos recientes (opcional)</Label>
                  <Input 
                    placeholder="Ej: running, pesas, yoga..."
                    value={userInput.recentWorkouts.join(', ')}
                    onChange={(e) => setUserInput({
                      ...userInput,
                      recentWorkouts: e.target.value.split(',').map(s => s.trim())
                    })}
                  />
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <CardTitle>Áreas de Molestia</CardTitle>
                <CardDescription>
                  Selecciona las zonas donde sientes tensión o dolor
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-2">
                  {([
                    'hombros', 'cuello', 'columna', 'lumbar', 
                    'caderas', 'rodillas', 'tobillos', 'muñecas',
                    'isquios', 'gemelos'
                  ] as BodyPart[]).map(part => (
                    <Button
                      key={part}
                      variant={userInput.painAreas.includes(part) ? 'default' : 'outline'}
                      onClick={() => toggleBodyPart(part)}
                      size="sm"
                    >
                      {part.charAt(0).toUpperCase() + part.slice(1)}
                    </Button>
                  ))}
                </div>
              </CardContent>
              <CardFooter>
                <Button 
                  onClick={detectOverload}
                  disabled={userInput.painAreas.length === 0 || isAnalyzing}
                  className="w-full"
                  variant="default"
                  size="default"
                >
                  {isAnalyzing ? (
                    <>
                      <RotateCw className="h-4 w-4 mr-2 animate-spin" />
                      Analizando...
                    </>
                  ) : (
                    <>
                      <Activity className="h-4 w-4 mr-2" />
                      Detectar Sobrecarga
                    </>
                  )}
                </Button>
              </CardFooter>
            </Card>
          </div>
          
          {/* Resultados */}
          <div className="md:col-span-2 space-y-6">
            {error && (
                <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertTitle>Analysis Failed</AlertTitle>
                    <AlertDescription>{error}</AlertDescription>
                </Alert>
            )}
            {isAnalyzing ? (
              <Card>
                <CardContent className="py-12 text-center">
                  <Progress value={50} className="w-full" />
                  <p className="mt-4 text-muted-foreground">Analizando patrones de movimiento y tensión muscular...</p>
                </CardContent>
              </Card>
            ) : overloadData.length > 0 ? (
              <>
                <Card>
                  <CardHeader>
                    <CardTitle>Resultados del Análisis</CardTitle>
                    <CardDescription>
                      Nivel de sobrecarga detectado en tus tejidos
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-4">
                      {overloadData.map((data, idx) => (
                        <div key={idx} className="border rounded-lg p-4">
                          <div className="flex justify-between items-center">
                            <div className="flex items-center gap-3">
                              <div className={`h-3 w-3 rounded-full ${getSeverityColor(data.severity)}`} />
                              <h3 className="font-medium capitalize">
                                {data.bodyPart} - {data.type}
                              </h3>
                            </div>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => setShowDetails(showDetails === data.bodyPart ? null : data.bodyPart)}
                            >
                              {showDetails === data.bodyPart ? 'Menos detalles' : 'Más detalles'}
                            </Button>
                          </div>
                          
                          <div className="mt-2 flex items-center gap-4">
                            <div className="flex-1">
                              <div className="flex justify-between text-sm text-muted-foreground mb-1">
                                <span>Nivel de sobrecarga</span>
                                <span>{data.severity}/10</span>
                              </div>
                              <Progress value={data.severity * 10} className="h-2" />
                            </div>
                            <span className="text-sm capitalize">{data.frequency}</span>
                          </div>
                          
                          {showDetails === data.bodyPart && (
                            <div className="mt-3 pt-3 border-t text-sm">
                              <p className="text-muted-foreground">
                                {data.severity > 7 ? (
                                  "Sobrecarga crítica - necesita atención inmediata y posible evaluación profesional"
                                ) : data.severity > 4 ? (
                                  "Sobrecarga significativa - implementa ejercicios correctivos y modifica tu rutina"
                                ) : (
                                  "Sobrecarga leve - buena oportunidad para prevención proactiva"
                                )}
                              </p>
                              {data.type === 'articular' && (
                                <p className="mt-2">
                                  <span className="font-medium">Cuidado articular:</span> Considera reducir carga de impacto y trabajar en movilidad.
                                </p>
                              )}
                              {data.type === 'tendinosa' && (
                                <p className="mt-2">
                                  <span className="font-medium">Atención tendinosa:</span> Enfócate en ejercicios excéntricos y evita sobreuso.
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
                
                {correctiveExercises.length > 0 && (
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2">
                        <StretchHorizontal className="h-5 w-5" />
                        Plan Correctivo Recomendado
                      </CardTitle>
                      <CardDescription>
                        Ejercicios personalizados para tus áreas de sobrecarga
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {correctiveExercises.map((ex, idx) => (
                          <Card key={idx}>
                            <CardHeader>
                              <CardTitle className="text-lg">{ex.name}</CardTitle>
                              <CardDescription>
                                {Array.isArray(ex.targetArea) ? ex.targetArea.map(a => a.charAt(0).toUpperCase() + a.slice(1)).join(', ') : ''}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <p className="text-sm">{ex.description}</p>
                              <div className="mt-3 flex justify-between text-sm text-muted-foreground">
                                <span>{ex.duration}</span>
                                <span>
                                  {ex.equipment === 'ninguno' ? 'Sin equipo' : 
                                   `Necesitas: ${ex.equipment}`}
                                </span>
                              </div>
                            </CardContent>
                            <CardFooter>
                              <Button variant="outline" size="default" className="w-full">
                                Ver demostración
                              </Button>
                            </CardFooter>
                          </Card>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            ) : (
              <Card>
                <CardContent className="py-12 text-center">
                  <div className="mx-auto max-w-md space-y-4">
                    <Activity className="h-12 w-12 mx-auto text-muted-foreground" />
                    <h3 className="text-xl font-medium">Comienza tu análisis</h3>
                    <p className="text-muted-foreground">
                      Selecciona las áreas donde experimentas molestias y haz clic en "Detectar Sobrecarga" para recibir recomendaciones personalizadas.
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
            
            {overloadData.some(d => d.severity > 7) && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertTitle>Atención: Sobrecarga crítica detectada</AlertTitle>
                <AlertDescription>
                  Algunas áreas muestran niveles de sobrecarga altos. Considera consultar con un profesional de la salud además de seguir las recomendaciones.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
