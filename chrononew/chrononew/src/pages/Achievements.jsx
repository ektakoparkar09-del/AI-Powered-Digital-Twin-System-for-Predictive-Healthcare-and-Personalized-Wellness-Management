const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useMemo, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/lib/AuthContext";
import { computeAchievements, waterGoal, DAILY_CHALLENGES, WEEKLY_CHALLENGES } from "@/lib/wellnessUtils";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Trophy, Star, Flame, Crown, Medal, Lock } from "lucide-react";
import { motion } from "framer-motion";
import confetti from "canvas-confetti";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { format, subDays, startOfWeek } from "date-fns";

export default function Achievements() {
  const { user } = useAuth();

  const { data: profiles } = useQuery({
    queryKey: ["health-profiles"],
    queryFn: () => db.entities.HealthProfile.filter({ created_by_id: user?.id }, "-created_date", 1),
    enabled: !!user?.id,
  });
  const profile = profiles?.[0];
  const { data: exerciseLogs } = useQuery({ queryKey: ["exercise-logs"], queryFn: () => db.entities.ExerciseLog.filter({ created_by_id: user?.id }, "-log_date", 60), enabled: !!user?.id });
  const { data: waterLogs } = useQuery({ queryKey: ["water-logs"], queryFn: () => db.entities.WaterLog.filter({ created_by_id: user?.id }, "-log_date", 60), enabled: !!user?.id });
  const { data: sleepLogs } = useQuery({ queryKey: ["sleep-logs"], queryFn: () => db.entities.SleepLog.filter({ created_by_id: user?.id }, "-log_date", 60), enabled: !!user?.id });
  const { data: moodLogs } = useQuery({ queryKey: ["mood-logs"], queryFn: () => db.entities.MoodLog.filter({ created_by_id: user?.id }, "-log_date", 60), enabled: !!user?.id });

  const ach = useMemo(
    () => computeAchievements({ profile, exerciseLogs: exerciseLogs || [], waterLogs: waterLogs || [], sleepLogs: sleepLogs || [], moodLogs: moodLogs || [] }),
    [profile, exerciseLogs, waterLogs, sleepLogs, moodLogs]
  );

  const todayStr = new Date().toISOString().slice(0, 10);
  const todayWater = (waterLogs || []).find((l) => l.log_date === todayStr)?.glasses || 0;
  const todaySleep = (sleepLogs || []).find((l) => l.log_date === todayStr);
  const todayMood = (moodLogs || []).find((l) => l.log_date === todayStr);
  const todayEx = (exerciseLogs || []).find((l) => l.log_date === todayStr);

  const dailyProgress = {
    water: todayWater, sleep: todaySleep ? 1 : 0, mood: todayMood ? 1 : 0, exercise: todayEx?.duration_min || 0,
  };

  const weekStart = startOfWeek(new Date()).toISOString().slice(0, 10);
  const weekEx = (exerciseLogs || []).filter((l) => l.log_date >= weekStart).length;
  const goal = waterGoal(profile?.weight_kg);
  const weekWaterDays = Array.from({ length: 7 }).filter((_, i) => {
    const k = subDays(new Date(), i).toISOString().slice(0, 10);
    const w = (waterLogs || []).find((l) => l.log_date === k);
    return w && (w.glasses || 0) >= goal;
  }).length;
  const weekSleepLogs = (sleepLogs || []).filter((l) => l.log_date >= weekStart);
  const weekSleepAvg = weekSleepLogs.length ? weekSleepLogs.reduce((s, l) => s + l.hours, 0) / weekSleepLogs.length : 0;
  const weekProgress = { workouts: weekEx, hydration: weekWaterDays, sleep_avg: Math.round(weekSleepAvg) };

  useEffect(() => {
    if (ach.list.filter((a) => a.unlocked).length > 0) {
      const t = setTimeout(() => confetti({ particleCount: 80, spread: 70, origin: { y: 0.3 } }), 400);
      return () => clearTimeout(t);
    }
  }, [ach.list.length]);

  const monthlyGoals = [
    { label: "20 workouts", value: Math.min((exerciseLogs || []).length, 20), target: 20 },
    { label: "30 mood logs", value: Math.min((moodLogs || []).length, 30), target: 30 },
    { label: "14 sleep logs", value: Math.min((sleepLogs || []).length, 14), target: 14 },
  ];

  // Mock leaderboard
  const peers = [
    { name: "Alex M.", points: 620 }, { name: "Sam R.", points: 480 }, { name: "Jordan K.", points: 360 }, { name: "Taylor P.", points: 250 }, { name: "Casey L.", points: 180 },
  ];
  const leaderboard = [...peers, { name: "You", points: ach.points, you: true }].sort((a, b) => b.points - a.points);

  if (!profile && (exerciseLogs || []).length === 0) {
    return (
      <div className="space-y-6">
        <PageHeader title="Achievements" subtitle="Earn points, level up, and stay motivated" icon={Trophy} />
        <EmptyState icon={Trophy} title="No achievements yet" description="Create a profile and log activities to start earning badges and points." ctaLabel="Create Profile" ctaTo="/profile" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader title="Health Achievements" subtitle="Gamify your wellness journey" icon={Trophy} />

      {/* Level & XP */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6">
        <div className="flex flex-col sm:flex-row items-center gap-6">
          <div className="relative">
            <div className="w-20 h-20 rounded-2xl gradient-primary flex items-center justify-center">
              <Crown className="w-10 h-10 text-white" />
            </div>
            <Badge className="absolute -bottom-2 -right-2 bg-yellow-500 text-white border-0">Lvl {ach.level}</Badge>
          </div>
          <div className="flex-1 w-full">
            <div className="flex justify-between mb-1">
              <span className="font-bold font-heading">Health Points</span>
              <span className="text-sm font-bold text-yellow-500">{ach.points} XP</span>
            </div>
            <Progress value={(ach.xpInLevel / ach.xpForNext) * 100} className="h-3" />
            <p className="text-xs text-muted-foreground mt-1">{ach.xpForNext - ach.xpInLevel} XP to Level {ach.level + 1}</p>
          </div>
        </div>
      </motion.div>

      {/* Badges */}
      <Card className="glass-card border-border/50">
        <CardHeader><CardTitle className="text-base font-heading flex items-center gap-2"><Medal className="w-4 h-4 text-yellow-500" /> Badges</CardTitle></CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
            {ach.list.map((a, i) => (
              <motion.div key={a.key} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.05 }}
                whileHover={{ scale: 1.05 }}
                className={`relative p-4 rounded-2xl text-center border-2 ${a.unlocked ? "bg-gradient-to-br from-yellow-500/10 to-orange-500/10 border-yellow-500/30" : "bg-muted/30 border-border opacity-60"}`}>
                <div className={`w-14 h-14 rounded-full mx-auto flex items-center justify-center mb-2 ${a.unlocked ? "gradient-primary" : "bg-muted"}`}>
                  {a.unlocked ? <a.icon className="w-7 h-7 text-white" /> : <Lock className="w-6 h-6 text-muted-foreground" />}
                </div>
                <p className="text-sm font-semibold">{a.label}</p>
                <p className="text-[10px] text-muted-foreground mt-0.5">{a.desc}</p>
                <Badge className={`mt-2 ${a.unlocked ? "bg-yellow-500 text-white" : "bg-muted text-muted-foreground"}`}>+{a.points} XP</Badge>
              </motion.div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Daily challenges */}
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-base font-heading flex items-center gap-2"><Flame className="w-4 h-4 text-orange-500" /> Daily Challenges</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {DAILY_CHALLENGES.map((c) => {
              const val = dailyProgress[c.key] || 0;
              const pct = Math.min(100, (val / c.target) * 100);
              return (
                <div key={c.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1.5"><c.icon className="w-3.5 h-3.5 text-muted-foreground" /> {c.label}</span>
                    <span className="text-xs text-muted-foreground">{val}/{c.target}</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Weekly challenges */}
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-base font-heading flex items-center gap-2"><Star className="w-4 h-4 text-primary" /> Weekly Challenges</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            {WEEKLY_CHALLENGES.map((c) => {
              const val = weekProgress[c.key] || 0;
              const pct = Math.min(100, (val / c.target) * 100);
              return (
                <div key={c.key}>
                  <div className="flex justify-between text-sm mb-1">
                    <span className="flex items-center gap-1.5"><c.icon className="w-3.5 h-3.5 text-muted-foreground" /> {c.label}</span>
                    <span className="text-xs text-muted-foreground">{val}/{c.target}</span>
                  </div>
                  <Progress value={pct} className="h-2" />
                </div>
              );
            })}
            <div className="pt-2 border-t border-border/50">
              <p className="text-xs font-semibold mb-2">Monthly Goals</p>
              {monthlyGoals.map((g) => (
                <div key={g.label} className="flex justify-between text-xs mb-1">
                  <span>{g.label}</span>
                  <span className={g.value >= g.target ? "text-green-500 font-semibold" : "text-muted-foreground"}>{g.value}/{g.target}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Leaderboard */}
      <Card className="glass-card border-border/50">
        <CardHeader><CardTitle className="text-base font-heading flex items-center gap-2"><Trophy className="w-4 h-4 text-yellow-500" /> Leaderboard</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {leaderboard.map((p, i) => (
              <div key={p.name} className={`flex items-center gap-3 p-3 rounded-xl ${p.you ? "bg-primary/10 border border-primary/30" : "bg-muted/40"}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-yellow-500 text-white" : i === 1 ? "bg-gray-400 text-white" : i === 2 ? "bg-orange-600 text-white" : "bg-muted text-muted-foreground"}`}>{i + 1}</span>
                <span className="flex-1 text-sm font-medium">{p.name}</span>
                <Badge variant="secondary" className="text-xs">{p.points} XP</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}