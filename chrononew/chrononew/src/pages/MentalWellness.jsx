const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useMemo, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/lib/AuthContext";
import { moodScore } from "@/lib/wellnessUtils";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import ProgressRing from "@/components/shared/ProgressRing";
import { Smile, Plus, Loader2, Sparkles, Wind, Brain, Play, Pause, RotateCcw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";

const todayStr = () => new Date().toISOString().slice(0, 10);
const MOODS = [
  { key: "great", label: "Great", emoji: "😄", color: "bg-green-500" },
  { key: "good", label: "Good", emoji: "🙂", color: "bg-emerald-500" },
  { key: "okay", label: "Okay", emoji: "😐", color: "bg-yellow-500" },
  { key: "low", label: "Low", emoji: "😔", color: "bg-orange-500" },
  { key: "bad", label: "Bad", emoji: "😢", color: "bg-red-500" },
];

function Slider({ label, value, onChange, leftLabel, rightLabel }) {
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="font-medium">{label}</span>
        <span className="text-muted-foreground">{value}/5</span>
      </div>
      <input type="range" min="1" max="5" value={value} onChange={(e) => onChange(Number(e.target.value))} className="w-full accent-primary" />
      <div className="flex justify-between text-[10px] text-muted-foreground">
        <span>{leftLabel}</span><span>{rightLabel}</span>
      </div>
    </div>
  );
}

function BreathingExercise() {
  const [active, setActive] = useState(false);
  const [phase, setPhase] = useState("Inhale");
  return (
    <Card className="glass-card border-border/50">
      <CardHeader><CardTitle className="text-base font-heading flex items-center gap-2"><Wind className="w-4 h-4 text-primary" /> Breathing Exercise</CardTitle></CardHeader>
      <CardContent className="flex flex-col items-center gap-4 py-6">
        <div className="relative w-32 h-32 flex items-center justify-center">
          <motion.div
            className="w-24 h-24 rounded-full gradient-primary opacity-80"
            animate={active ? { scale: [1, 1.6, 1.6, 1], opacity: [0.6, 0.9, 0.9, 0.6] } : { scale: 1, opacity: 0.6 }}
            transition={active ? { duration: 8, repeat: Infinity, times: [0, 0.25, 0.5, 1] } : { duration: 0.4 }}
            onAnimationComplete={() => { if (active) setPhase((p) => (p === "Inhale" ? "Hold" : p === "Hold" ? "Exhale" : "Inhale")); }}
          />
          <span className="absolute text-white text-sm font-bold">{active ? phase : "Ready"}</span>
        </div>
        <Button className="gradient-primary text-white rounded-xl" onClick={() => setActive((a) => !a)}>
          {active ? <><Pause className="w-4 h-4 mr-1" /> Stop</> : <><Play className="w-4 h-4 mr-1" /> Start 4-7-8</>}
        </Button>
        <p className="text-xs text-muted-foreground text-center">Calms the nervous system and reduces anxiety.</p>
      </CardContent>
    </Card>
  );
}

function MeditationTimer() {
  const [duration, setDuration] = useState(5);
  const [remaining, setRemaining] = useState(0);
  const [running, setRunning] = useState(false);
  const ref = useRef(null);
  useEffect(() => {
    if (running) {
      ref.current = setInterval(() => {
        setRemaining((r) => {
          if (r <= 1) { clearInterval(ref.current); setRunning(false); return 0; }
          return r - 1;
        });
      }, 1000);
    }
    return () => clearInterval(ref.current);
  }, [running]);

  const start = () => { setRemaining(duration * 60); setRunning(true); };
  const mm = String(Math.floor(remaining / 60)).padStart(2, "0");
  const ss = String(remaining % 60).padStart(2, "0");

  return (
    <Card className="glass-card border-border/50">
      <CardHeader><CardTitle className="text-base font-heading flex items-center gap-2"><Brain className="w-4 h-4 text-primary" /> Meditation Timer</CardTitle></CardHeader>
      <CardContent className="flex flex-col items-center gap-4 py-6">
        <div className="text-4xl font-bold font-display">{running || remaining ? `${mm}:${ss}` : `${duration}:00`}</div>
        <div className="flex gap-2">
          {[3, 5, 10, 15].map((d) => (
            <button key={d} onClick={() => setDuration(d)} className={`px-3 py-1.5 rounded-lg text-xs font-medium ${duration === d ? "gradient-primary text-white" : "bg-muted text-muted-foreground"}`}>{d} min</button>
          ))}
        </div>
        <div className="flex gap-2">
          <Button className="gradient-primary text-white rounded-xl" onClick={start} disabled={running}><Play className="w-4 h-4 mr-1" /> Start</Button>
          <Button variant="outline" className="rounded-xl" onClick={() => { setRunning(false); setRemaining(0); }} disabled={!running && !remaining}><RotateCcw className="w-4 h-4 mr-1" /> Reset</Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function MentalWellness() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ log_date: todayStr(), mood: "good", stress: 3, anxiety: 3, energy: 3, happiness: 3, note: "" });
  const [tips, setTips] = useState(null);
  const [loadingTips, setLoadingTips] = useState(false);

  const { data: logs } = useQuery({
    queryKey: ["mood-logs"],
    queryFn: () => db.entities.MoodLog.filter({ created_by_id: user?.id }, "-log_date", 60),
    enabled: !!user?.id,
  });

  const sorted = (logs || []).sort((a, b) => new Date(a.log_date) - new Date(b.log_date));
  const latest = sorted[sorted.length - 1];
  const score = latest ? moodScore(latest) : 0;

  const weekData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      const k = d.toISOString().slice(0, 10);
      const log = sorted.find((l) => l.log_date === k);
      return { date: format(d, "EEE"), score: log ? moodScore(log) : 0 };
    });
  }, [sorted]);

  const calendar = useMemo(() => {
    const moodColor = { great: "bg-green-500", good: "bg-emerald-500", okay: "bg-yellow-500", low: "bg-orange-500", bad: "bg-red-500" };
    return Array.from({ length: 30 }).map((_, i) => {
      const d = subDays(new Date(), 29 - i);
      const k = d.toISOString().slice(0, 10);
      const log = sorted.find((l) => l.log_date === k);
      return { date: d, mood: log?.mood, color: log ? moodColor[log.mood] : "bg-muted" };
    });
  }, [sorted]);

  const addLog = useMutation({
    mutationFn: (data) => db.entities.MoodLog.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["mood-logs"] }),
  });

  const submit = (e) => {
    e.preventDefault();
    addLog.mutate(form);
    setForm({ ...form, note: "" });
  };

  const getTips = async () => {
    setLoadingTips(true);
    try {
      const recent = sorted.slice(-7).map((l) => `${l.log_date}: mood ${l.mood}, stress ${l.stress}/5, note ${l.note || "-"}`).join("; ");
      const res = await db.integrations.Core.InvokeLLM({
        prompt: `You are a mental wellness coach. Based on recent mood logs (${recent || "none"}), give 4 supportive, practical mental wellness suggestions. Return JSON { tips: string[] }.`,
        response_json_schema: { type: "object", properties: { tips: { type: "array", items: { type: "string" } } } },
      });
      setTips(res.tips);
    } catch {
      setTips(["Practice 5 minutes of deep breathing daily.", "Write down three things you're grateful for.", "Take a short walk outside.", "Limit social media before bed."]);
    }
    setLoadingTips(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Mental Wellness Center" subtitle="Track mood, practice mindfulness, and nurture your mind" icon={Smile} />

      {sorted.length === 0 && !addLog.isPending && (
        <EmptyState icon={Smile} title="Begin your wellness journey" description="Log your first mood entry to start tracking your mental wellbeing." />
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-base font-heading">Wellness Score</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center gap-2">
            <ProgressRing value={score} color="hsl(168, 76%, 42%)" />
            <p className="text-xs text-muted-foreground text-center">{latest ? `Latest mood: ${latest.mood}` : "Log your mood to score"}</p>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50 md:col-span-2">
          <CardHeader><CardTitle className="text-base font-heading">Daily Check-in</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-3">
              <div className="flex gap-2 justify-between">
                {MOODS.map((m) => (
                  <button key={m.key} type="button" onClick={() => setForm({ ...form, mood: m.key })}
                    className={`flex-1 flex flex-col items-center gap-1 p-2 rounded-xl border-2 transition-all ${form.mood === m.key ? m.color + " border-primary text-white" : "border-border bg-muted/30"}`}>
                    <span className="text-2xl">{m.emoji}</span>
                    <span className="text-[10px] font-medium">{m.label}</span>
                  </button>
                ))}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Slider label="Stress" value={form.stress} onChange={(v) => setForm({ ...form, stress: v })} leftLabel="Calm" rightLabel="Stressed" />
                <Slider label="Anxiety" value={form.anxiety} onChange={(v) => setForm({ ...form, anxiety: v })} leftLabel="Relaxed" rightLabel="Anxious" />
                <Slider label="Energy" value={form.energy} onChange={(v) => setForm({ ...form, energy: v })} leftLabel="Drained" rightLabel="Energetic" />
                <Slider label="Happiness" value={form.happiness} onChange={(v) => setForm({ ...form, happiness: v })} leftLabel="Low" rightLabel="High" />
              </div>
              <Textarea placeholder="Today's journal entry..." value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} rows={2} />
              <Button type="submit" className="w-full gradient-primary text-white rounded-xl" disabled={addLog.isPending}>
                {addLog.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" /> Save Entry</>}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <BreathingExercise />
        <MeditationTimer />
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-heading flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> AI Wellness Suggestions</CardTitle>
          <Button variant="outline" size="sm" onClick={getTips} disabled={loadingTips}>
            {loadingTips ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get Suggestions"}
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
          ) : <p className="text-sm text-muted-foreground">Get personalized mindfulness suggestions from AI.</p>}
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-base font-heading">Weekly Wellness Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "11px" }} />
                  <Line type="monotone" dataKey="score" stroke="hsl(168, 76%, 42%)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-base font-heading">Mood Calendar (30 days)</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-10 gap-1.5">
              {calendar.map((c, i) => (
                <motion.div key={i} initial={{ opacity: 0, scale: 0.5 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.01 }}
                  title={`${format(c.date, "MMM d")}${c.mood ? ` — ${c.mood}` : ""}`}
                  className={`aspect-square rounded-md ${c.color} ${!c.mood ? "opacity-30" : ""}`} />
              ))}
            </div>
            <div className="flex flex-wrap gap-2 mt-3">
              {MOODS.map((m) => (
                <span key={m.key} className="flex items-center gap-1 text-[10px] text-muted-foreground">
                  <span className={`w-2.5 h-2.5 rounded ${m.color}`} /> {m.label}
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}