const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/shared/PageHeader";
import { Dumbbell, Loader2, Sparkles, CheckCircle2, Play, History, Flame, Clock } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const WORKOUT_TYPES = [
  { key: "home", label: "Home Workout" },
  { key: "gym", label: "Gym Workout" },
  { key: "yoga", label: "Yoga" },
  { key: "cardio", label: "Cardio" },
  { key: "walking", label: "Walking" },
  { key: "strength", label: "Strength Training" },
  { key: "stretching", label: "Stretching" },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function ExercisePlanner() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [type, setType] = useState("home");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);

  const { data: profiles } = useQuery({
    queryKey: ["health-profiles"],
    queryFn: () => db.entities.HealthProfile.filter({ created_by_id: user?.id }, "-created_date", 1),
    enabled: !!user?.id,
  });
  const profile = profiles?.[0];

  const { data: workouts } = useQuery({
    queryKey: ["workout-plans"],
    queryFn: () => db.entities.WorkoutPlan.filter({ created_by_id: user?.id }, "-plan_date", 20),
    enabled: !!user?.id,
  });
  const { data: exerciseLogs } = useQuery({
    queryKey: ["exercise-logs"],
    queryFn: () => db.entities.ExerciseLog.filter({ created_by_id: user?.id }, "-log_date", 30),
    enabled: !!user?.id,
  });

  const savePlan = useMutation({
    mutationFn: (data) => db.entities.WorkoutPlan.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["workout-plans"] }),
  });
  const logWorkout = useMutation({
    mutationFn: (data) => db.entities.ExerciseLog.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["exercise-logs"] }),
  });

  const generate = async () => {
    setLoading(true);
    setSaved(false);
    try {
      const ctx = profile ? `User: age ${profile.age}, BMI ${profile.bmi || "—"}, exercise ${profile.exercise_frequency}. ` : "";
      const res = await db.integrations.Core.InvokeLLM({
        prompt: `${ctx}Generate a ${type} workout plan with 5-7 exercises. Each exercise has name, sets/reps, and duration. Include total duration (min), calories burned, and form notes. Return JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            exercises: { type: "array", items: { type: "object", properties: { name: { type: "string" }, sets: { type: "string" }, duration: { type: "string" } } } },
            duration: { type: "number" }, calories_burned: { type: "number" }, notes: { type: "string" },
          },
        },
      });
      setPlan({ ...res, plan_type: type, plan_date: todayStr() });
    } catch {
      setPlan(null);
    }
    setLoading(false);
  };

  const save = () => {
    if (!plan) return;
    savePlan.mutate(plan);
    setSaved(true);
  };

  const complete = () => {
    logWorkout.mutate({ log_date: todayStr(), workout_type: plan.plan_type, duration_min: plan.duration, calories_burned: plan.calories_burned });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="AI Exercise Planner" subtitle="Personalized workout plans with guided videos" icon={Dumbbell} />

      <Card className="glass-card border-border/50">
        <CardHeader><CardTitle className="text-base font-heading">Generate a Workout</CardTitle></CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs text-muted-foreground">Workout Type</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{WORKOUT_TYPES.map((w) => <SelectItem key={w.key} value={w.key}>{w.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button className="gradient-primary text-white rounded-xl" onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
            {loading ? "Generating..." : "Generate Plan"}
          </Button>
        </CardContent>
      </Card>

      {plan && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-heading">{WORKOUT_TYPES.find((w) => w.key === plan.plan_type)?.label}</CardTitle>
              <div className="flex gap-2">
                <Button size="sm" variant="outline" onClick={save} disabled={savePlan.isPending || saved}>
                  {saved ? <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-green-500" /> : null} {saved ? "Saved" : "Save"}
                </Button>
                <Button size="sm" className="gradient-primary text-white rounded-lg" onClick={complete} disabled={logWorkout.isPending}>
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Mark Complete
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-orange-500/10 text-center">
                  <Clock className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{plan.duration || "—"}</p>
                  <p className="text-[10px] text-muted-foreground">minutes</p>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 text-center">
                  <Flame className="w-4 h-4 text-red-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{plan.calories_burned || "—"}</p>
                  <p className="text-[10px] text-muted-foreground">kcal burned</p>
                </div>
              </div>
              <div className="space-y-2">
                {(plan.exercises || []).map((ex, i) => (
                  <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    className="flex items-center justify-between p-3 rounded-xl bg-muted/40">
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full gradient-primary text-white flex items-center justify-center text-[10px] font-bold">{i + 1}</span>
                      <div>
                        <p className="text-sm font-medium">{ex.name}</p>
                        <p className="text-[11px] text-muted-foreground">{ex.sets} · {ex.duration}</p>
                      </div>
                    </div>
                    <a href={`https://www.youtube.com/results?search_query=${encodeURIComponent(ex.name + " " + plan.plan_type + " exercise tutorial")}`} target="_blank" rel="noopener noreferrer"
                      className="flex items-center gap-1 text-xs text-primary hover:underline">
                      <Play className="w-3 h-3" /> Video
                    </a>
                  </motion.div>
                ))}
              </div>
              {plan.notes && <p className="text-xs text-muted-foreground italic p-3 rounded-lg bg-muted/30">💡 {plan.notes}</p>}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card className="glass-card border-border/50">
        <CardHeader><CardTitle className="text-base font-heading flex items-center gap-2"><History className="w-4 h-4 text-primary" /> Workout History</CardTitle></CardHeader>
        <CardContent>
          {(exerciseLogs || []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No workouts logged yet. Complete a plan to track your progress.</p>
          ) : (
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {[...(exerciseLogs || [])].reverse().map((e, i) => (
                <div key={e.id || i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 text-sm">
                  <span className="capitalize">{e.workout_type?.replace("_", " ")}</span>
                  <span className="text-xs text-muted-foreground">{format(new Date(e.log_date), "MMM d, yyyy")}</span>
                  <span className="text-xs">{e.duration_min || 0} min · {e.calories_burned || 0} kcal</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-3 gap-3">
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-[10px] text-muted-foreground">Total Workouts</p>
          <p className="text-2xl font-bold font-display">{(exerciseLogs || []).length}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-[10px] text-muted-foreground">Total Minutes</p>
          <p className="text-2xl font-bold font-display">{(exerciseLogs || []).reduce((s, e) => s + (e.duration_min || 0), 0)}</p>
        </div>
        <div className="glass-card rounded-2xl p-4 text-center">
          <p className="text-[10px] text-muted-foreground">Total Calories</p>
          <p className="text-2xl font-bold font-display">{(exerciseLogs || []).reduce((s, e) => s + (e.calories_burned || 0), 0)}</p>
        </div>
      </div>
    </div>
  );
}