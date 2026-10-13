const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/lib/AuthContext";
import { getAllDiseaseRisks, calculateHealthScore, getScoreColor, DISEASE_COLORS } from "@/lib/healthUtils";
import { BarChart3 } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, LineChart, Line } from "recharts";
import { format } from "date-fns";
import { Link } from "react-router-dom";

const COLORS = DISEASE_COLORS;

export default function Analytics() {
  const { user } = useAuth();

  const { data: profiles } = useQuery({
    queryKey: ["health-profiles"],
    queryFn: () => db.entities.HealthProfile.filter({ created_by_id: user?.id }, "-created_date", 1),
    enabled: !!user?.id,
  });

  const { data: snapshots } = useQuery({
    queryKey: ["health-snapshots"],
    queryFn: () => db.entities.HealthSnapshot.filter({ created_by_id: user?.id }, "-snapshot_date", 30),
    enabled: !!user?.id,
  });

  const profile = profiles?.[0];
  const sorted = (snapshots || []).sort((a, b) => new Date(a.snapshot_date) - new Date(b.snapshot_date));

  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold font-heading">Analytics</h1>
        <div className="glass-card rounded-2xl p-12 text-center">
          <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
          <h2 className="text-lg font-bold mb-2">No Analytics Data</h2>
          <p className="text-sm text-muted-foreground mb-4">Complete your health profile to view analytics.</p>
          <Link to="/profile" className="inline-flex px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium">Create Profile</Link>
        </div>
      </div>
    );
  }

  const riskList = getAllDiseaseRisks(profile);
  const score = calculateHealthScore(profile);

  const riskPieData = riskList.map((r) => ({ name: r.label, value: r.value }));

  const radarData = [
    { subject: "BMI", value: Math.max(0, 100 - Math.abs(22 - (profile.bmi || 22)) * 10) },
    { subject: "BP", value: Math.max(0, 100 - Math.max(0, (profile.blood_pressure_systolic || 120) - 120) * 2) },
    { subject: "Sugar", value: Math.max(0, 100 - Math.max(0, (profile.blood_sugar || 90) - 90) * 1.5) },
    { subject: "Cholesterol", value: Math.max(0, 100 - Math.max(0, (profile.cholesterol || 180) - 180) * 0.8) },
    { subject: "Exercise", value: profile.exercise_frequency === "very_active" ? 95 : profile.exercise_frequency === "active" ? 80 : profile.exercise_frequency === "moderate" ? 60 : profile.exercise_frequency === "light" ? 40 : 15 },
    { subject: "Sleep", value: Math.max(0, 100 - Math.abs(7.5 - (profile.sleep_hours || 7)) * 15) },
  ];

  const trendData = sorted.map(s => ({
    date: format(new Date(s.snapshot_date), "MMM d"),
    score: s.health_score,
    heart: s.heart_disease_risk,
    diabetes: s.diabetes_risk,
  }));

  const lifestyleBars = [
    { name: "Sleep", value: Math.min(100, ((profile.sleep_hours || 0) / 9) * 100) },
    { name: "Water", value: Math.min(100, ((profile.water_intake_liters || 0) / 3) * 100) },
    { name: "Exercise", value: profile.exercise_frequency === "very_active" ? 100 : profile.exercise_frequency === "active" ? 80 : profile.exercise_frequency === "moderate" ? 60 : profile.exercise_frequency === "light" ? 35 : 10 },
    { name: "Diet", value: profile.diet_type === "mediterranean" ? 95 : profile.diet_type === "balanced" ? 80 : profile.diet_type === "vegetarian" ? 75 : profile.diet_type === "fast_food" ? 20 : 60 },
  ];

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold font-heading">Analytics</h1>
        <p className="text-sm text-muted-foreground mt-1">Comprehensive visualizations of your health data</p>
      </motion.div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Risk Pie Chart */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-heading">Disease Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={riskPieData} cx="50%" cy="50%" outerRadius={90} innerRadius={50} paddingAngle={2} dataKey="value" label={({ name, value }) => `${value}%`}>
                    {riskPieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Health Radar */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-heading">Health Radar</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart data={radarData}>
                  <PolarGrid stroke="hsl(var(--border))" />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 11 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 100]} tick={{ fontSize: 9 }} />
                  <Radar name="Health" dataKey="value" stroke="hsl(207, 90%, 54%)" fill="hsl(207, 90%, 54%)" fillOpacity={0.2} strokeWidth={2} />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Lifestyle Bars */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-heading">Lifestyle Score</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={lifestyleBars}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {lifestyleBars.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Trends */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-heading">Risk Trends Over Time</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              {trendData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={trendData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 11 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                    <Legend />
                    <Line type="monotone" dataKey="score" name="Health Score" stroke="#3b82f6" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="heart" name="Heart Risk" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                    <Line type="monotone" dataKey="diabetes" name="Diabetes Risk" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-sm text-muted-foreground">
                  Update your profile multiple times to see trends
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}