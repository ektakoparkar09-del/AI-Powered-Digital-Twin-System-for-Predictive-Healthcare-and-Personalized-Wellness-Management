const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/lib/AuthContext";
import { calculateDiseaseRisks } from "@/lib/healthUtils";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { LineChart as LineIcon, Activity, Droplets, Moon, Dumbbell, Heart } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { format, subDays } from "date-fns";
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  RadarChart, Radar, PolarGrid, PolarAngleAxis, PolarRadiusAxis,
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";

const PIE_COLORS = ["#ef4444", "#f59e0b", "#8b5cf6", "#3b82f6", "#10b981", "#ec4899", "#06b6d4", "#f97316"];

export default function Trends() {
  const { user } = useAuth();

  const { data: snapshots } = useQuery({
    queryKey: ["health-snapshots"],
    queryFn: () => db.entities.HealthSnapshot.filter({ created_by_id: user?.id }, "-snapshot_date", 60),
    enabled: !!user?.id,
  });
  const { data: sleepLogs } = useQuery({
    queryKey: ["sleep-logs"],
    queryFn: () => db.entities.SleepLog.filter({ created_by_id: user?.id }, "-log_date", 30),
    enabled: !!user?.id,
  });
  const { data: waterLogs } = useQuery({
    queryKey: ["water-logs"],
    queryFn: () => db.entities.WaterLog.filter({ created_by_id: user?.id }, "-log_date", 30),
    enabled: !!user?.id,
  });
  const { data: exerciseLogs } = useQuery({
    queryKey: ["exercise-logs"],
    queryFn: () => db.entities.ExerciseLog.filter({ created_by_id: user?.id }, "-log_date", 30),
    enabled: !!user?.id,
  });
  const { data: profiles } = useQuery({
    queryKey: ["health-profiles"],
    queryFn: () => db.entities.HealthProfile.filter({ created_by_id: user?.id }, "-created_date", 1),
    enabled: !!user?.id,
  });
  const profile = profiles?.[0];

  const sorted = (snapshots || []).sort((a, b) => new Date(a.snapshot_date) - new Date(b.snapshot_date));
  const snapData = sorted.map((s) => ({
    date: format(new Date(s.snapshot_date), "MMM d"),
    bmi: s.bmi, weight: s.weight_kg, bp: s.blood_pressure_systolic, sugar: s.blood_sugar, score: s.health_score, heart: s.heart_rate,
  }));

  const last30 = useMemo(() => {
    const days = Array.from({ length: 30 }).map((_, i) => {
      const d = subDays(new Date(), 29 - i);
      const k = d.toISOString().slice(0, 10);
      return {
        date: format(d, "MMM d"),
        sleep: (sleepLogs || []).find((l) => l.log_date === k)?.hours || 0,
        water: (waterLogs || []).find((l) => l.log_date === k)?.glasses || 0,
        exercise: (exerciseLogs || []).find((l) => l.log_date === k)?.duration_min || 0,
      };
    });
    return days;
  }, [sleepLogs, waterLogs, exerciseLogs]);

  const riskData = useMemo(() => {
    const risks = calculateDiseaseRisks(profile);
    return Object.entries(risks)
      .filter(([, v]) => v >= 20)
      .map(([k, v]) => ({ name: k.replace(/_/g, " "), value: v }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 6);
  }, [profile]);

  const radarData = useMemo(() => {
    if (!profile) return [];
    const score = profile.health_score || 80;
    return [
      { metric: "Activity", value: profile.exercise_frequency === "none" ? 20 : 90 },
      { metric: "Sleep", value: profile.sleep_hours >= 7 ? 90 : 40 },
      { metric: "Diet", value: profile.diet_type === "fast_food" ? 30 : 80 },
      { metric: "Hydration", value: profile.water_intake_liters >= 2 ? 85 : 50 },
      { metric: "Stress", value: profile.stress_level === "high" ? 30 : 75 },
      { metric: "Health", value: score },
    ];
  }, [profile]);

  const hasData = sorted.length > 0 || last30.some((d) => d.sleep || d.water || d.exercise) || profile;

  if (!hasData) {
    return (
      <div className="space-y-6">
        <PageHeader title="Health Trends" subtitle="Interactive analytics across all your health metrics" icon={LineIcon} />
        <EmptyState icon={LineIcon} title="No trend data yet" description="Update your health profile and log sleep, water, and workouts to unlock rich trend analytics." ctaLabel="Update Profile" ctaTo="/profile" />
      </div>
    );
  }

  const chartCard = (title, icon, children) => (
    <Card className="glass-card border-border/50">
      <CardHeader><CardTitle className="text-sm font-heading flex items-center gap-2">{icon}{title}</CardTitle></CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
  const tip = { background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "11px" };

  return (
    <div className="space-y-6">
      <PageHeader title="Health Trends" subtitle="Interactive analytics across all your health metrics" icon={LineIcon} />

      {/* Vitals line charts */}
      <div className="grid md:grid-cols-2 gap-6">
        {chartCard("BMI & Weight Trend", <Activity className="w-4 h-4 text-primary" />,
          <div className="h-52"><ResponsiveContainer width="100%" height="100%">
            <LineChart data={snapData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={tip} /><Legend wrapperStyle={{ fontSize: 10 }} />
              <Line type="monotone" dataKey="bmi" stroke="#f59e0b" strokeWidth={2} dot={{ r: 2 }} />
              <Line type="monotone" dataKey="weight" stroke="#3b82f6" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer></div>
        )}
        {chartCard("Blood Pressure", <Heart className="w-4 h-4 text-red-500" />,
          <div className="h-52"><ResponsiveContainer width="100%" height="100%">
            <AreaChart data={snapData}>
              <defs><linearGradient id="bpG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} /><stop offset="95%" stopColor="#ef4444" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={tip} />
              <Area type="monotone" dataKey="bp" stroke="#ef4444" fill="url(#bpG)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer></div>
        )}
        {chartCard("Blood Sugar", <Activity className="w-4 h-4 text-orange-500" />,
          <div className="h-52"><ResponsiveContainer width="100%" height="100%">
            <LineChart data={snapData}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} /><YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={tip} />
              <Line type="monotone" dataKey="sugar" stroke="#f97316" strokeWidth={2} dot={{ r: 2 }} />
            </LineChart>
          </ResponsiveContainer></div>
        )}
        {chartCard("Health Score", <Activity className="w-4 h-4 text-green-500" />,
          <div className="h-52"><ResponsiveContainer width="100%" height="100%">
            <AreaChart data={snapData}>
              <defs><linearGradient id="sG" x1="0" y1="0" x2="0" y2="1"><stop offset="5%" stopColor="#10b981" stopOpacity={0.3} /><stop offset="95%" stopColor="#10b981" stopOpacity={0} /></linearGradient></defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 9 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={tip} />
              <Area type="monotone" dataKey="score" stroke="#10b981" fill="url(#sG)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer></div>
        )}
      </div>

      {/* Lifestyle bar charts */}
      <div className="grid md:grid-cols-3 gap-6">
        {chartCard("Sleep (hrs)", <Moon className="w-4 h-4 text-purple-500" />,
          <div className="h-44"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={last30.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 8 }} /><YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={tip} />
              <Bar dataKey="sleep" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer></div>
        )}
        {chartCard("Water (glasses)", <Droplets className="w-4 h-4 text-blue-500" />,
          <div className="h-44"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={last30.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 8 }} /><YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={tip} />
              <Bar dataKey="water" fill="#3b82f6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer></div>
        )}
        {chartCard("Exercise (min)", <Dumbbell className="w-4 h-4 text-green-500" />,
          <div className="h-44"><ResponsiveContainer width="100%" height="100%">
            <BarChart data={last30.slice(-14)}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
              <XAxis dataKey="date" tick={{ fontSize: 8 }} /><YAxis tick={{ fontSize: 9 }} />
              <Tooltip contentStyle={tip} />
              <Bar dataKey="exercise" fill="#10b981" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer></div>
        )}
      </div>

      {/* Disease risk pie + lifestyle radar */}
      <div className="grid md:grid-cols-2 gap-6">
        {chartCard("Disease Risk Distribution", <Heart className="w-4 h-4 text-red-500" />,
          riskData.length ? (
            <div className="h-64"><ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={riskData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} label={{ fontSize: 9 }}>
                  {riskData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={tip} />
                <Legend wrapperStyle={{ fontSize: 9 }} />
              </PieChart>
            </ResponsiveContainer></div>
          ) : <p className="text-sm text-muted-foreground text-center py-12">No elevated disease risks detected. Great job!</p>
        )}
        {chartCard("Lifestyle Radar", <Activity className="w-4 h-4 text-primary" />,
          <div className="h-64"><ResponsiveContainer width="100%" height="100%">
            <RadarChart data={radarData}>
              <PolarGrid stroke="hsl(var(--border))" />
              <PolarAngleAxis dataKey="metric" tick={{ fontSize: 10 }} />
              <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
              <Radar name="You" dataKey="value" stroke="hsl(207, 90%, 54%)" fill="hsl(207, 90%, 54%)" fillOpacity={0.4} />
              <Tooltip contentStyle={tip} />
            </RadarChart>
          </ResponsiveContainer></div>
        )}
      </div>
    </div>
  );
}