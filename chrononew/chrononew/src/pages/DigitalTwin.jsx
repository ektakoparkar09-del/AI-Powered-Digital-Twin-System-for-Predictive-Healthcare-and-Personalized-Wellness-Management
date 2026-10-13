

import React from "react";



import {
  calculateBMI,
  getBMICategory,
  getScoreColor,
  getAllDiseaseRisks,
  getRiskLevel
} from "@/lib/healthUtils";

import {
  Dna,
  Heart,
  Activity,
  TrendingUp,
  TrendingDown
} from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "react-router-dom";
import InteractiveTwin from "@/components/digitaltwin/InteractiveTwin";

function CompareRow({ label, current, previous, unit, lowerIsBetter }) {
  const diff = current && previous ? current - previous : null;
  const improved = diff !== null && (lowerIsBetter ? diff < 0 : diff > 0);
  const declined = diff !== null && (lowerIsBetter ? diff > 0 : diff < 0);
  
  return (
    <div className="flex items-center justify-between py-3 border-b border-border/50 last:border-0">
      <span className="text-sm text-muted-foreground">{label}</span>
      <div className="flex items-center gap-3">
        {previous !== undefined && previous !== null && (
          <span className="text-xs text-muted-foreground/60">{previous}{unit}</span>
        )}
        <span className="text-sm font-semibold">{current ?? "--"}{unit}</span>
        {diff !== null && diff !== 0 && (
          <Badge variant="secondary" className={`text-[10px] ${improved ? "text-green-500" : declined ? "text-red-500" : ""}`}>
            {improved ? <TrendingUp className="w-3 h-3 mr-0.5" /> : <TrendingDown className="w-3 h-3 mr-0.5" />}
            {Math.abs(diff).toFixed(1)}
          </Badge>
        )}
      </div>
    </div>
  );
}

export default function DigitalTwin() {
  const [profile, setProfile] = React.useState(null);
const [snapshots, setSnapshots] = React.useState([]);

React.useEffect(() => {

  const loadHealthData = () => {

    const p =
      JSON.parse(localStorage.getItem("healthProfile")) || null;

    const s =
      JSON.parse(localStorage.getItem("healthSnapshots")) || [];

    setProfile(p);
    setSnapshots(s);
  };

  loadHealthData();

  window.addEventListener(
    "healthProfileUpdated",
    loadHealthData
  );

  return () => {
    window.removeEventListener(
      "healthProfileUpdated",
      loadHealthData
    );
  };

}, []);

 
 const sorted = [...(snapshots || [])].sort(
  (a, b) => new Date(a.snapshot_date) - new Date(b.snapshot_date)
);
  const latest = sorted[sorted.length - 1];
  const previous = sorted.length > 1 ? sorted[sorted.length - 2] : null;

  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold font-heading">Digital Twin</h1>
        <div className="glass-card rounded-2xl p-12 text-center">
          <Dna className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
          <h2 className="text-lg font-bold mb-2">No Digital Twin Created</h2>
          <p className="text-sm text-muted-foreground mb-4">Complete your health profile first.</p>
          <Link to="/profile" className="inline-flex px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium">
            Create Profile
          </Link>
        </div>
      </div>
    );
  }

  const bmi = profile.bmi || calculateBMI(profile.weight_kg, profile.height_cm);
  const bmiCat = getBMICategory(bmi);
  const score = profile.health_score || 0;
  const scoreInfo = getScoreColor(score);
  const riskList = getAllDiseaseRisks(profile);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold font-heading">Digital Twin</h1>
        <p className="text-sm text-muted-foreground mt-1">Your virtual health profile — a complete digital replica</p>
      </motion.div>

      {/* Twin Avatar Card */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-8">
        <div className="flex flex-col md:flex-row items-center gap-8">
          <div className="relative">
            <div className="w-32 h-32 rounded-full gradient-primary flex items-center justify-center">
              <Dna className="w-16 h-16 text-white" />
            </div>
            <div className={`absolute -bottom-1 -right-1 w-10 h-10 rounded-full ${scoreInfo.bg} flex items-center justify-center border-4 border-card`}>
              <span className="text-xs font-bold text-white">{score}</span>
            </div>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-xl font-bold font-heading">{profile?.name || "User"}'s Digital Twin</h2>
            <p className="text-sm text-muted-foreground mt-1">
              {profile.age} years old · {profile.gender?.charAt(0).toUpperCase() + profile.gender?.slice(1)} · {bmi} BMI ({bmiCat.label})
            </p>
            <div className="flex flex-wrap gap-2 mt-3 justify-center md:justify-start">
              <Badge className={`${scoreInfo.bg} text-white`}>{scoreInfo.label}</Badge>
              <Badge variant="outline">
  Last updated:{" "}
  {profile?.last_updated
    ? format(new Date(profile.last_updated), "MMM d, yyyy")
    : "N/A"}
</Badge>
            </div>
          </div>
        </div>
      </motion.div>

      <InteractiveTwin profile={profile} />

      <div className="grid md:grid-cols-2 gap-6">
        {/* Current vs Previous */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Activity className="w-4 h-4 text-primary" /> Health Comparison
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CompareRow label="Health Score" current={latest?.health_score} previous={previous?.health_score} unit="" lowerIsBetter={false} />
            <CompareRow label="BMI" current={latest?.bmi} previous={previous?.bmi} unit="" lowerIsBetter={true} />
            <CompareRow label="Blood Pressure" current={latest?.blood_pressure_systolic} previous={previous?.blood_pressure_systolic} unit=" mmHg" lowerIsBetter={true} />
            <CompareRow label="Blood Sugar" current={latest?.blood_sugar} previous={previous?.blood_sugar} unit=" mg/dL" lowerIsBetter={true} />
            <CompareRow label="Cholesterol" current={latest?.cholesterol} previous={previous?.cholesterol} unit=" mg/dL" lowerIsBetter={true} />
            <CompareRow label="Weight" current={latest?.weight_kg} previous={previous?.weight_kg} unit=" kg" lowerIsBetter={true} />
          </CardContent>
        </Card>

        {/* Risk Summary */}
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Heart className="w-4 h-4 text-red-500" /> Risk Profile
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 max-h-[420px] overflow-y-auto pr-1">
            {riskList.map((r) => {
              const info = getRiskLevel(r.value);
              return (
                <div key={r.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1.5">
                      <r.icon className="w-3.5 h-3.5 text-muted-foreground" />
                      {r.label}
                    </span>
                    <span className={`font-semibold ${info.color}`}>{r.value}% — {info.label}</span>
                  </div>
                  <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                    <motion.div
                      className={`h-full rounded-full ${info.bg}`}
                      initial={{ width: 0 }}
                      animate={{ width: `${r.value}%` }}
                      transition={{ duration: 1 }}
                    />
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>
      </div>

      {/* Snapshot History */}
      <Card className="glass-card border-border/50">
        <CardHeader>
          <CardTitle className="text-base font-heading">Health History Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          {sorted.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-8">No history records yet.</p>
          ) : (
            <div className="space-y-3 max-h-72 overflow-y-auto">
              {[...sorted].reverse().map((s, i) => (
                <div key={s.id || i} className="flex items-center gap-4 p-3 rounded-xl bg-muted/50 hover:bg-muted/80 transition-colors">
                  <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs font-medium">{format(new Date(s.snapshot_date), "MMMM d, yyyy")}</p>
                    <p className="text-[10px] text-muted-foreground">Score: {s.health_score} · BMI: {s.bmi} · BP: {s.blood_pressure_systolic}/{s.blood_pressure_diastolic}</p>
                  </div>
                  <Badge variant="secondary" className={`text-[10px] ${getScoreColor(s.health_score).bg} text-white`}>
                    {s.health_score}
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}