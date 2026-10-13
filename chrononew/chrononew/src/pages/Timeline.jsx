const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/lib/AuthContext";
import { calculateHealthScore } from "@/lib/healthUtils";
import { buildTimeline, computeAchievements } from "@/lib/wellnessUtils";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { GitBranch, Sparkles, Trophy, TrendingUp, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { format, addMonths } from "date-fns";

export default function Timeline() {
  const { user } = useAuth();

  const { data: profiles } = useQuery({
    queryKey: ["health-profiles"],
    queryFn: () => db.entities.HealthProfile.filter({ created_by_id: user?.id }, "-created_date", 1),
    enabled: !!user?.id,
  });
  const profile = profiles?.[0];
  const { data: snapshots } = useQuery({
    queryKey: ["health-snapshots"],
    queryFn: () => db.entities.HealthSnapshot.filter({ created_by_id: user?.id }, "-snapshot_date", 30),
    enabled: !!user?.id,
  });
  const { data: medications } = useQuery({
    queryKey: ["medications"],
    queryFn: () => db.entities.Medication.filter({ created_by_id: user?.id }, "-created_date", 30),
    enabled: !!user?.id,
  });
  const { data: exerciseLogs } = useQuery({
    queryKey: ["exercise-logs"],
    queryFn: () => db.entities.ExerciseLog.filter({ created_by_id: user?.id }, "-log_date", 30),
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
  const { data: moodLogs } = useQuery({
    queryKey: ["mood-logs"],
    queryFn: () => db.entities.MoodLog.filter({ created_by_id: user?.id }, "-log_date", 30),
    enabled: !!user?.id,
  });

  const events = useMemo(
    () => buildTimeline({ profile, snapshots: snapshots || [], medications: medications || [], exerciseLogs: exerciseLogs || [] }),
    [profile, snapshots, medications, exerciseLogs]
  );

  const achievements = useMemo(
    () => computeAchievements({ profile, exerciseLogs: exerciseLogs || [], waterLogs: waterLogs || [], sleepLogs: sleepLogs || [], moodLogs: moodLogs || [] }),
    [profile, exerciseLogs, waterLogs, sleepLogs, moodLogs]
  );

  const sorted = (snapshots || []).sort((a, b) => new Date(a.snapshot_date) - new Date(b.snapshot_date));
  const lastScore = sorted.length ? sorted[sorted.length - 1].health_score : profile?.health_score || 50;
  const prevScore = sorted.length > 1 ? sorted[sorted.length - 2].health_score : lastScore;
  const delta = lastScore - prevScore;
  const forecast = [1, 2, 3].map((i) => ({
    month: format(addMonths(new Date(), i), "MMM yy"),
    score: Math.max(0, Math.min(100, Math.round(lastScore + delta * i * 0.6))),
  }));
  const combined = [...sorted.slice(-6).map((s) => ({ month: format(new Date(s.snapshot_date), "MMM d"), score: s.health_score })), ...forecast];

  const typeColor = {
    score: "bg-green-500", medication: "bg-purple-500", exercise: "bg-blue-500", recommendation: "bg-orange-500", achievement: "bg-yellow-500",
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Health Timeline" subtitle="Your complete health journey at a glance" icon={GitBranch} />

      {events.length === 0 && !profile && (
        <EmptyState icon={GitBranch} title="No timeline events yet" description="Create a profile and log activities to build your health timeline." ctaLabel="Create Profile" ctaTo="/profile" />
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm font-heading flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Future Forecast</CardTitle></CardHeader>
          <CardContent>
            <div className="h-48"><ResponsiveContainer width="100%" height="100%">
              <LineChart data={combined}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" tick={{ fontSize: 9 }} /><YAxis domain={[0, 100]} tick={{ fontSize: 9 }} />
                <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "11px" }} />
                <Line type="monotone" dataKey="score" stroke="hsl(168, 76%, 42%)" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="0" />
              </LineChart>
            </ResponsiveContainer></div>
            <p className="text-[10px] text-muted-foreground text-center mt-2">Projected health score trajectory</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm font-heading flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500" /> Achievements Earned</CardTitle></CardHeader>
          <CardContent>
            <div className="text-center mb-3">
              <p className="text-3xl font-bold font-display text-yellow-500">{achievements.list.filter((a) => a.unlocked).length}</p>
              <p className="text-xs text-muted-foreground">of {achievements.list.length} badges</p>
            </div>
            <div className="space-y-2 max-h-44 overflow-y-auto">
              {achievements.list.filter((a) => a.unlocked).map((a) => (
                <div key={a.key} className="flex items-center gap-2 p-2 rounded-lg bg-muted/40 text-xs">
                  <a.icon className="w-3.5 h-3.5 text-yellow-500" />
                  <span className="font-medium">{a.label}</span>
                  <Badge variant="secondary" className="text-[9px] ml-auto">+{a.points}</Badge>
                </div>
              ))}
              {achievements.list.filter((a) => a.unlocked).length === 0 && <p className="text-xs text-muted-foreground text-center py-4">No badges yet — keep going!</p>}
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-sm font-heading flex items-center gap-2"><Activity className="w-4 h-4 text-primary" /> Health Summary</CardTitle></CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Current Score</span><span className="font-bold">{lastScore}/100</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Snapshots</span><span>{sorted.length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Workouts</span><span>{(exerciseLogs || []).length}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Medications</span><span>{(medications || []).filter((m) => m.active).length} active</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Health Points</span><span className="font-bold text-yellow-500">{achievements.points} XP</span></div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader><CardTitle className="text-base font-heading">Chronological Timeline</CardTitle></CardHeader>
        <CardContent>
          <div className="relative pl-6">
            <div className="absolute left-2 top-0 bottom-0 w-0.5 bg-border" />
            <div className="space-y-4">
              {events.map((ev, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
                  className="relative">
                  <div className={`absolute -left-[18px] w-4 h-4 rounded-full ${typeColor[ev.type] || "bg-primary"} border-4 border-card`} />
                  <div className="p-3 rounded-xl bg-muted/40">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium flex items-center gap-1.5"><ev.icon className="w-3.5 h-3.5 text-muted-foreground" /> {ev.title}</span>
                      <span className="text-[10px] text-muted-foreground">{ev.date ? format(new Date(ev.date), "MMM d, yyyy") : ""}</span>
                    </div>
                    {ev.description && <p className="text-xs text-muted-foreground mt-1">{ev.description}</p>}
                  </div>
                </motion.div>
              ))}
              {events.length === 0 && <p className="text-sm text-muted-foreground text-center py-6">No events recorded yet.</p>}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}