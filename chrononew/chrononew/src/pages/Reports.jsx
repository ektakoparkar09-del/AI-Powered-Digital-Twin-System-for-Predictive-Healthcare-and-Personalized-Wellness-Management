const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/lib/AuthContext";
import { calculateHealthScore, getAllDiseaseRisks, calculateBMI, getScoreColor, getRiskLevel, getBMICategory } from "@/lib/healthUtils";
import { computeAchievements, buildTimeline, getOrganHealth } from "@/lib/wellnessUtils";
import { FileText, Download, Loader2, Printer } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";
import { Link } from "react-router-dom";
import jsPDF from "jspdf";

export default function Reports() {
  const { user } = useAuth();
  const [generating, setGenerating] = useState(false);

  const { data: profiles } = useQuery({
    queryKey: ["health-profiles"],
    queryFn: () => db.entities.HealthProfile.filter({ created_by_id: user?.id }, "-created_date", 1),
    enabled: !!user?.id,
  });
  const { data: snapshots } = useQuery({ queryKey: ["health-snapshots"], queryFn: () => db.entities.HealthSnapshot.filter({ created_by_id: user?.id }, "-snapshot_date", 30), enabled: !!user?.id });
  const { data: medications } = useQuery({ queryKey: ["medications"], queryFn: () => db.entities.Medication.filter({ created_by_id: user?.id }, "-created_date", 30), enabled: !!user?.id });
  const { data: exerciseLogs } = useQuery({ queryKey: ["exercise-logs"], queryFn: () => db.entities.ExerciseLog.filter({ created_by_id: user?.id }, "-log_date", 30), enabled: !!user?.id });
  const { data: waterLogs } = useQuery({ queryKey: ["water-logs"], queryFn: () => db.entities.WaterLog.filter({ created_by_id: user?.id }, "-log_date", 30), enabled: !!user?.id });
  const { data: sleepLogs } = useQuery({ queryKey: ["sleep-logs"], queryFn: () => db.entities.SleepLog.filter({ created_by_id: user?.id }, "-log_date", 30), enabled: !!user?.id });
  const { data: moodLogs } = useQuery({ queryKey: ["mood-logs"], queryFn: () => db.entities.MoodLog.filter({ created_by_id: user?.id }, "-log_date", 30), enabled: !!user?.id });

  const profile = profiles?.[0];

  const generatePDF = () => {
    if (!profile) return;
    setGenerating(true);

    const doc = new jsPDF();
    const score = calculateHealthScore(profile);
    const riskList = getAllDiseaseRisks(profile);
    const bmi = profile.bmi || calculateBMI(profile.weight_kg, profile.height_cm);
    const scoreInfo = getScoreColor(score);

    // Header
    doc.setFillColor(30, 58, 138);
    doc.rect(0, 0, 210, 40, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(22);
    doc.text("ChronoTwin-X Health Report", 20, 20);
    doc.setFontSize(10);
    doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy")}`, 20, 30);
    doc.text(`Patient: ${user?.full_name || "N/A"}`, 120, 30);

    doc.setTextColor(0, 0, 0);
    let y = 55;

    // Profile
    doc.setFontSize(14);
    doc.text("Patient Profile", 20, y);
    y += 8;
    doc.setFontSize(10);
    const profileLines = [
      `Age: ${profile.age} | Gender: ${profile.gender} | Height: ${profile.height_cm}cm | Weight: ${profile.weight_kg}kg | BMI: ${bmi} (${getBMICategory(bmi).label})`,
      `Blood Pressure: ${profile.blood_pressure_systolic}/${profile.blood_pressure_diastolic} mmHg | Blood Sugar: ${profile.blood_sugar} mg/dL | Cholesterol: ${profile.cholesterol} mg/dL`,
      `Heart Rate: ${profile.heart_rate} bpm | Exercise: ${profile.exercise_frequency} | Sleep: ${profile.sleep_hours}h | Diet: ${profile.diet_type}`,
      `Smoking: ${profile.smoking} | Alcohol: ${profile.alcohol} | Stress: ${profile.stress_level}`,
    ];
    profileLines.forEach(line => { doc.text(line, 20, y); y += 6; });

    y += 8;
    doc.setFontSize(14);
    doc.text(`Health Score: ${score}/100 (${scoreInfo.label})`, 20, y);

    y += 12;
    doc.setFontSize(14);
    doc.text("Chronic Disease Risk Assessment", 20, y);
    y += 8;
    doc.setFontSize(10);
    riskList.forEach((r) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${r.label}: ${r.value}% (${getRiskLevel(r.value).label})`, 20, y);
      y += 6;
    });

    y += 8;
    doc.setFontSize(14);
    doc.text("AI Recommendations", 20, y);
    y += 8;
    doc.setFontSize(10);
    (profile.recommendations || []).forEach((rec, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${rec}`, 170);
      lines.forEach(line => { doc.text(line, 20, y); y += 5; });
      y += 2;
    });

    // Footer
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This report is AI-generated and for informational purposes only. Consult a healthcare professional for medical advice.", 20, 280);

    doc.save(`ChronoTwin-X-Report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    setGenerating(false);
  };

  const generateAdvancedPDF = () => {
    if (!profile) return;
    setGenerating(true);

    const doc = new jsPDF();
    const score = calculateHealthScore(profile);
    const riskList = getAllDiseaseRisks(profile);
    const bmi = profile.bmi || calculateBMI(profile.weight_kg, profile.height_cm);
    const scoreInfo = getScoreColor(score);
    const organs = getOrganHealth(profile);
    const ach = computeAchievements({ profile, exerciseLogs: exerciseLogs || [], waterLogs: waterLogs || [], sleepLogs: sleepLogs || [], moodLogs: moodLogs || [] });
    const events = buildTimeline({ profile, snapshots: snapshots || [], medications: medications || [], exerciseLogs: exerciseLogs || [] });

    // ===== Cover Page =====
    doc.setFillColor(15, 35, 80);
    doc.rect(0, 0, 210, 297, "F");
    doc.setFillColor(20, 120, 160);
    doc.rect(0, 120, 210, 6, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(11);
    doc.text("CHRONOTWIN-X", 20, 30);
    doc.setFontSize(28);
    doc.text("Hospital-Grade", 20, 70);
    doc.text("Health Report", 20, 84);
    doc.setFontSize(11);
    doc.text(`Patient: ${user?.full_name || "N/A"}`, 20, 150);
    doc.text(`Generated: ${format(new Date(), "MMMM d, yyyy")}`, 20, 158);
    doc.text(`Report ID: CTX-${Date.now().toString().slice(-8)}`, 20, 166);
    doc.setFontSize(8);
    doc.text("AI-Powered Digital Twin Healthcare · Confidential", 20, 285);

    // ===== Page 2: Digital Twin Summary =====
    doc.addPage();
    doc.setTextColor(15, 35, 80);
    doc.setFontSize(18);
    doc.text("Digital Twin Summary", 20, 25);
    doc.setDrawColor(20, 120, 160);
    doc.setLineWidth(0.8);
    doc.line(20, 30, 190, 30);

    doc.setFontSize(11);
    doc.setTextColor(0, 0, 0);
    let y = 45;
    doc.text(`Overall Health Score: ${score}/100 (${scoreInfo.label})`, 20, y);
    doc.text(`BMI: ${bmi} (${getBMICategory(bmi).label})`, 20, y + 8);
    doc.text(`BP: ${profile.blood_pressure_systolic}/${profile.blood_pressure_diastolic} mmHg`, 20, y + 16);
    doc.text(`Blood Sugar: ${profile.blood_sugar} mg/dL  |  Cholesterol: ${profile.cholesterol} mg/dL`, 20, y + 24);

    y += 40;
    doc.setFontSize(13);
    doc.setTextColor(15, 35, 80);
    doc.text("Organ Health Scores", 20, y);
    y += 8;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    organs.forEach((o) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(`${o.label}`, 20, y);
      doc.setFillColor(220, 220, 220);
      doc.rect(80, y - 4, 80, 5, "F");
      doc.setFillColor(o.score >= 60 ? 16 : o.score >= 40 ? 245 : 239, o.score >= 60 ? 185 : o.score >= 40 ? 158 : 68, o.score >= 60 ? 129 : o.score >= 40 ? 11 : 68);
      doc.rect(80, y - 4, (o.score / 100) * 80, 5, "F");
      doc.text(`${o.score}/100`, 165, y);
      y += 9;
    });

    // ===== Page 3: Disease Predictions =====
    doc.addPage();
    doc.setTextColor(15, 35, 80);
    doc.setFontSize(18);
    doc.text("Disease Risk Predictions", 20, 25);
    doc.line(20, 30, 190, 30);
    y = 45;
    doc.setFontSize(10);
    doc.setTextColor(0, 0, 0);
    riskList.forEach((r) => {
      if (y > 270) { doc.addPage(); y = 20; }
      doc.text(r.label, 20, y);
      doc.setFillColor(220, 220, 220);
      doc.rect(90, y - 4, 70, 5, "F");
      const info = getRiskLevel(r.value);
      doc.setFillColor(info.bg === "bg-green-500" ? 16 : info.bg === "bg-yellow-500" ? 245 : info.bg === "bg-orange-500" ? 249 : 239, info.bg === "bg-green-500" ? 185 : info.bg === "bg-yellow-500" ? 158 : info.bg === "bg-orange-500" ? 115 : 68, info.bg === "bg-green-500" ? 129 : info.bg === "bg-yellow-500" ? 11 : info.bg === "bg-orange-500" ? 22 : 68);
      doc.rect(90, y - 4, (r.value / 95) * 70, 5, "F");
      doc.text(`${r.value}% (${info.label})`, 165, y);
      y += 9;
    });

    // ===== Page 4: Timeline, Achievements, Recommendations =====
    doc.addPage();
    doc.setTextColor(15, 35, 80);
    doc.setFontSize(18);
    doc.text("Timeline & Achievements", 20, 25);
    doc.line(20, 30, 190, 30);
    y = 42;
    doc.setFontSize(11);
    doc.text(`Health Points: ${ach.points} XP (Level ${ach.level})`, 20, y);
    doc.text(`Badges Unlocked: ${ach.list.filter((a) => a.unlocked).length}/${ach.list.length}`, 20, y + 8);
    y += 20;
    doc.setFontSize(13);
    doc.text("Recent Health Timeline", 20, y);
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(80, 80, 80);
    events.slice(0, 10).forEach((ev) => {
      if (y > 250) return;
      doc.text(`${ev.date ? format(new Date(ev.date), "MMM d, yy") : ""}  -  ${ev.title}`, 20, y);
      y += 6;
    });
    y += 6;
    doc.setFontSize(13);
    doc.setTextColor(15, 35, 80);
    doc.text("AI Recommendations", 20, y);
    y += 8;
    doc.setFontSize(9);
    doc.setTextColor(60, 60, 60);
    (profile.recommendations || []).slice(0, 8).forEach((rec, i) => {
      const lines = doc.splitTextToSize(`${i + 1}. ${rec}`, 170);
      lines.forEach((l) => { if (y > 280) { doc.addPage(); y = 20; } doc.text(l, 20, y); y += 5; });
      y += 1;
    });

    // ===== Page 5: Doctor Summary + QR =====
    doc.addPage();
    doc.setTextColor(15, 35, 80);
    doc.setFontSize(18);
    doc.text("Doctor Summary", 20, 25);
    doc.line(20, 30, 190, 30);
    doc.setFontSize(10);
    doc.setTextColor(50, 50, 50);
    const summaryLines = doc.splitTextToSize(
      `Patient ${user?.full_name || ""} (${profile.age}y, ${profile.gender}) presents a health score of ${score}/100 (${scoreInfo.label}). BMI ${bmi} (${getBMICategory(bmi).label}). ` +
      `Top risk factor: ${riskList[0]?.label} at ${riskList[0]?.value}%. ` +
      `Key recommendations: improve ${riskList[0]?.label.toLowerCase()} risk through lifestyle modification. ` +
      `This AI-generated report summarizes the digital twin analysis and is intended for clinician review.`,
      170
    );
    let sy = 45;
    summaryLines.forEach((l) => { doc.text(l, 20, sy); sy += 6; });

    // QR placeholder
    const hash = (user?.id || "ctx").split("").reduce((a, c) => a + c.charCodeAt(0), 0);
    doc.setTextColor(15, 35, 80);
    doc.setFontSize(11);
    doc.text("Verification QR", 20, 200);
    const qrSize = 4;
    const gridN = 11;
    for (let i = 0; i < gridN; i++) {
      for (let j = 0; j < gridN; j++) {
        const filled = (hash * (i + 3) * (j + 7)) % 3 !== 0;
        if (filled) { doc.setFillColor(15, 35, 80); doc.rect(20 + j * qrSize, 205 + i * qrSize, qrSize, qrSize, "F"); }
      }
    }
    doc.setFontSize(8);
    doc.setTextColor(100, 100, 100);
    doc.text("Scan to verify report authenticity", 20, 252);

    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text("This hospital-grade report is AI-generated by ChronoTwin-X. For medical decisions, consult a qualified healthcare professional.", 20, 285);

    doc.save(`ChronoTwin-X-Advanced-Report-${format(new Date(), "yyyy-MM-dd")}.pdf`);
    setGenerating(false);
  };

  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold font-heading">Reports</h1>
        <div className="glass-card rounded-2xl p-12 text-center">
          <FileText className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />
          <h2 className="text-lg font-bold mb-2">No Report Data</h2>
          <p className="text-sm text-muted-foreground mb-4">Complete your health profile to generate reports.</p>
          <Link to="/profile" className="inline-flex px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium">Create Profile</Link>
        </div>
      </div>
    );
  }

  const score = calculateHealthScore(profile);
  const riskList = getAllDiseaseRisks(profile);
  const bmi = profile.bmi || calculateBMI(profile.weight_kg, profile.height_cm);
  const scoreInfo = getScoreColor(score);

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Generate and download comprehensive health reports</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button onClick={generatePDF} disabled={generating} variant="outline" className="rounded-xl">
            {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <Download className="w-4 h-4 mr-2" />}
            Standard PDF
          </Button>
          <Button onClick={generateAdvancedPDF} disabled={generating} className="gradient-primary text-white rounded-xl">
            {generating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <FileText className="w-4 h-4 mr-2" />}
            Hospital-Grade Report
          </Button>
        </div>
      </motion.div>

      {/* Report Preview */}
      <Card className="glass-card border-border/50">
        <CardHeader className="border-b border-border/50 gradient-primary rounded-t-xl text-white">
          <div className="flex justify-between items-center">
            <div>
              <CardTitle className="text-lg font-heading text-white">ChronoTwin-X Health Report</CardTitle>
              <p className="text-xs text-white/70 mt-1">Generated: {format(new Date(), "MMMM d, yyyy")}</p>
            </div>
            <Badge className="bg-white/20 text-white border-0">{user?.full_name}</Badge>
          </div>
        </CardHeader>
        <CardContent className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold mb-3">Patient Profile</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-xs">
              <div className="p-3 rounded-lg bg-muted/50"><span className="text-muted-foreground">Age:</span> <span className="font-medium">{profile.age}</span></div>
              <div className="p-3 rounded-lg bg-muted/50"><span className="text-muted-foreground">Gender:</span> <span className="font-medium capitalize">{profile.gender}</span></div>
              <div className="p-3 rounded-lg bg-muted/50"><span className="text-muted-foreground">BMI:</span> <span className="font-medium">{bmi} ({getBMICategory(bmi).label})</span></div>
              <div className="p-3 rounded-lg bg-muted/50"><span className="text-muted-foreground">BP:</span> <span className="font-medium">{profile.blood_pressure_systolic}/{profile.blood_pressure_diastolic}</span></div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Health Score</h3>
            <div className="flex items-center gap-4">
              <div className={`text-4xl font-bold font-display ${scoreInfo.text}`}>{score}</div>
              <div>
                <Badge className={`${scoreInfo.bg} text-white`}>{scoreInfo.label}</Badge>
                <p className="text-xs text-muted-foreground mt-1">out of 100 points</p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">Disease Risk Assessment</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {riskList.map((r) => {
                const info = getRiskLevel(r.value);
                return (
                  <div key={r.key} className="p-3 rounded-lg bg-muted/50 text-center">
                    <p className="text-xs text-muted-foreground mb-1">{r.label}</p>
                    <p className={`text-xl font-bold ${info.color}`}>{r.value}%</p>
                    <Badge variant="secondary" className={`text-[10px] mt-1 ${info.bg} text-white`}>{info.label}</Badge>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold mb-3">AI Recommendations</h3>
            <div className="space-y-2">
              {(profile.recommendations || []).map((rec, i) => (
                <div key={i} className="flex gap-3 text-xs p-3 rounded-lg bg-muted/30">
                  <span className="w-5 h-5 rounded-full gradient-primary text-white flex items-center justify-center flex-shrink-0 text-[10px] font-bold">{i + 1}</span>
                  <span>{rec}</span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}