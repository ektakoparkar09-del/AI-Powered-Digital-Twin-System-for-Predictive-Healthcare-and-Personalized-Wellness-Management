const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/lib/AuthContext";
import { calculateHealthScore, getAllDiseaseRisks, calculateBMI, getScoreColor } from "@/lib/healthUtils";
import { simulateProfile } from "@/lib/wellnessUtils";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { FlaskConical, Activity, TrendingUp, TrendingDown, Minus } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, ReferenceLine, Cell,
} from "recharts";

const DIET_OPTIONS = ["balanced", "vegetarian", "vegan", "keto", "mediterranean", "fast_food", "other"];
const EX_OPTIONS = ["none", "light", "moderate", "active", "very_active"];
const SMOKE_OPTIONS = ["never", "former", "occasional", "regular"];
const ALCOHOL_OPTIONS = ["never", "occasional", "moderate", "heavy"];
const STRESS_OPTIONS = ["low", "moderate", "high", "very_high"];

export default function HealthSimulator() {
  const { user } = useAuth();
  const { data: profiles } = useQuery({
    queryKey: ["health-profiles"],
    queryFn: () => db.entities.HealthProfile.filter({ created_by_id: user?.id }, "-created_date", 1),
    enabled: !!user?.id,
  });
  const profile = profiles?.[0];

  const [sim, setSim] = useState({
    weight_kg: profile?.weight_kg || 70,
    sleep_hours: profile?.sleep_hours || 7,
    exercise_frequency: profile?.exercise_frequency || "moderate",
    water_intake_liters: profile?.water_intake_liters || 2,
    diet_type: profile?.diet_type || "balanced",
    smoking: profile?.smoking || "never",
    alcohol: profile?.alcohol || "never",
    stress_level: profile?.stress_level || "moderate",
    blood_pressure_systolic: profile?.blood_pressure_systolic || 120,
    blood_sugar: profile?.blood_sugar || 90,
  });

  const current = useMemo(() => simulateProfile(profile, {}), [profile]);
  const predicted = useMemo(() => simulateProfile(profile, sim), [profile, sim]);

  if (!profile) {
    return (
      <div className="space-y-6">
        <PageHeader title="Health Simulator" subtitle="What-if scenarios for your health" icon={FlaskConical} />
        <EmptyState icon={FlaskConical} title="Create your health profile first" description="The simulator needs a baseline profile to predict outcomes of lifestyle changes." ctaLabel="Create Profile" ctaTo="/profile" />
      </div>
    );
  }

  const scoreDelta = predicted.score - current.score;
  const curAvg = current.avgRisk;
  const predAvg = predicted.avgRisk;
  const riskReduction = curAvg - predAvg;

  const riskCompare = getAllDiseaseRisks(profile).slice(0, 8).map((d) => ({
    name: d.label.length > 14 ? d.label.slice(0, 12) + "…" : d.label,
    current: current.risks[d.key] || 0,
    predicted: predicted.risks[d.key] || 0,
  }));

  const timeline = Array.from({ length: 6 }).map((_, i) => {
    const month = i * 3;
    const projScore = Math.max(0, Math.min(100, Math.round(current.score + (scoreDelta * (i + 1) / 3))));
    return { month: month === 0 ? "Now" : `+${month}mo`, score: i === 0 ? current.score : projScore };
  });

  const curInfo = getScoreColor(current.score);
  const predInfo = getScoreColor(predicted.score);

  return (
    <div className="space-y-6">
      <PageHeader title="AI What-If Health Simulator" subtitle="Adjust lifestyle factors and instantly see predicted health outcomes" icon={FlaskConical} />

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Controls */}
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-base font-heading">Adjust Your Lifestyle</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs">Weight (kg)</Label>
              <Input type="number" value={sim.weight_kg} onChange={(e) => setSim({ ...sim, weight_kg: Number(e.target.value) })} />
            </div>
            <div>
              <Label className="text-xs">Sleep (hours)</Label>
              <Input type="number" step="0.5" value={sim.sleep_hours} onChange={(e) => setSim({ ...sim, sleep_hours: Number(e.target.value) })} />
            </div>
            <div>
              <Label className="text-xs">Exercise</Label>
              <Select value={sim.exercise_frequency} onValueChange={(v) => setSim({ ...sim, exercise_frequency: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{EX_OPTIONS.map((o) => <SelectItem key={o} value={o} className="capitalize">{o.replace("_", " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Water Intake (L)</Label>
              <Input type="number" step="0.1" value={sim.water_intake_liters} onChange={(e) => setSim({ ...sim, water_intake_liters: Number(e.target.value) })} />
            </div>
            <div>
              <Label className="text-xs">Diet</Label>
              <Select value={sim.diet_type} onValueChange={(v) => setSim({ ...sim, diet_type: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{DIET_OPTIONS.map((o) => <SelectItem key={o} value={o} className="capitalize">{o.replace("_", " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Smoking</Label>
                <Select value={sim.smoking} onValueChange={(v) => setSim({ ...sim, smoking: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{SMOKE_OPTIONS.map((o) => <SelectItem key={o} value={o} className="capitalize">{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Alcohol</Label>
                <Select value={sim.alcohol} onValueChange={(v) => setSim({ ...sim, alcohol: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{ALCOHOL_OPTIONS.map((o) => <SelectItem key={o} value={o} className="capitalize">{o}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div>
              <Label className="text-xs">Stress Level</Label>
              <Select value={sim.stress_level} onValueChange={(v) => setSim({ ...sim, stress_level: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{STRESS_OPTIONS.map((o) => <SelectItem key={o} value={o} className="capitalize">{o.replace("_", " ")}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label className="text-xs">Systolic BP</Label>
                <Input type="number" value={sim.blood_pressure_systolic} onChange={(e) => setSim({ ...sim, blood_pressure_systolic: Number(e.target.value) })} />
              </div>
              <div>
                <Label className="text-xs">Blood Sugar</Label>
                <Input type="number" value={sim.blood_sugar} onChange={(e) => setSim({ ...sim, blood_sugar: Number(e.target.value) })} />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Results */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid sm:grid-cols-2 gap-4">
            <motion.div initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-2xl p-5">
              <p className="text-xs text-muted-foreground mb-1">Current Health Score</p>
              <div className={`text-4xl font-bold font-display ${curInfo.text}`}>{current.score}</div>
              <Badge className={`${curInfo.bg} text-white mt-1`}>{curInfo.label}</Badge>
            </motion.div>
            <motion.div initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }} className="glass-card rounded-2xl p-5">
              <p className="text-xs text-muted-foreground mb-1">Predicted Health Score</p>
              <div className={`text-4xl font-bold font-display ${predInfo.text}`}>{predicted.score}</div>
              <div className="flex items-center gap-1 mt-1">
                {scoreDelta > 0 ? <TrendingUp className="w-4 h-4 text-green-500" /> : scoreDelta < 0 ? <TrendingDown className="w-4 h-4 text-red-500" /> : <Minus className="w-4 h-4 text-muted-foreground" />}
                <span className={`text-sm font-semibold ${scoreDelta > 0 ? "text-green-500" : scoreDelta < 0 ? "text-red-500" : "text-muted-foreground"}`}>
                  {scoreDelta > 0 ? "+" : ""}{scoreDelta} pts
                </span>
              </div>
            </motion.div>
          </div>

          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-base font-heading flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Disease Risk Reduction</CardTitle></CardHeader>
            <CardContent>
              <div className="flex items-center justify-between mb-3">
                <span className="text-sm text-muted-foreground">Avg risk: {curAvg}% → {predAvg}%</span>
                <Badge className={`${riskReduction > 0 ? "bg-green-500" : riskReduction < 0 ? "bg-red-500" : "bg-muted"} text-white`}>
                  {riskReduction > 0 ? "-" : riskReduction < 0 ? "+" : ""}{Math.abs(riskReduction)}% {riskReduction > 0 ? "reduction" : "increase"}
                </Badge>
              </div>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskCompare} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis type="number" domain={[0, 95]} tick={{ fontSize: 10 }} />
                    <YAxis type="category" dataKey="name" tick={{ fontSize: 9 }} width={90} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "11px" }} />
                    <Bar dataKey="current" fill="hsl(var(--muted-foreground))" radius={[0, 4, 4, 0]} name="Current" />
                    <Bar dataKey="predicted" fill="hsl(207, 90%, 54%)" radius={[0, 4, 4, 0]} name="Predicted" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          <Card className="glass-card border-border/50">
            <CardHeader><CardTitle className="text-base font-heading">Future Health Timeline</CardTitle></CardHeader>
            <CardContent>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={timeline}>
                    <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                    <XAxis dataKey="month" tick={{ fontSize: 10 }} />
                    <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                    <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "11px" }} />
                    <ReferenceLine y={current.score} stroke="hsl(var(--muted-foreground))" strokeDasharray="4 4" />
                    <Line type="monotone" dataKey="score" stroke="hsl(168, 76%, 42%)" strokeWidth={2} dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
              <p className="text-[10px] text-muted-foreground text-center mt-2">Projected score if simulated lifestyle is sustained over 18 months</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}