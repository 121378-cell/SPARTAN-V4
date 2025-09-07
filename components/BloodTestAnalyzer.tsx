"use client";

import { useState } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, Input, Label, Badge, Alert, AlertTitle, AlertDescription } from "./ui";
import { ArrowLeft, Droplets, FlaskConical, Sparkles, AlertTriangle, Pill, Apple, Dumbbell } from "lucide-react";
import { analyzeBloodTestApi } from "../lib/api";
import type { BloodTestAnalysis, AnalyzedMarker } from "../lib/types";

interface BloodTestAnalyzerProps {
    onBack: () => void;
}

const initialBiomarkers = {
    'Testosterone': { value: '', unit: 'ng/dL' },
    'Free Testosterone': { value: '', unit: 'pg/mL' },
    'Cortisol': { value: '', unit: 'µg/dL' },
    'Vitamin D': { value: '', unit: 'ng/mL' },
    'HDL Cholesterol': { value: '', unit: 'mg/dL' },
    'LDL Cholesterol': { value: '', unit: 'mg/dL' },
    'Triglycerides': { value: '', unit: 'mg/dL' },
    'Fasting Glucose': { value: '', unit: 'mg/dL' },
    'HbA1c': { value: '', unit: '%' },
    'Ferritin': { value: '', unit: 'ng/mL' },
};

export default function BloodTestAnalyzer({ onBack }: BloodTestAnalyzerProps) {
    const [biomarkers, setBiomarkers] = useState(initialBiomarkers);
    const [analysis, setAnalysis] = useState<BloodTestAnalysis | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = (marker: string, value: string) => {
        setBiomarkers(prev => ({
            ...prev,
            [marker]: { ...prev[marker], value }
        }));
    };

    const handleAnalyze = async () => {
        const filledMarkers = Object.entries(biomarkers)
            .filter(([_, data]) => data.value.trim() !== '')
            .reduce((acc, [key, data]) => {
                acc[key] = `${data.value} ${data.unit}`;
                return acc;
            }, {} as Record<string, string>);

        if (Object.keys(filledMarkers).length === 0) {
            setError("Please enter at least one biomarker value to analyze.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setAnalysis(null);

        try {
            const result = await analyzeBloodTestApi(filledMarkers);
            setAnalysis(result);
        } catch (e) {
            console.error("Analysis failed:", e);
            setError("Failed to analyze the results. Please check your connection and try again.");
        } finally {
            setIsLoading(false);
        }
    };
    
    const getStatusColor = (status: AnalyzedMarker['status']) => {
        switch (status) {
            case 'Optimal': return 'bg-green-100 text-green-800 border-green-200';
            case 'Borderline': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'High':
            case 'Low':
                return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const recommendationIcons = {
        nutrition: <Apple className="h-5 w-5 text-green-600" />,
        supplements: <Pill className="h-5 w-5 text-blue-600" />,
        lifestyle: <Dumbbell className="h-5 w-5 text-purple-600" />,
    };

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Blood Test Analyzer</h1>
                        <p className="text-muted-foreground mt-1">Get AI-powered insights from your lab results.</p>
                    </div>
                    <Button variant="outline" size="default" onClick={onBack}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Dashboard
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* Input Form */}
                    <div className="md:col-span-1 space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FlaskConical className="h-5 w-5" />
                                    Enter Your Results
                                </CardTitle>
                                <CardDescription>Input the values from your recent blood test.</CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                {Object.entries(biomarkers).map(([marker, data]) => (
                                    <div key={marker} className="space-y-2">
                                        <Label htmlFor={marker}>{marker}</Label>
                                        <div className="flex items-center">
                                            <Input
                                                id={marker}
                                                type="number"
                                                placeholder="e.g., 550"
                                                value={data.value}
                                                onChange={(e) => handleInputChange(marker, e.target.value)}
                                                className="rounded-r-none"
                                            />
                                            <span className="bg-gray-100 border border-l-0 border-gray-300 px-3 py-2 text-sm text-muted-foreground rounded-r-md">
                                                {data.unit}
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                        {/* FIX: Added missing variant prop to Button component */}
                        <Button onClick={handleAnalyze} disabled={isLoading} size="lg" className="w-full" variant="default">
                            {isLoading ? 'Analyzing...' : <><Sparkles className="h-4 w-4 mr-2" />Analyze with AI</>}
                        </Button>
                    </div>

                    {/* Results Display */}
                    <div className="md:col-span-2 space-y-6">
                        {isLoading && (
                            <Card>
                                <CardContent className="py-24 text-center">
                                    <Droplets className="h-10 w-10 mx-auto animate-bounce text-primary" />
                                    <p className="mt-4 text-muted-foreground">Analyzing your biomarkers...</p>
                                </CardContent>
                            </Card>
                        )}

                        {error && (
                             <Alert variant="destructive">
                                <AlertTriangle className="h-4 w-4" />
                                <div>
                                    <AlertTitle>Analysis Error</AlertTitle>
                                    <AlertDescription>{error}</AlertDescription>
                                </div>
                            </Alert>
                        )}
                        
                        {!isLoading && !analysis && !error && (
                            <Card>
                                <CardContent className="py-24 text-center">
                                    <p className="text-muted-foreground">Your AI-powered analysis will appear here.</p>
                                </CardContent>
                            </Card>
                        )}

                        {analysis && (
                            <div className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Analysis Summary</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">{analysis.summary}</p>
                                    </CardContent>
                                </Card>
                                
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Biomarker Breakdown</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        {analysis.analyzedMarkers.map(marker => (
                                            <div key={marker.name} className="border rounded-lg p-4">
                                                <div className="flex justify-between items-start">
                                                    <h3 className="font-semibold">{marker.name}</h3>
                                                    <Badge variant="secondary" className={getStatusColor(marker.status)}>{marker.status}</Badge>
                                                </div>
                                                <div className="text-sm text-muted-foreground mt-1">
                                                    Your Value: <span className="font-medium text-primary">{marker.value} {marker.unit}</span>
                                                    <span className="mx-2">|</span>
                                                    Optimal Range: <span className="font-medium text-primary">{marker.optimalRange}</span>
                                                </div>
                                                <p className="mt-2 text-sm">{marker.interpretation}</p>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader>
                                        <CardTitle>Actionable Recommendations</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-6">
                                        {Object.entries(analysis.recommendations).map(([category, items]) => (
                                            <div key={category}>
                                                <h3 className="font-semibold text-lg flex items-center gap-2 mb-2 capitalize">
                                                    {recommendationIcons[category as keyof typeof recommendationIcons]}
                                                    {category === 'lifestyle' ? 'Lifestyle & Training' : category}
                                                </h3>
                                                <ul className="list-disc pl-5 space-y-1 text-muted-foreground">
                                                    {(items as string[]).map((item, index) => (
                                                        <li key={index}>{item}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        ))}
                                    </CardContent>
                                </Card>
                                
                                <Alert variant="default">
                                    <AlertTriangle className="h-4 w-4" />
                                    <div>
                                        <AlertTitle>Disclaimer</AlertTitle>
                                        <AlertDescription>{analysis.disclaimer}</AlertDescription>
                                    </div>
                                </Alert>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}