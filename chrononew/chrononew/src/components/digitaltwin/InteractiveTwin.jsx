
import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";

import { getOrganHealth, ORGANS } from "@/lib/wellnessUtils";
import { getScoreColor } from "@/lib/healthUtils";
import { Sparkles, Loader2, TrendingUp } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

// Approximate marker positions on a 200x420 body SVG
const ORGAN_POSITIONS = {
  brain: { x: 100, y: 38 },
  heart: { x: 88, y: 130 },
  lungs: { x: 112, y: 130 },
  liver: { x: 118, y: 175 },
  kidneys: { x: 86, y: 195 },
  bones: { x: 100, y: 320 },
  metabolic: { x: 100, y: 210 },
};

export default function InteractiveTwin({ profile }) {
  const organs = useMemo(() => getOrganHealth(profile), [profile]);
  const [selected, setSelected] = useState(null);
  const [tips, setTips] = useState(null);
  const [loadingTips, setLoadingTips] = useState(false);

  const selectedOrgan = selected ? organs.find((o) => o.key === selected) : organs[0];
  const avgScore = Math.round(organs.reduce((s, o) => s + o.score, 0) / organs.length);
  const overall = getScoreColor(avgScore);

  const getTips = async () => {
  setLoadingTips(true);

  try {
    const sortedOrgans = [...organs].sort((a, b) => a.score - b.score);
    const weakestOrgans = sortedOrgans.slice(0, 4);

    const recommendations = weakestOrgans.map((organ) => {
      switch (organ.key) {
        case "heart":
          return "Maintain regular cardio exercise, limit saturated fats, and monitor blood pressure and cholesterol.";

        case "brain":
          return "Prioritize 7-9 hours of sleep, regular physical activity, stress management, and mentally stimulating activities.";

        case "lungs":
          return "Avoid smoking and second-hand smoke, stay physically active, and maintain good indoor air quality.";

        case "liver":
          return "Maintain a healthy weight, limit highly processed foods, and follow a balanced diet rich in vegetables.";

        case "kidneys":
          return "Stay adequately hydrated, maintain healthy blood pressure, and avoid excessive salt intake.";

        case "bones":
          return "Include weight-bearing exercise and adequate calcium and vitamin D in your overall lifestyle.";

        case "metabolic":
          return "Focus on regular exercise, balanced meals, healthy weight management, and limiting excess sugar.";

        default:
          return "Maintain regular exercise, balanced nutrition, good sleep, and routine health monitoring.";
      }
    });

    setTips(recommendations);
  } catch (error) {
    console.error("Recommendation generation failed:", error);

    setTips([
      "Maintain regular cardiovascular exercise.",
      "Eat a balanced diet rich in vegetables.",
      "Stay hydrated throughout the day.",
      "Get 7-8 hours of quality sleep."
    ]);
  } finally {
    setLoadingTips(false);
  }
};

  return (
    <div className="space-y-6">
      <Card className="glass-card border-border/50">
        <CardHeader><CardTitle className="text-base font-heading flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> Interactive Body Overview</CardTitle></CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-6">
            {/* Body SVG */}
            <div className="flex flex-col items-center">
              <svg viewBox="0 0 200 420" className="w-48 h-auto">
                {/* Body silhouette */}
                <path
                  d="M100 10 a22 22 0 1 1 0 44 a22 22 0 1 1 0 -44 M100 56 L70 70 L60 120 L66 150 L78 150 L78 200 L72 280 L82 360 L92 410 L100 410 L108 410 L118 360 L128 280 L122 200 L122 150 L134 150 L140 120 L130 70 Z"
                  fill="hsl(var(--muted))" stroke="hsl(var(--border))" strokeWidth="2" opacity="0.5"
                />
                {/* Organ markers */}
                {ORGANS.map((o) => {
                  const pos = ORGAN_POSITIONS[o.key];
                  const organ = organs.find((x) => x.key === o.key);
                  if (!pos || !organ) return null;
                  return (
                    <g key={o.key} onClick={() => setSelected(o.key)} className="cursor-pointer">
                      <motion.circle
                        cx={pos.x} cy={pos.y} r={11}
                        fill={organ.score >= 60 ? "#10b981" : organ.score >= 40 ? "#f59e0b" : "#ef4444"}
                        initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}
                        whileHover={{ scale: 1.4 }}
                      />
                      <circle cx={pos.x} cy={pos.y} r={11} fill="none" stroke="white" strokeWidth="1.5" opacity="0.6" />
                      {selected === o.key && (
                        <motion.circle cx={pos.x} cy={pos.y} r={18} fill="none" stroke={organ.score >= 60 ? "#10b981" : organ.score >= 40 ? "#f59e0b" : "#ef4444"} strokeWidth="2"
                          animate={{ r: [14, 20, 14] }} transition={{ duration: 1.5, repeat: Infinity }} />
                      )}
                    </g>
                  );
                })}
              </svg>
              <div className="flex items-center gap-3 mt-2">
                <div className="text-center">
                  <p className="text-[10px] text-muted-foreground">Organ Health Score</p>
                  <p className={`text-2xl font-bold font-display ${overall.text}`}>{avgScore}</p>
                </div>
                <Badge className={`${overall.bg} text-white`}>{overall.label}</Badge>
              </div>
              <p className="text-[10px] text-muted-foreground mt-1">Tap an organ marker to inspect its health</p>
            </div>

            {/* Selected organ detail */}
            <div>
              <AnimatePresence mode="wait">
                {selectedOrgan && (
                  <motion.div key={selectedOrgan.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                    className="glass-card rounded-2xl p-5">
                    <div className="flex items-center gap-3 mb-3">
                      <div className={`w-12 h-12 rounded-xl ${selectedOrgan.color} flex items-center justify-center`}>
                        <selectedOrgan.icon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="font-bold font-heading">{selectedOrgan.label}</h3>
                        <p className="text-xs text-muted-foreground">Status: {selectedOrgan.status}</p>
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-muted/40 text-center">
                        <p className="text-[10px] text-muted-foreground">Organ Health</p>
                        <p className={`text-2xl font-bold ${selectedOrgan.textColor}`}>{selectedOrgan.score}<span className="text-xs text-muted-foreground">/100</span></p>
                      </div>
                      <div className="p-3 rounded-lg bg-muted/40 text-center">
                        <p className="text-[10px] text-muted-foreground">Risk Level</p>
                        <p className="text-2xl font-bold text-red-500">{selectedOrgan.risk}<span className="text-xs text-muted-foreground">%</span></p>
                      </div>
                    </div>
                    <div className="mt-3 p-3 rounded-lg bg-primary/5 text-xs text-muted-foreground">
                      <p className="flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5 text-green-500" /> Maintain healthy habits to protect this organ.</p>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organ health cards grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {organs.map((o, i) => (
          <motion.div key={o.key} initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
            whileHover={{ y: -4, scale: 1.03 }} onClick={() => setSelected(o.key)}
            className={`glass-card rounded-2xl p-4 text-center cursor-pointer transition-all ${selected === o.key ? "ring-2 ring-primary" : ""}`}>
            <div className={`w-10 h-10 rounded-xl mx-auto ${o.color} flex items-center justify-center mb-2`}>
              <o.icon className="w-5 h-5 text-white" />
            </div>
            <p className="text-xs font-semibold">{o.label}</p>
            <p className={`text-lg font-bold ${o.textColor}`}>{o.score}</p>
            <p className="text-[9px] text-muted-foreground">{o.status}</p>
          </motion.div>
        ))}
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-heading flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> AI Organ Health Recommendations</CardTitle>
          <Button variant="outline" size="sm" onClick={getTips} disabled={loadingTips}>
            {loadingTips ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get Recommendations"}
          </Button>
        </CardHeader>
        <CardContent>
          {tips ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {tips.map((t, i) => (
                <div key={i} className="flex gap-2 p-3 rounded-lg bg-muted/40 text-xs">
                  <span className="w-5 h-5 rounded-full gradient-primary text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                  <span>{t}</span>
                </div>
              ))}
            </div>
          ) : <p className="text-sm text-muted-foreground">Generate AI-powered recommendations targeting your weakest organs.</p>}
        </CardContent>
      </Card>
    </div>
  );
}