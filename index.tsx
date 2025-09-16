"use client";

import { createRoot } from "react-dom/client";
import { BrowserRouter, Routes, Route, Navigate, Outlet } from "react-router-dom";
import { useAppStore } from "./lib/stores";

import AuthScreen from "./components/AuthScreen";
import Dashboard from "./components/Dashboard";
import ProfileScreen from "./components/ProfileScreen";
import WorkoutDetailScreen from "./components/WorkoutDetailScreen";
import WorkoutGeneratorScreen from "./components/WorkoutGeneratorScreen";
import ExerciseFormChecker from "./components/ExerciseFormChecker";
import RecipeGenerator from "./components/RecipeGenerator";
import CircadianRhythmPlanner from "./components/CircadianRhythmPlanner";
import WearableIntegration from "./components/WearableIntegration";
import BloodTestAnalyzer from "./components/BloodTestAnalyzer";
import OverloadDetection from "./components/OverloadDetection";
import WorkoutEditorScreen from "./components/WorkoutEditorScreen";
import BodyMeasurementScreen from "./components/BodyMeasurementScreen";
import NotificationsManager from "./components/NotificationsManager";

function AppLayout() {
  const { userData, workoutPlans } = useAppStore(state => ({
    userData: state.userData,
    workoutPlans: state.workoutPlans,
  }));

  return (
    <>
      <NotificationsManager 
        settings={userData.notificationSettings}
        hasActiveWorkout={workoutPlans.length > 0} 
      />
      <Outlet />
    </>
  );
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
    const isLoggedIn = useAppStore((state) => state.isLoggedIn);
    if (!isLoggedIn) {
        return <Navigate to="/auth" replace />;
    }
    return <>{children}</>;
}

export default function App() {
  return (
    <div className="app-container">
      <Routes>
        <Route path="/auth" element={<AuthScreen />} />
        
        <Route 
          path="/*"
          element={
            <ProtectedRoute>
              <Routes>
                <Route element={<AppLayout />}>
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/generator" element={<WorkoutGeneratorScreen />} />
                  <Route path="/profile" element={<ProfileScreen />} />
                  <Route path="/workout/:workoutId" element={<WorkoutDetailScreen />} />
                  <Route path="/workout/:workoutId/edit" element={<WorkoutEditorScreen />} />
                  <Route path="/workout/:workoutId/check-form/:exerciseName" element={<ExerciseFormChecker />} />
                  <Route path="/recipes" element={<RecipeGenerator />} />
                  <Route path="/circadian" element={<CircadianRhythmPlanner />} />
                  <Route path="/wearable" element={<WearableIntegration />} />
                  <Route path="/blood-test" element={<BloodTestAnalyzer />} />
                  <Route path="/overload" element={<OverloadDetection />} />
                  <Route path="/measurements" element={<BodyMeasurementScreen />} />

                  {/* Default route for logged-in users */}
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Route>
              </Routes>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  );
}

const container = document.getElementById('root');
if (container) {
  const root = createRoot(container);
  root.render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
}