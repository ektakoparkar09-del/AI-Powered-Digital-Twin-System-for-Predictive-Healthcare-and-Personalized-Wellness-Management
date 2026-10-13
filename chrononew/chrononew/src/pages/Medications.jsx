const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Pill, Plus, Loader2, Trash2, Clock, User, Calendar, CheckCircle2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { format, differenceInCalendarDays } from "date-fns";

const empty = { name: "", dosage: "", frequency: "Once daily", schedule_times: "08:00", doctor_name: "", start_date: new Date().toISOString().slice(0, 10), refill_date: "", notes: "" };

export default function Medications() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);

  const { data: meds } = useQuery({
    queryKey: ["medications"],
    queryFn: () => db.entities.Medication.filter({ created_by_id: user?.id }, "-created_date", 100),
    enabled: !!user?.id,
  });

  const createMed = useMutation({
    mutationFn: (data) => db.entities.Medication.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["medications"] }); setShowForm(false); setForm(empty); },
  });
  const updateMed = useMutation({
    mutationFn: ({ id, data }) => db.entities.Medication.update(id, data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medications"] }),
  });
  const deleteMed = useMutation({
    mutationFn: (id) => db.entities.Medication.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["medications"] }),
  });

  const submit = (e) => {
    e.preventDefault();
    createMed.mutate({
      ...form,
      schedule_times: form.schedule_times.split(",").map((s) => s.trim()).filter(Boolean),
    });
  };

  const active = (meds || []).filter((m) => m.active);
  const inactive = (meds || []).filter((m) => !m.active);

  const todaySchedule = active.flatMap((m) =>
    (m.schedule_times || []).map((t) => ({ med: m.name, time: t, dose: m.dosage }))
  ).sort((a, b) => a.time.localeCompare(b.time));

  return (
    <div className="space-y-6">
      <PageHeader
        title="Medication Management"
        subtitle="Track prescriptions, schedules, and refills"
        icon={Pill}
        action={
          <Button className="gradient-primary text-white rounded-xl" onClick={() => setShowForm((s) => !s)}>
            <Plus className="w-4 h-4 mr-1" /> Add Medicine
          </Button>
        }
      />

      {showForm && (
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-base font-heading">New Medication</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Medicine Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="e.g. Metformin" />
              </div>
              <div>
                <Label className="text-xs">Dosage</Label>
                <Input value={form.dosage} onChange={(e) => setForm({ ...form, dosage: e.target.value })} required placeholder="e.g. 500mg" />
              </div>
              <div>
                <Label className="text-xs">Frequency</Label>
                <Input value={form.frequency} onChange={(e) => setForm({ ...form, frequency: e.target.value })} placeholder="Once daily" />
              </div>
              <div>
                <Label className="text-xs">Schedule Times (comma separated)</Label>
                <Input value={form.schedule_times} onChange={(e) => setForm({ ...form, schedule_times: e.target.value })} placeholder="08:00, 20:00" />
              </div>
              <div>
                <Label className="text-xs">Doctor Name</Label>
                <Input value={form.doctor_name} onChange={(e) => setForm({ ...form, doctor_name: e.target.value })} placeholder="Dr. Smith" />
              </div>
              <div>
                <Label className="text-xs">Start Date</Label>
                <Input type="date" value={form.start_date} onChange={(e) => setForm({ ...form, start_date: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Refill Date</Label>
                <Input type="date" value={form.refill_date} onChange={(e) => setForm({ ...form, refill_date: e.target.value })} />
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs">Notes</Label>
                <Textarea value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} rows={2} />
              </div>
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" className="gradient-primary text-white rounded-xl" disabled={createMed.isPending}>
                  {createMed.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Medication"}
                </Button>
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {(meds || []).length === 0 && !showForm && (
        <EmptyState icon={Pill} title="No medications yet" description="Add your prescriptions to manage schedules, dosages, and refill reminders." ctaLabel="Add Medicine" ctaTo="#" />
      )}

      {todaySchedule.length > 0 && (
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-base font-heading flex items-center gap-2"><Clock className="w-4 h-4 text-primary" /> Today's Schedule</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {todaySchedule.map((s, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 rounded-xl bg-muted/50 text-sm">
                  <span className="font-semibold text-primary">{s.time}</span>
                  <span>{s.med}</span>
                  <span className="text-xs text-muted-foreground">{s.dose}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Card className="glass-card border-border/50">
        <CardHeader><CardTitle className="text-base font-heading">Active Medications</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-3">
            <AnimatePresence>
              {active.map((m) => {
                const refillDays = m.refill_date ? differenceInCalendarDays(new Date(m.refill_date), new Date()) : null;
                return (
                  <motion.div key={m.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, x: -20 }}
                    className="p-4 rounded-xl bg-muted/40 border border-border/50">
                    <div className="flex items-start justify-between">
                      <div>
                        <div className="flex items-center gap-2">
                          <Pill className="w-4 h-4 text-primary" />
                          <span className="font-semibold">{m.name}</span>
                          <Badge variant="secondary">{m.dosage}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 flex flex-wrap gap-x-3 gap-y-1">
                          <span>⏱ {m.frequency}</span>
                          {(m.schedule_times || []).length > 0 && <span>🕒 {(m.schedule_times || []).join(", ")}</span>}
                          {m.doctor_name && <span><User className="w-3 h-3 inline mr-0.5" />{m.doctor_name}</span>}
                        </p>
                        {refillDays !== null && refillDays <= 14 && (
                          <Badge className={`mt-2 ${refillDays <= 3 ? "bg-red-500" : "bg-orange-500"} text-white`}>
                            <Calendar className="w-3 h-3 mr-1" /> Refill in {Math.max(0, refillDays)}d
                          </Badge>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button size="icon" variant="ghost" onClick={() => updateMed.mutate({ id: m.id, data: { active: false } })} title="Mark complete">
                          <CheckCircle2 className="w-4 h-4 text-green-500" />
                        </Button>
                        <Button size="icon" variant="ghost" onClick={() => deleteMed.mutate(m.id)} title="Delete">
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    {m.notes && <p className="text-xs text-muted-foreground mt-2 italic">{m.notes}</p>}
                  </motion.div>
                );
              })}
            </AnimatePresence>
            {active.length === 0 && <p className="text-sm text-muted-foreground text-center py-4">No active medications.</p>}
          </div>
        </CardContent>
      </Card>

      {inactive.length > 0 && (
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-base font-heading">Medication History</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {inactive.map((m) => (
                <div key={m.id} className="flex items-center justify-between p-3 rounded-lg bg-muted/30 opacity-70 text-sm">
                  <span>{m.name} — {m.dosage}</span>
                  <span className="text-xs text-muted-foreground">Started {m.start_date ? format(new Date(m.start_date), "MMM d, yyyy") : "—"}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}