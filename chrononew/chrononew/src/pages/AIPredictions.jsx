import React, { useState } from "react";

import { getAllDiseaseRisks, getRiskLevel, DISEASE_COLORS } from "@/lib/healthUtils";
import { Brain, Loader2, Sparkles } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip
} from "recharts";
import { Link } from "react-router-dom";

const COLORS = DISEASE_COLORS;

export default function AIPredictions() {
  const [aiInsight, setAiInsight] = useState(null);
  const [loadingInsight, setLoadingInsight] = useState(false);

  const profile = JSON.parse(localStorage.getItem("healthProfile"));

  const riskList = profile ? getAllDiseaseRisks(profile) : null;
  const generateInsight = async () => {
  if (!profile || !riskList) return;

  setLoadingInsight(true);

  try {
    const sortedRisks = [...riskList].sort((a, b) => b.value - a.value);

    const highestRisk = sortedRisks[0];

    const analyses = sortedRisks.map((risk) => ({
      disease: risk.label,
      explanation:
        risk.value >= 60
          ? `${risk.label} shows an elevated estimated risk based on the health profile factors provided.`
          : risk.value >= 30
          ? `${risk.label} shows a moderate estimated risk. Maintaining healthy lifestyle habits may help reduce future risk.`
          : `${risk.label} currently shows a relatively lower estimated risk based on the available profile data.`,
      prevention:
        risk.value >= 60
          ? "Focus on regular physical activity, balanced nutrition, healthy weight management, and appropriate medical checkups."
          : "Continue regular exercise, balanced nutrition, adequate sleep, stress management, and routine health monitoring."
    }));

    setAiInsight({
      overall_assessment: `The highest estimated risk is ${highestRisk.label} at ${highestRisk.value}%. Review the risk factors in your health profile and focus on preventive lifestyle measures.`,
      risk_analyses: analyses
    });
  } catch (error) {
    console.error("Insight generation failed:", error);
  } finally {
    setLoadingInsight(false);
  }
};
  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold font-heading">AI Disease Prediction</h1>
        <div className="glass-card rounded-2xl p-12 text-center">
          <Brain className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
          <h2 className="text-lg font-bold mb-2">Profile Required</h2>
          <p className="text-sm text-muted-foreground mb-4">Complete your health profile to generate predictions.</p>
          <Link to="/profile" className="inline-flex px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium">Create Profile</Link>
        </div>
      </div>
    );
  }

  const riskData = riskList.map((r) => ({ name: r.label, value: r.value, icon: r.icon }));
  const pieData = riskData.map((r) => ({ name: r.name, value: r.value }));

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold font-heading">AI Disease Prediction</h1>
        <p className="text-sm text-muted-foreground mt-1">ML-powered risk assessment based on your health profile</p>
      </motion.div>

      {/* Risk Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {riskData.map((r, i) => {
          const info = getRiskLevel(r.value);
          return (
            <motion.div
              key={r.name}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="glass-card rounded-2xl p-5 text-center"
            >
              <r.icon className={`w-8 h-8 mx-auto mb-2 ${info.color}`} />
              <p className="text-xs text-muted-foreground mb-1">{r.name}</p>
              <p className={`text-3xl font-bold font-display ${info.color}`}>{r.value}%</p>
              <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full mt-2 inline-block ${info.bg} text-white`}>
                {info.label}
              </span>
            </motion.div>
          );
        })}
      </div>

      {/* Charts */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-heading">Risk Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={pieData} cx="50%" cy="50%" innerRadius={50} outerRadius={90} paddingAngle={2} dataKey="value">
                    {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="flex flex-wrap justify-center gap-x-3 gap-y-1.5 mt-2">
              {riskData.map((r, i) => (
                <div key={r.name} className="flex items-center gap-1.5 text-[11px]">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[i % COLORS.length] }} />
                  {r.name}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-base font-heading">Risk Comparison</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[420px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={riskData} layout="vertical" margin={{ left: 10, right: 20 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis type="number" domain={[0, 100]} tick={{ fontSize: 11 }} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10 }} width={130} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "12px" }} />
                  <Bar dataKey="value" radius={[0, 6, 6, 0]}>
                    {riskData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* AI Insight */}
      <Card className="glass-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-heading flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-primary" /> AI Deep Analysis
          </CardTitle>
          <Button onClick={generateInsight} disabled={loadingInsight} size="sm" className="gradient-primary text-white">
            {loadingInsight ? <><Loader2 className="w-3 h-3 animate-spin mr-1" /> Analyzing...</> : "Generate Insight"}
          </Button>
        </CardHeader>
        <CardContent>
          {aiInsight ? (
            <div className="space-y-4">
              <p className="text-sm bg-muted/50 p-4 rounded-xl">{aiInsight.overall_assessment}</p>
              {(aiInsight.risk_analyses || []).map((ra, i) => (
                <div key={i} className="p-4 rounded-xl bg-muted/30 border border-border/50 space-y-2">
                  <h4 className="text-sm font-semibold">{ra.disease}</h4>
                  <p className="text-xs text-muted-foreground">{ra.explanation}</p>
                  <p className="text-xs"><span className="font-medium text-primary">Prevention:</span> {ra.prevention}</p>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center py-8">Click "Generate Insight" for a detailed AI analysis of your risk factors.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}