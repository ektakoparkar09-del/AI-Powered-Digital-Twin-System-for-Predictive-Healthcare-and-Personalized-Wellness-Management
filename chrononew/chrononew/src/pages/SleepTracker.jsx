const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/lib/AuthContext";
import { sleepScore } from "@/lib/wellnessUtils";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import ProgressRing from "@/components/shared/ProgressRing";
import { Moon, Plus, Loader2, Sparkles, TrendingUp } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import { format, subDays } from "date-fns";

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function SleepTracker() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState({ log_date: todayStr(), hours: 7, quality: "good", bedtime: "23:00", wake_time: "07:00" });
  const [tips, setTips] = useState(null);
  const [loadingTips, setLoadingTips] = useState(false);

  const { data: logs } = useQuery({
    queryKey: ["sleep-logs"],
    queryFn: () => db.entities.SleepLog.filter({ created_by_id: user?.id }, "-log_date", 60),
    enabled: !!user?.id,
  });

  const sorted = (logs || []).sort((a, b) => new Date(a.log_date) - new Date(b.log_date));
  const today = sorted.find((l) => l.log_date === todayStr());
  const score = today ? sleepScore(today.hours, today.quality) : 0;

  const weekData = useMemo(() => {
    return Array.from({ length: 7 }).map((_, i) => {
      const d = subDays(new Date(), 6 - i);
      const k = d.toISOString().slice(0, 10);
      const log = sorted.find((l) => l.log_date === k);
      return { date: format(d, "EEE"), hours: log?.hours || 0, quality: log?.quality || "—" };
    });
  }, [sorted]);

  const monthAvg = sorted.length
    ? (sorted.slice(-30).reduce((s, l) => s + (l.hours || 0), 0) / Math.min(30, sorted.length)).toFixed(1)
    : "0";

  const addLog = useMutation({
    mutationFn: (data) => db.entities.SleepLog.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["sleep-logs"] }),
  });

  const submit = (e) => {
    e.preventDefault();
    addLog.mutate({ ...form, hours: Number(form.hours) });
    setForm({ ...form, hours: 7 });
  };

  const getTips = async () => {
    setLoadingTips(true);
    try {
      const res = await db.integrations.Core.InvokeLLM({
        prompt: `Based on sleep data: avg ${monthAvg}h/night, recent quality ${(sorted.slice(-7).map(l => l.quality).join(", ")) || "none"}. Give 4 concise, actionable sleep improvement tips. Return as a JSON object { tips: string[] }.`,
        response_json_schema: { type: "object", properties: { tips: { type: "array", items: { type: "string" } } } },
      });
      setTips(res.tips);
    } catch {
      setTips(["Maintain a consistent bedtime and wake time.", "Avoid screens 1 hour before bed.", "Keep the bedroom cool and dark.", "Limit caffeine after 2 PM."]);
    }
    setLoadingTips(false);
  };

  return (
    <div className="space-y-6">
      <PageHeader title="Sleep Tracker" subtitle="Monitor sleep quality and build better rest habits" icon={Moon} />

      {sorted.length === 0 && !addLog.isPending && (
        <EmptyState icon={Moon} title="No sleep data yet" description="Log your first night of sleep to start tracking trends and get AI insights." />
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <Card className="glass-card border-border/50 md:col-span-1">
          <CardHeader><CardTitle className="text-base font-heading">Today's Sleep Score</CardTitle></CardHeader>
          <CardContent className="flex flex-col items-center gap-3">
            <ProgressRing value={score} color="hsl(262, 83%, 60%)" />
            <p className="text-xs text-muted-foreground text-center">
              {today ? `${today.hours}h · ${today.quality}` : "Log last night's sleep"}
            </p>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-base font-heading">Log Sleep</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="space-y-3">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-xs">Date</Label>
                  <Input type="date" value={form.log_date} onChange={(e) => setForm({ ...form, log_date: e.target.value })} required />
                </div>
                <div>
                  <Label className="text-xs">Hours</Label>
                  <Input type="number" step="0.5" min="0" max="14" value={form.hours} onChange={(e) => setForm({ ...form, hours: e.target.value })} required />
                </div>
                <div>
                  <Label className="text-xs">Bedtime</Label>
                  <Input type="time" value={form.bedtime} onChange={(e) => setForm({ ...form, bedtime: e.target.value })} />
                </div>
                <div>
                  <Label className="text-xs">Wake Time</Label>
                  <Input type="time" value={form.wake_time} onChange={(e) => setForm({ ...form, wake_time: e.target.value })} />
                </div>
              </div>
              <div>
                <Label className="text-xs">Quality</Label>
                <Select value={form.quality} onValueChange={(v) => setForm({ ...form, quality: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="excellent">Excellent</SelectItem>
                    <SelectItem value="good">Good</SelectItem>
                    <SelectItem value="fair">Fair</SelectItem>
                    <SelectItem value="poor">Poor</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" className="w-full gradient-primary text-white rounded-xl" disabled={addLog.isPending}>
                {addLog.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Plus className="w-4 h-4 mr-1" /> Save Entry</>}
              </Button>
            </form>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-base font-heading flex items-center gap-2"><TrendingUp className="w-4 h-4 text-primary" /> Weekly Trend</CardTitle></CardHeader>
          <CardContent>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={weekData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis domain={[0, 12]} tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "11px" }} />
                  <Line type="monotone" dataKey="hours" stroke="hsl(262, 83%, 60%)" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="grid grid-cols-2 gap-3 mt-3">
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-[10px] text-muted-foreground">Monthly Avg</p>
                <p className="text-lg font-bold">{monthAvg}h</p>
              </div>
              <div className="p-3 rounded-lg bg-muted/50 text-center">
                <p className="text-[10px] text-muted-foreground">Entries</p>
                <p className="text-lg font-bold">{sorted.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="glass-card border-border/50">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-base font-heading flex items-center gap-2"><Sparkles className="w-4 h-4 text-primary" /> AI Sleep Suggestions</CardTitle>
          <Button variant="outline" size="sm" onClick={getTips} disabled={loadingTips}>
            {loadingTips ? <Loader2 className="w-4 h-4 animate-spin" /> : "Get Tips"}
          </Button>
        </CardHeader>
        <CardContent>
          {tips ? (
            <div className="grid sm:grid-cols-2 gap-3">
              {tips.map((t, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.1 }} className="flex gap-2 p-3 rounded-lg bg-muted/40 text-xs">
                  <span className="w-5 h-5 rounded-full gradient-primary text-white flex items-center justify-center text-[10px] font-bold flex-shrink-0">{i + 1}</span>
                  <span>{t}</span>
                </motion.div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">Click "Get Tips" for personalized AI sleep recommendations.</p>
          )}
        </CardContent>
      </Card>

      <Card className="glass-card border-border/50">
        <CardHeader><CardTitle className="text-base font-heading">Recent Entries</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {[...sorted].reverse().map((l, i) => (
              <div key={l.id || i} className="flex items-center justify-between p-3 rounded-lg bg-muted/40 text-sm">
                <span className="font-medium">{format(new Date(l.log_date), "MMM d, yyyy")}</span>
                <span>{l.hours}h · <span className="capitalize text-muted-foreground">{l.quality}</span></span>
                <span className="text-xs text-muted-foreground">{l.bedtime} → {l.wake_time}</span>
              </div>
            ))}
            {sorted.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No entries yet.</p>}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}