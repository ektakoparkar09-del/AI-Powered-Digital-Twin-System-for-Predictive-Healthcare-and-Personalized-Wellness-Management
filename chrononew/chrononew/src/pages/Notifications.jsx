const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useMemo, useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";

import { useAuth } from "@/lib/AuthContext";
import { generateNotifications } from "@/lib/wellnessUtils";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Bell, CheckCheck, AlertTriangle, Info, AlertCircle } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { format } from "date-fns";

const STORAGE_KEY = "ct-notif-read";
const severityConfig = {
  critical: { icon: AlertCircle, color: "text-red-500", bg: "bg-red-500/10", border: "border-red-500/20", label: "Critical" },
  warning: { icon: AlertTriangle, color: "text-orange-500", bg: "bg-orange-500/10", border: "border-orange-500/20", label: "Warning" },
  info: { icon: Info, color: "text-blue-500", bg: "bg-blue-500/10", border: "border-blue-500/20", label: "Info" },
};

export default function Notifications() {
  const { user } = useAuth();

  const { data: profiles } = useQuery({ queryKey: ["health-profiles"], queryFn: () => db.entities.HealthProfile.filter({ created_by_id: user?.id }, "-created_date", 1), enabled: !!user?.id });
  const profile = profiles?.[0];
  const { data: medications } = useQuery({ queryKey: ["medications"], queryFn: () => db.entities.Medication.filter({ created_by_id: user?.id }, "-created_date", 30), enabled: !!user?.id });
  const { data: waterLogs } = useQuery({ queryKey: ["water-logs"], queryFn: () => db.entities.WaterLog.filter({ created_by_id: user?.id }, "-log_date", 14), enabled: !!user?.id });
  const { data: sleepLogs } = useQuery({ queryKey: ["sleep-logs"], queryFn: () => db.entities.SleepLog.filter({ created_by_id: user?.id }, "-log_date", 14), enabled: !!user?.id });
  const { data: exerciseLogs } = useQuery({ queryKey: ["exercise-logs"], queryFn: () => db.entities.ExerciseLog.filter({ created_by_id: user?.id }, "-log_date", 14), enabled: !!user?.id });

  const notifications = useMemo(
    () => generateNotifications({ profile, medications: medications || [], waterLogs: waterLogs || [], sleepLogs: sleepLogs || [], exerciseLogs: exerciseLogs || [] }),
    [profile, medications, waterLogs, sleepLogs, exerciseLogs]
  );

  const [readIds, setReadIds] = useState([]);
  useEffect(() => {
    try { setReadIds(JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]")); } catch { setReadIds([]); }
  }, []);
  const persist = (ids) => { setReadIds(ids); localStorage.setItem(STORAGE_KEY, JSON.stringify(ids)); };
  const markRead = (id) => { if (!readIds.includes(id)) persist([...readIds, id]); };
  const markAllRead = () => persist(notifications.map((n) => n.id));

  const unread = notifications.filter((n) => !readIds.includes(n.id)).length;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Notifications"
        subtitle="Stay informed about your health alerts and reminders"
        icon={Bell}
        action={
          <Button variant="outline" className="rounded-xl" onClick={markAllRead} disabled={unread === 0}>
            <CheckCheck className="w-4 h-4 mr-1" /> Mark all read
          </Button>
        }
      />

      {unread > 0 && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <Bell className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-semibold">{unread} unread notification{unread !== 1 ? "s" : ""}</p>
            <p className="text-xs text-muted-foreground">Review your latest health alerts and reminders below.</p>
          </div>
        </motion.div>
      )}

      <Card className="glass-card border-border/50">
        <CardHeader><CardTitle className="text-base font-heading">Notification Center</CardTitle></CardHeader>
        <CardContent>
          {notifications.length === 0 ? (
            <EmptyState icon={Bell} title="No notifications" description="You're all caught up! Health alerts will appear here." />
          ) : (
            <div className="space-y-3">
              {notifications.map((n, i) => {
                const cfg = severityConfig[n.type] || severityConfig.info;
                const isRead = readIds.includes(n.id);
                return (
                  <motion.div key={n.id} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.05 }}
                    onClick={() => markRead(n.id)}
                    className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-all ${cfg.bg} ${cfg.border} ${isRead ? "opacity-60" : ""}`}>
                    <div className={`w-9 h-9 rounded-lg ${cfg.bg} flex items-center justify-center flex-shrink-0`}>
                      <n.icon className={`w-4 h-4 ${cfg.color}`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <p className="text-sm font-semibold">{n.title}</p>
                        <Badge variant="outline" className={`text-[9px] ${cfg.color}`}>{cfg.label}</Badge>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      {n.date && <p className="text-[10px] text-muted-foreground/60 mt-1">{format(new Date(n.date), "MMM d, yyyy")}</p>}
                    </div>
                    {!isRead && <span className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
                  </motion.div>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}