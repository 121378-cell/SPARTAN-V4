"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Input, Label } from "./ui";
import { ArrowLeft, Ruler } from "lucide-react";
import type { BodyMeasurement } from "../lib/types";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";


interface BodyMeasurementScreenProps {
    onBack: () => void;
    measurements: BodyMeasurement[];
    setMeasurements: (measurements: BodyMeasurement[]) => void;
}

const initialFormState: Omit<BodyMeasurement, 'date'> = {
    weight: undefined,
    chest: undefined,
    waist: undefined,
    hips: undefined,
    biceps: undefined,
};

type MeasurementKey = keyof typeof initialFormState;

export default function BodyMeasurementScreen({ onBack, measurements, setMeasurements }: BodyMeasurementScreenProps) {
    const [formData, setFormData] = useState<Omit<BodyMeasurement, 'date'>>(initialFormState);
    const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
    const [chartMetric, setChartMetric] = useState<MeasurementKey>('weight');

    const handleInputChange = (field: MeasurementKey, value: string) => {
        const numValue = value === '' ? undefined : parseFloat(value);
        setFormData(prev => ({ ...prev, [field]: numValue }));
    };

    const handleAddMeasurement = () => {
        if (Object.values(formData).every(v => v === undefined || isNaN(v))) {
            alert("Por favor, introduce al menos una medida.");
            return;
        }

        const newMeasurement: BodyMeasurement = {
            date,
            ...formData,
        };

        const existingIndex = measurements.findIndex(m => m.date === date);
        if (existingIndex > -1) {
            // Update existing entry for the same date
            const updatedMeasurements = [...measurements];
            updatedMeasurements[existingIndex] = { ...updatedMeasurements[existingIndex], ...newMeasurement };
            setMeasurements(updatedMeasurements);
        } else {
            // Add new entry and sort
            const updatedMeasurements = [...measurements, newMeasurement].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
            setMeasurements(updatedMeasurements);
        }

        setFormData(initialFormState);
    };
    
    const chartData = measurements.map(m => ({
        date: new Date(m.date).toLocaleDateString('es-ES', { month: 'short', day: 'numeric' }),
        value: m[chartMetric]
    })).filter(d => d.value !== undefined);

    const measurementLabels: Record<MeasurementKey, string> = {
        weight: "Peso (kg)",
        chest: "Pecho (cm)",
        waist: "Cintura (cm)",
        hips: "Caderas (cm)",
        biceps: "Bíceps (cm)",
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Seguimiento de Medidas Corporales</h1>
                        <p className="text-muted-foreground mt-1">Registra y visualiza tu progreso físico.</p>
                    </div>
                    <Button variant="outline" size="default" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Volver al Panel
                    </Button>
                </div>
                
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    {/* Add Measurement Form */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Añadir Nueva Medida</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="space-y-2">
                                    <Label htmlFor="measurement-date">Fecha</Label>
                                    <Input id="measurement-date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                                </div>
                                {Object.keys(measurementLabels).map((key) => (
                                    <div key={key} className="space-y-2">
                                        <Label htmlFor={`measurement-${key}`}>{measurementLabels[key as MeasurementKey]}</Label>
                                        <Input
                                            id={`measurement-${key}`}
                                            type="number"
                                            placeholder="0.0"
                                            value={formData[key as MeasurementKey] || ''}
                                            onChange={(e) => handleInputChange(key as MeasurementKey, e.target.value)}
                                        />
                                    </div>
                                ))}
                            </CardContent>
                            <CardFooter>
                                <Button className="w-full" size="default" variant="default" onClick={handleAddMeasurement}>
                                    Guardar Medida
                                </Button>
                            </CardFooter>
                        </Card>
                    </div>
                    
                    {/* Progress Visualization & History */}
                    <div className="lg:col-span-2 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Progreso de Medidas</CardTitle>
                                <CardDescription>Visualiza la tendencia de tus mediciones a lo largo del tiempo.</CardDescription>
                                <div className="flex flex-wrap gap-2 pt-3">
                                    {Object.keys(measurementLabels).map(key => (
                                        <Button
                                            key={key}
                                            variant={chartMetric === key ? 'default' : 'outline'}
                                            size="sm"
                                            onClick={() => setChartMetric(key as MeasurementKey)}
                                        >
                                            {measurementLabels[key as MeasurementKey].split(' ')[0]}
                                        </Button>
                                    ))}
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="h-80">
                                {chartData.length > 1 ? (
                                    <ResponsiveContainer width="100%" height="100%">
                                        <LineChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                                            <CartesianGrid strokeDasharray="3 3" />
                                            <XAxis dataKey="date" />
                                            <YAxis domain={['dataMin - 2', 'dataMax + 2']} />
                                            <Tooltip />
                                            <Legend />
                                            <Line type="monotone" dataKey="value" name={measurementLabels[chartMetric]} stroke="#8884d8" strokeWidth={2} activeDot={{ r: 8 }} />
                                        </LineChart>
                                    </ResponsiveContainer>
                                ) : (
                                    <div className="flex items-center justify-center h-full text-center text-muted-foreground">
                                        <div className="space-y-2">
                                            <Ruler className="h-8 w-8 mx-auto" />
                                            <p>Se necesitan al menos dos puntos de datos para mostrar un gráfico.</p>
                                        </div>
                                    </div>
                                )}
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Historial de Medidas</CardTitle>
                            </CardHeader>
                            <CardContent>
                                {measurements.length > 0 ? (
                                    <div className="overflow-x-auto">
                                        <table className="w-full text-sm text-left">
                                            <thead className="bg-secondary">
                                                <tr>
                                                    <th className="p-2">Fecha</th>
                                                    {Object.keys(measurementLabels).map(key => (
                                                        <th key={key} className="p-2 text-right">{measurementLabels[key as MeasurementKey].split(' ')[0]}</th>
                                                    ))}
                                                </tr>
                                            </thead>
                                            <tbody>
                                            {[...measurements].reverse().map((m) => (
                                                <tr key={m.date} className="border-b">
                                                    <td className="p-2 font-medium">{new Date(m.date).toLocaleDateString('es-ES')}</td>
                                                    <td className="p-2 text-right">{m.weight ?? '-'}</td>
                                                    <td className="p-2 text-right">{m.chest ?? '-'}</td>
                                                    <td className="p-2 text-right">{m.waist ?? '-'}</td>
                                                    <td className="p-2 text-right">{m.hips ?? '-'}</td>
                                                    <td className="p-2 text-right">{m.biceps ?? '-'}</td>
                                                </tr>
                                            ))}
                                            </tbody>
                                        </table>
                                    </div>
                                ) : (
                                    <p className="text-center text-muted-foreground py-8">Aún no has registrado ninguna medida.</p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}