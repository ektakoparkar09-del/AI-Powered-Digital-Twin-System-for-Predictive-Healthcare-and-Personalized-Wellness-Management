const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/lib/AuthContext";
import { waterGoal, hydrationPct } from "@/lib/wellnessUtils";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import ProgressRing from "@/components/shared/ProgressRing";
import { Droplets, Plus, Minus, Bell, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { format, subDays } from "date-fns";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function WaterTracker() {
  const { user } = useAuth();
  const qc = useQueryClient();

  const { data: profiles } = useQuery({
    queryKey: ["health-profiles"],
    queryFn: () => db.entities.HealthProfile.filter({ created_by_id: user?.id }, "-created_date", 1),
    enabled: !!user?.id,
  });
  const profile = profiles?.[0];

  const { data: logs } = useQuery({
    queryKey: ["water-logs"],
    queryFn: () => db.entities.WaterLog.filter({ created_by_id: user?.id }, "-log_date", 30),
    enabled: !!user?.id,
  });

  const goal = waterGoal(profile?.weight_kg || 70);
  const today = (logs || []).find((l) => l.log_date === todayStr());
  const glasses = today?.glasses || 0;
  const pct = hydrationPct(glasses, goal);
  const remaining = Math.max(0, goal - glasses);

  const sorted = (logs || []).sort((a, b) => new Date(a.log_date) - new Date(b.log_date));
  const weekData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      const k = d.toISOString().slice(0, 10);
      const log = sorted.find((l) => l.log_date === k);
      return { date: format(d, "EEE"), glasses: log?.glasses || 0, goal };
    });
  }, [sorted, goal]);

  const upsert = useMutation({
    mutationFn: async ({ delta }) => {
      const newG = Math.max(0, glasses + delta);
      if (today) {
        return db.entities.WaterLog.update(today.id, { glasses: newG, liters: Math.round(newG * 0.25 * 100) / 100 });
      }
      return db.entities.WaterLog.create({ log_date: todayStr(), glasses: newG, liters: Math.round(newG * 0.25 * 100) / 100 });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["water-logs"] }),
  });

  const reminders = ["08:00", "10:00", "12:00", "14:00", "16:00", "18:00", "20:00"];

  return (
    <div className="space-y-6">
      <PageHeader title="Water Tracker" subtitle="Stay hydrated and track your daily intake" icon={Droplets} />

      {sorted.length === 0 && (
        <EmptyState icon={Droplets} title="Start tracking hydration" description="Tap the buttons to log glasses of water throughout the day." />
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-base font-heading">Today's Hydration</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <ProgressRing value={pct} color="hsl(207, 90%, 54%)" />
            <p className="text-sm font-medium">{glasses} / {goal} glasses</p>
            <p className="text-xs text-muted-foreground">{remaining} glasses remaining · {(glasses * 0.25).toFixed(2)} L</p>
            <div className="flex gap-3">
              <Button variant="outline" size="icon" className="rounded-xl" onClick={() => upsert.mutate({ delta: -1 })}>
                <Minus className="w-4 h-4" />
              </Button>
              <Button className="gradient-primary text-white rounded-xl px-6" onClick={() => upsert.mutate({ delta: 1 })}>
                <Plus className="w-4 h-4 mr-1" /> Add Glass
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-base font-heading flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Weekly Statistics</CardTitle></CardHeader>
          <CardContent>
            <div className="h-44">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "11px" }} />
                  <Bar dataKey="glasses" fill="hsl(207, 90%, 54%)" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-[10px] text-muted-foreground">Week Total</p>
                <p className="text-lg font-bold">{weekData.reduce((s, d) => s + d.glasses, 0)}</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-[10px] text-muted-foreground">Daily Goal</p>
                <p className="text-lg font-bold">{goal} glasses</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-base font-heading flex items-center gap-2"><Bell className="w-4 h-4 text-primary" /> Reminder Schedule</CardTitle></CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground mb-3">Hydration reminders throughout the day:</p>
            <div className="grid grid-cols-4 gap-2">
              {reminders.map((t) => (
                <motion.div key={t} whileHover={{ scale: 1.05 }} className="p-2 rounded-lg bg-primary/10 text-center text-xs font-medium text-primary">
                  {t}
                </motion.div>
              ))}
            </div>
            <div className="mt-4 p-3 rounded-lg bg-muted/40 text-xs text-muted-foreground">
              💧 Your daily goal is calculated as ~35ml per kg of body weight ({goal} glasses / {(goal * 0.25).toFixed(1)} L).
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}