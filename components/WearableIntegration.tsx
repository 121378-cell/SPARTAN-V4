"use client";

import { useState, useEffect } from "react";
import { Button, Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter, Progress } from "./ui";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { Activity, HeartPulse, Moon, BatteryFull, Zap, AlertCircle, TrendingUp, TrendingDown, ArrowLeft } from "lucide-react";

interface WearableIntegrationProps {
    onBack: () => void;
}

type WearableData = {
  source: 'garmin' | 'apple' | 'fitbit' | 'oura' | 'whoop';
  sleep: {
    duration: number; // in minutes
    quality: number; // 1-100
    deepSleep: number; // minutes
    remSleep: number; // minutes
    wakeTimes: number;
    bedtime: string;
    wakeTime: string;
  };
  activity: {
    steps: number;
    calories: number;
    activeMinutes: number;
    workoutType?: string;
    workoutDuration?: number;
  };
  recovery: {
    hrv: number; // Heart Rate Variability
    restingHeartRate: number;
    readiness?: number; // Oura/Whoop
    stress: number; // 1-100
  };
  lastSync: string;
};

type Recommendation = {
  type: 'sleep' | 'activity' | 'nutrition' | 'recovery';
  priority: 'high' | 'medium' | 'low';
  message: string;
  action?: string;
  icon: JSX.Element;
};

export default function WearableIntegration({ onBack }: WearableIntegrationProps) {
  const [connectedDevices, setConnectedDevices] = useState<string[]>([]);
  const [selectedDevice, setSelectedDevice] = useState<string | null>(null);
  const [wearableData, setWearableData] = useState<WearableData | null>(null);
  const [loading, setLoading] = useState(false);
  const [recommendations, setRecommendations] = useState<Recommendation[]>([]);
  const [timeframe, setTimeframe] = useState<'24h' | '7d' | '30d'>('24h');
  const [healthData, setHealthData] = useState<any[]>([]);

  // Simulate connecting to wearable devices
  useEffect(() => {
    const devices = ['Garmin Forerunner 955', 'Apple Watch Series 8', 'Oura Ring Gen3'];
    setConnectedDevices(devices);
    setSelectedDevice(devices[0]);
  }, []);

  // Simulate fetching data from the wearable
  useEffect(() => {
    if (!selectedDevice) return;

    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      let data: WearableData;
      
      if (selectedDevice.includes('Garmin')) {
        data = {
          source: 'garmin',
          sleep: { duration: 420, quality: 85, deepSleep: 120, remSleep: 90, wakeTimes: 3, bedtime: '22:45', wakeTime: '06:45' },
          activity: { steps: 12450, calories: 2800, activeMinutes: 120, workoutType: 'Running', workoutDuration: 45 },
          recovery: { hrv: 65, restingHeartRate: 48, stress: 32 },
          lastSync: new Date().toISOString()
        };
      } else if (selectedDevice.includes('Apple')) {
        data = {
          source: 'apple',
          sleep: { duration: 390, quality: 78, deepSleep: 95, remSleep: 85, wakeTimes: 5, bedtime: '23:30', wakeTime: '07:00' },
          activity: { steps: 8900, calories: 2400, activeMinutes: 90, workoutType: 'HIIT', workoutDuration: 30 },
          recovery: { hrv: 58, restingHeartRate: 52, stress: 45 },
          lastSync: new Date().toISOString()
        };
      } else { // Oura
        data = {
          source: 'oura',
          sleep: { duration: 450, quality: 92, deepSleep: 130, remSleep: 110, wakeTimes: 2, bedtime: '22:15', wakeTime: '06:45' },
          activity: { steps: 7500, calories: 2100, activeMinutes: 60 },
          recovery: { hrv: 72, restingHeartRate: 46, readiness: 88, stress: 25 },
          lastSync: new Date().toISOString()
        };
      }
      
      setWearableData(data);
      generateRecommendations(data);
      generateHistoricalData();
      setLoading(false);
    }, 1000);
  }, [selectedDevice, timeframe]);

  const generateRecommendations = (data: WearableData) => {
    const recs: Recommendation[] = [];
    
    if (data.sleep.duration < 420) {
      recs.push({ type: 'sleep', priority: 'high', message: `You only slept ${Math.floor(data.sleep.duration/60)}h ${data.sleep.duration%60}m. Try to go to bed 30-60 minutes earlier tonight.`, action: 'Set a bedtime reminder alarm.', icon: <Moon className="h-4 w-4" /> });
    }
    if (data.recovery.hrv < 50) {
      recs.push({ type: 'recovery', priority: 'high', message: `Your HRV (${data.recovery.hrv}ms) is low, indicating possible accumulated stress. Prioritize recovery today.`, action: 'Try breathing techniques or meditation.', icon: <AlertCircle className="h-4 w-4" /> });
    }
    if (data.activity.steps < 8000) {
        recs.push({ type: 'activity', priority: 'medium', message: `You've only taken ${data.activity.steps} steps today. Try a short walk this afternoon.`, icon: <TrendingUp className="h-4 w-4" /> });
    }
    if (data.recovery.restingHeartRate > 60) {
        recs.push({ type: 'recovery', priority: 'medium', message: `Your resting heart rate (${data.recovery.restingHeartRate}bpm) is elevated. Consider an active rest day.`, icon: <HeartPulse className="h-4 w-4" /> });
    }
    if (recs.length === 0) {
      recs.push({ type: 'recovery', priority: 'low', message: "Your metrics are in a good range! Keep up your current routine.", icon: <Zap className="h-4 w-4" /> });
    }
    setRecommendations(recs);
  };

  const generateHistoricalData = () => {
    const data = [];
    const now = new Date();
    for (let i = 0; i < 7; i++) {
      const date = new Date();
      date.setDate(now.getDate() - (6 - i));
      data.push({
        date: date.toLocaleDateString('en-US', { weekday: 'short' }),
        sleepDuration: Math.floor(Math.random() * 60) + 360,
        hrv: Math.floor(Math.random() * 30) + 50,
        steps: Math.floor(Math.random() * 5000) + 7000,
      });
    }
    setHealthData(data);
  };

  const connectNewDevice = () => {
    alert(`Connecting to a new device... In a real app, this would open the authentication flow.`);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4 md:p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-start mb-6">
            <div>
                <h1 className="text-3xl font-bold">Wearable Integration</h1>
                <p className="text-muted-foreground mt-1">
                  Advanced analysis of your sleep, activity, and recovery data.
                </p>
            </div>
            <Button variant="outline" size="default" onClick={onBack}>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back
            </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Connected Device</CardTitle>
            <CardDescription>Select the wearable you want to see data from.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-3">
              {connectedDevices.map(device => (
                <Button key={device} variant={selectedDevice === device ? 'default' : 'outline'} size="default" onClick={() => setSelectedDevice(device)}>{device}</Button>
              ))}
              <Button variant="outline" size="default" onClick={connectNewDevice}>+ Connect new device</Button>
            </div>
          </CardContent>
        </Card>
        
        {loading ? (
          <Card><CardContent className="py-12 text-center"><p>Loading data from {selectedDevice}...</p><Progress value={50} className="mt-4 w-full" /></CardContent></Card>
        ) : wearableData ? (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm font-medium"><Moon className="h-4 w-4" />Sleep</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{Math.floor(wearableData.sleep.duration/60)}h{wearableData.sleep.duration%60}m</div><div className="text-sm text-muted-foreground">Quality: {wearableData.sleep.quality}/100</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm font-medium"><Activity className="h-4 w-4" />Activity</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{wearableData.activity.steps.toLocaleString()}</div><div className="text-sm text-muted-foreground">{wearableData.activity.calories} kcal</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm font-medium"><HeartPulse className="h-4 w-4" />Heart Rate</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{wearableData.recovery.restingHeartRate} bpm</div><div className="text-sm text-muted-foreground">HRV: {wearableData.recovery.hrv}ms</div></CardContent></Card>
              <Card><CardHeader className="pb-2"><CardTitle className="flex items-center gap-2 text-sm font-medium"><BatteryFull className="h-4 w-4" />Recovery</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{wearableData.recovery.readiness || Math.floor((wearableData.recovery.hrv / 70) * 10) }/10</div><div className="text-sm text-muted-foreground">Stress: {wearableData.recovery.stress}/100</div></CardContent></Card>
            </div>
            
            <Card>
              <CardHeader><CardTitle>Personalized Recommendations</CardTitle><CardDescription>Based on your data from the last few days.</CardDescription></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recommendations.map((rec, idx) => (
                    <div key={idx} className={`flex items-start gap-3 p-3 rounded-lg ${ rec.priority === 'high' ? 'bg-red-100 border border-red-200' : rec.priority === 'medium' ? 'bg-yellow-100 border border-yellow-200' : 'bg-green-100 border border-green-200' }`}>
                      <div className={`p-2 rounded-full ${ rec.priority === 'high' ? 'bg-red-100 text-red-600' : rec.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800' }`}>{rec.icon}</div>
                      <div className="flex-1"><p className="font-medium">{rec.message}</p>{rec.action && (<p className="text-sm text-muted-foreground mt-1">{rec.action}</p>)}</div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center"><CardTitle>Trends</CardTitle>
                  <div className="flex gap-2">
                    <Button variant={timeframe === '24h' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('24h')}>24h</Button>
                    <Button variant={timeframe === '7d' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('7d')}>7d</Button>
                    <Button variant={timeframe === '30d' ? 'default' : 'outline'} size="sm" onClick={() => setTimeframe('30d')}>30d</Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="h-80">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={healthData}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e0e0e0" /><XAxis dataKey="date" /><YAxis yAxisId="left" orientation="left" stroke="#8884d8" /><YAxis yAxisId="right" orientation="right" stroke="#82ca9d" /><Tooltip /><Legend />
                      <Line yAxisId="left" type="monotone" dataKey="sleepDuration" name="Sleep (min)" stroke="#8884d8" strokeWidth={2} activeDot={{ r: 6 }} />
                      <Line yAxisId="right" type="monotone" dataKey="hrv" name="HRV (ms)" stroke="#82ca9d" strokeWidth={2} />
                      <Line yAxisId="left" type="monotone" dataKey="steps" name="Steps" stroke="#ffc658" strokeWidth={2} />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card><CardHeader><CardTitle className="flex items-center gap-2"><Moon className="h-5 w-5" />Sleep Analysis</CardTitle></CardHeader><CardContent><div className="space-y-4"><div className="flex justify-between"><span className="text-muted-foreground">Bedtime:</span><span className="font-medium">{wearableData.sleep.bedtime}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Wake time:</span><span className="font-medium">{wearableData.sleep.wakeTime}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Deep sleep:</span><span className="font-medium">{wearableData.sleep.deepSleep} mins ({Math.round((wearableData.sleep.deepSleep/wearableData.sleep.duration)*100)}%)</span></div><div className="flex justify-between"><span className="text-muted-foreground">REM sleep:</span><span className="font-medium">{wearableData.sleep.remSleep} mins ({Math.round((wearableData.sleep.remSleep/wearableData.sleep.duration)*100)}%)</span></div><div className="flex justify-between"><span className="text-muted-foreground">Times awake:</span><span className="font-medium">{wearableData.sleep.wakeTimes}</span></div></div></CardContent><CardFooter><Button variant="outline" size="default" className="w-full">View full details</Button></CardFooter></Card>
              <Card><CardHeader><CardTitle className="flex items-center gap-2"><Activity className="h-5 w-5" />Activity Analysis</CardTitle></CardHeader><CardContent><div className="space-y-4"><div className="flex justify-between"><span className="text-muted-foreground">Total steps:</span><span className="font-medium">{wearableData.activity.steps.toLocaleString()}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Calories burned:</span><span className="font-medium">{wearableData.activity.calories}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Active minutes:</span><span className="font-medium">{wearableData.activity.activeMinutes}</span></div>{wearableData.activity.workoutType && (<div className="flex justify-between"><span className="text-muted-foreground">Workout:</span><span className="font-medium">{wearableData.activity.workoutType} ({wearableData.activity.workoutDuration} mins)</span></div>)}<div className="flex justify-between"><span className="text-muted-foreground">Intensity:</span><span className="font-medium">{wearableData.activity.steps > 12000 ? 'High' : wearableData.activity.steps > 8000 ? 'Moderate' : 'Low'}</span></div></div></CardContent><CardFooter><Button variant="outline" size="default" className="w-full">View full details</Button></CardFooter></Card>
            </div>
          </div>
        ) : (
          <Card><CardContent className="py-12 text-center"><p>Select a wearable device to view your data</p></CardContent></Card>
        )}
      </div>
    </div>
  );
}