



"use client";

import { Button, Card, CardContent, CardHeader, CardTitle, Input, Label, Textarea } from "./ui";
import { Dumbbell, Gauge, MoveRight, AlertTriangle, Star } from "lucide-react";
import type { TrainingLevel, TrainingLocation, Equipment, InjuryHistory, TrainingDays, DumbbellType, BarbellType } from "../lib/types";
// FIX: Import Dispatch and SetStateAction to correctly type the setGoals prop.
import type { Dispatch, SetStateAction } from "react";

interface GeneratorFormProps {
    level: TrainingLevel;
    setLevel: (level: TrainingLevel) => void;
    availableDays: TrainingDays;
    setAvailableDays: (days: TrainingDays) => void;
    trainingLocation: TrainingLocation;
    setTrainingLocation: (location: TrainingLocation) => void;
    equipment: Equipment;
    setEquipment: (equipment: Equipment | ((prev: Equipment) => Equipment)) => void;
    injuryHistory: InjuryHistory;
    setInjuryHistory: (history: InjuryHistory) => void;
    previousProgress: string;
    setPreviousProgress: (progress: string) => void;
    primaryGoal: string;
    setPrimaryGoal: (goal: string) => void;
    goals: Record<string, boolean>;
    // FIX: Correctly type setGoals to allow functional updates.
    setGoals: Dispatch<SetStateAction<Record<string, boolean>>>;
    isGenerating: boolean;
    formErrors: Record<string, string>;
    onGenerate: () => void;
}

const goalLabels: Record<string, string> = {
    strength: 'Fuerza',
    hypertrophy: 'Hipertrofia',
    definition: 'Definición',
    mobility: 'Movilidad',
    endurance: 'Resistencia',
    cardio: 'Salud Cardiovascular',
};

const equipmentLabels: Record<string, string> = {
    kettlebells: 'Kettlebells',
    resistanceBands: 'Bandas Resistencia',
    pullUpBar: 'Barra Dominadas',
    bench: 'Banco',
    machine: 'Máquinas',
};


export default function GeneratorForm({
    level, setLevel,
    availableDays, setAvailableDays,
    trainingLocation, setTrainingLocation,
    equipment, setEquipment,
    injuryHistory, setInjuryHistory,
    previousProgress, setPreviousProgress,
    primaryGoal, setPrimaryGoal,
    goals, setGoals,
    formErrors,
    isGenerating, onGenerate
}: GeneratorFormProps) {

    const handlePrimaryGoalSelect = (goal: string) => {
        setPrimaryGoal(goal);
        // Deselect from secondary if it's there
        if (goals[goal]) {
            setGoals(prev => ({ ...prev, [goal]: false }));
        }
    };

    const toggleGoal = (goal: string) => {
        if (goal === primaryGoal) return; // Prevent selecting primary as secondary
        setGoals({ ...goals, [goal]: !goals[goal] });
    };

    const toggleSimpleEquipment = (equip: keyof Omit<Equipment, 'dumbbells' | 'barbell'>) => {
        setEquipment(prev => ({ ...prev, [equip]: !prev[equip] }));
    };

    const toggleComplexEquipment = (equip: 'dumbbells' | 'barbell') => {
        setEquipment(prev => ({
            ...prev,
            [equip]: {
                ...prev[equip],
                available: !prev[equip].available,
                type: !prev[equip].available ? (equip === 'dumbbells' ? 'fixed' : 'olympic') : 'none'
            }
        }));
    };
    
    const setDumbbellType = (type: DumbbellType) => {
        setEquipment(prev => ({ ...prev, dumbbells: { ...prev.dumbbells, type }}));
    };

    const setBarbellType = (type: BarbellType) => {
        setEquipment(prev => ({ ...prev, barbell: { ...prev.barbell, type }}));
    };

    return (
        <>
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gauge className="h-5 w-5" />
                        Nivel y Disponibilidad
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-2">
                        <Label>Nivel Actual</Label>
                        <div className="flex gap-2 flex-wrap">
                            {(['beginner', 'intermediate', 'advanced'] as TrainingLevel[]).map(lvl => (
                                // FIX: Added missing size prop to Button component
                                <Button
                                    key={lvl}
                                    variant={level === lvl ? 'default' : 'outline'}
                                    size="default"
                                    onClick={() => setLevel(lvl)}
                                    className="capitalize"
                                >
                                    {lvl === 'beginner' ? 'Principiante' : lvl === 'intermediate' ? 'Intermedio' : 'Avanzado'}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Días Disponibles</Label>
                        <div className="flex gap-2 flex-wrap">
                            {([1, 2, 3, 4, 5, 6] as TrainingDays[]).map(num => (
                                // FIX: Added missing size prop to Button component
                                <Button
                                    key={num}
                                    variant={availableDays === num ? 'default' : 'outline'}
                                    size="default"
                                    onClick={() => setAvailableDays(num)}
                                >
                                    {num}
                                </Button>
                            ))}
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Lugar de Entrenamiento</Label>
                        <div className="flex gap-2 flex-wrap">
                            {(['gym', 'home', 'outdoor'] as TrainingLocation[]).map(loc => (
                                // FIX: Added missing size prop to Button component
                                <Button
                                    key={loc}
                                    variant={trainingLocation === loc ? 'default' : 'outline'}
                                    size="default"
                                    onClick={() => setTrainingLocation(loc)}
                                    className="capitalize"
                                >
                                   {loc === 'gym' ? 'Gimnasio' : loc === 'home' ? 'Casa' : 'Aire Libre'}
                                </Button>
                            ))}
                        </div>
                    </div>
                </CardContent>
            </Card>

             <Card className={formErrors.primaryGoal ? 'border-red-500' : ''}>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Star className="h-5 w-5" />
                        Objetivo Principal
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                     <div className="flex gap-2 flex-wrap">
                        {Object.keys(goals).map((goal) => (
                            <Button
                                key={goal}
                                variant={primaryGoal === goal ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => handlePrimaryGoalSelect(goal)}
                            >
                                {goalLabels[goal]}
                            </Button>
                        ))}
                    </div>
                    {formErrors.primaryGoal && <p className="text-sm text-red-600 mt-1">{formErrors.primaryGoal}</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Dumbbell className="h-5 w-5" />
                        Objetivos Secundarios
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                    {Object.entries(goals).map(([goal, selected]) => (
                        <div key={goal} className="flex items-center space-x-2">
                            <Button
                                variant={selected ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleGoal(goal)}
                                className="capitalize w-28 text-left justify-start"
                                disabled={goal === primaryGoal}
                            >
                                {goalLabels[goal]}
                            </Button>
                            <span className="text-sm text-muted-foreground">
                                {selected && (
                                    goal === 'strength' ? 'Fuerza (3-6 reps)' :
                                    goal === 'hypertrophy' ? 'Hipertrofia (8-12 reps)' :
                                    goal === 'endurance' ? 'Resistencia (15-20 reps)' :
                                    goal === 'mobility' ? 'Movilidad (10-15 reps)' :
                                    goal === 'definition' ? 'Definición' :
                                    goal === 'cardio' ? 'Salud Cardiovascular (ej. HIIT, LISS)' : ''
                                )}
                            </span>
                        </div>
                    ))}
                    {formErrors.goals && <p className="text-sm text-red-600 mt-1">{formErrors.goals}</p>}
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <MoveRight className="h-5 w-5" />
                        Equipamiento Disponible
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    {/* Dumbbells */}
                    <div>
                        <Button
                            variant={equipment.dumbbells.available ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleComplexEquipment('dumbbells')}
                            className="w-full justify-start capitalize"
                        >
                            Mancuernas
                        </Button>
                        {equipment.dumbbells.available && (
                            <div className="pl-4 mt-2 space-y-2 border-l-2 ml-2">
                                <Label className="text-xs text-muted-foreground">Tipo de Mancuernas</Label>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={equipment.dumbbells.type === 'fixed' ? 'secondary' : 'ghost'}
                                        onClick={() => setDumbbellType('fixed')}
                                    >
                                        Peso Fijo
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={equipment.dumbbells.type === 'adjustable' ? 'secondary' : 'ghost'}
                                        onClick={() => setDumbbellType('adjustable')}
                                    >
                                        Ajustables
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Barbell */}
                    <div>
                        <Button
                            variant={equipment.barbell.available ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => toggleComplexEquipment('barbell')}
                            className="w-full justify-start capitalize"
                        >
                            Barra
                        </Button>
                        {equipment.barbell.available && (
                            <div className="pl-4 mt-2 space-y-2 border-l-2 ml-2">
                                <Label className="text-xs text-muted-foreground">Tipo de Barra</Label>
                                <div className="flex gap-2">
                                    <Button
                                        size="sm"
                                        variant={equipment.barbell.type === 'olympic' ? 'secondary' : 'ghost'}
                                        onClick={() => setBarbellType('olympic')}
                                    >
                                        Olímpica
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant={equipment.barbell.type === 'standard' ? 'secondary' : 'ghost'}
                                        onClick={() => setBarbellType('standard')}
                                    >
                                        Estándar
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Other Equipment */}
                    <div className="grid grid-cols-2 gap-2 pt-2">
                        {(Object.keys(equipment) as Array<keyof Equipment>).filter(k => k !== 'dumbbells' && k !== 'barbell').map((equip) => (
                            <Button
                                key={equip}
                                variant={equipment[equip as keyof Omit<Equipment, 'dumbbells' | 'barbell'>] ? 'default' : 'outline'}
                                size="sm"
                                onClick={() => toggleSimpleEquipment(equip as keyof Omit<Equipment, 'dumbbells' | 'barbell'>)}
                                className="capitalize"
                            >
                                {equipmentLabels[equip] || equip}
                            </Button>
                        ))}
                    </div>
                </CardContent>
            </Card>


            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <AlertTriangle className="h-5 w-5" />
                        Historial de Lesiones
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Label>¿Tienes lesiones previas?</Label>
                        <Button
                            variant={injuryHistory.hasInjuries ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => setInjuryHistory({ ...injuryHistory, hasInjuries: !injuryHistory.hasInjuries })}
                        >
                            {injuryHistory.hasInjuries ? 'Sí' : 'No'}
                        </Button>
                    </div>
                    {injuryHistory.hasInjuries && (
                        <div className="space-y-2">
                            <Label htmlFor="injuries">Describe tus lesiones</Label>
                            <Input
                                id="injuries"
                                placeholder="Ej: Dolor lumbar crónico..."
                                value={injuryHistory.injuries}
                                onChange={(e) => setInjuryHistory({ ...injuryHistory, injuries: e.target.value })}
                                className={formErrors.injuries ? 'border-red-500' : ''}
                            />
                            {formErrors.injuries && <p className="text-sm text-red-600 mt-1">{formErrors.injuries}</p>}
                        </div>
                    )}
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Gauge className="h-5 w-5" />
                        Progresión Anterior
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <Textarea
                        placeholder="Describe tu rutina anterior, progresos, etc."
                        value={previousProgress}
                        onChange={(e) => setPreviousProgress(e.target.value)}
                        rows={3}
                    />
                </CardContent>
            </Card>

            {/* FIX: Added missing variant prop to Button component */}
            <Button
                onClick={onGenerate}
                disabled={isGenerating}
                className="w-full"
                size="lg"
                variant="default"
            >
                {isGenerating ? 'Generando Rutina...' : 'Generar Rutina Personalizada'}
            </Button>
        </>
    );
}