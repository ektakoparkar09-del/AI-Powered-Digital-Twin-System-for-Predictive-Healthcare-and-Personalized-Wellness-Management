const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/lib/AuthContext";
import { calculateDiseaseRisks } from "@/lib/healthUtils";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Users, Plus, Loader2, Trash2, Heart, Info } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

const RELATIONS = [
  { key: "father", label: "Father", emoji: "👨" },
  { key: "mother", label: "Mother", emoji: "👩" },
  { key: "brother", label: "Brother", emoji: "👦" },
  { key: "sister", label: "Sister", emoji: "👧" },
  { key: "grandfather", label: "Grandfather", emoji: "🧓" },
  { key: "grandmother", label: "Grandmother", emoji: "👵" },
  { key: "child", label: "Child", emoji: "👶" },
  { key: "other", label: "Other", emoji: "👤" },
];

const empty = { relation: "father", name: "", age: "", diseases: "", conditions: "", lifestyle: "", deceased: false };

export default function FamilyHistory() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [form, setForm] = useState(empty);
  const [showForm, setShowForm] = useState(false);

  const { data: members } = useQuery({
    queryKey: ["family-members"],
    queryFn: () => db.entities.FamilyMember.filter({ created_by_id: user?.id }, "-created_date", 50),
    enabled: !!user?.id,
  });
  const { data: profiles } = useQuery({
    queryKey: ["health-profiles"],
    queryFn: () => db.entities.HealthProfile.filter({ created_by_id: user?.id }, "-created_date", 1),
    enabled: !!user?.id,
  });
  const profile = profiles?.[0];

  const createMember = useMutation({
    mutationFn: (data) => db.entities.FamilyMember.create(data),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["family-members"] }); setShowForm(false); setForm(empty); },
  });
  const deleteMember = useMutation({
    mutationFn: (id) => db.entities.FamilyMember.delete(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["family-members"] }),
  });

  const submit = (e) => {
    e.preventDefault();
    createMember.mutate({
      ...form,
      age: form.age ? Number(form.age) : null,
      diseases: form.diseases.split(",").map((s) => s.trim()).filter(Boolean),
      conditions: form.conditions.split(",").map((s) => s.trim()).filter(Boolean),
    });
  };

  const hereditaryDiseases = useMemo(() => {
    const set = new Set();
    (members || []).forEach((m) => (m.diseases || []).forEach((d) => set.add(d.toLowerCase())));
    return Array.from(set);
  }, [members]);

  const baseRisks = calculateDiseaseRisks(profile);
  const hereditaryBoost = hereditaryDiseases.length * 3;

  return (
    <div className="space-y-6">
      <PageHeader
        title="Family Health History"
        subtitle="Build your family health tree and improve AI predictions"
        icon={Users}
        action={
          <Button className="gradient-primary text-white rounded-xl" onClick={() => setShowForm((s) => !s)}>
            <Plus className="w-4 h-4 mr-1" /> Add Member
          </Button>
        }
      />

      {showForm && (
        <Card className="glass-card border-border/50">
          <CardHeader><CardTitle className="text-base font-heading">Add Family Member</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={submit} className="grid md:grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Relation</Label>
                <Select value={form.relation} onValueChange={(v) => setForm({ ...form, relation: v })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {RELATIONS.map((r) => <SelectItem key={r.key} value={r.key}>{r.label}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label className="text-xs">Name</Label>
                <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Optional" />
              </div>
              <div>
                <Label className="text-xs">Age</Label>
                <Input type="number" value={form.age} onChange={(e) => setForm({ ...form, age: e.target.value })} />
              </div>
              <div>
                <Label className="text-xs">Lifestyle</Label>
                <Input value={form.lifestyle} onChange={(e) => setForm({ ...form, lifestyle: e.target.value })} placeholder="Active, smoker, etc." />
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs">Diseases (comma separated)</Label>
                <Input value={form.diseases} onChange={(e) => setForm({ ...form, diseases: e.target.value })} placeholder="diabetes, hypertension" />
              </div>
              <div className="md:col-span-2">
                <Label className="text-xs">Medical Conditions</Label>
                <Textarea value={form.conditions} onChange={(e) => setForm({ ...form, conditions: e.target.value })} rows={2} />
              </div>
              <label className="flex items-center gap-2 text-xs md:col-span-2">
                <input type="checkbox" checked={form.deceased} onChange={(e) => setForm({ ...form, deceased: e.target.checked })} className="accent-primary" />
                Deceased
              </label>
              <div className="md:col-span-2 flex gap-2">
                <Button type="submit" className="gradient-primary text-white rounded-xl" disabled={createMember.isPending}>
                  {createMember.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : "Save Member"}
                </Button>
                <Button type="button" variant="outline" className="rounded-xl" onClick={() => setShowForm(false)}>Cancel</Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      {(members || []).length === 0 && !showForm && (
        <EmptyState icon={Users} title="No family history yet" description="Add your family members' health history to enhance your AI disease risk predictions." />
      )}

      <Card className="glass-card border-border/50">
        <CardHeader><CardTitle className="text-base font-heading flex items-center gap-2"><Info className="w-4 h-4 text-primary" /> Hereditary Risk Impact</CardTitle></CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            Your family tree records <b>{hereditaryDiseases.length}</b> hereditary condition{hereditaryDiseases.length !== 1 ? "s" : ""}.
            These are factored into your AI risk predictions as a hereditary multiplier.
          </p>
          {hereditaryDiseases.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-3">
              {hereditaryDiseases.map((d) => (
                <Badge key={d} variant="secondary" className="capitalize">{d}</Badge>
              ))}
            </div>
          )}
          {profile && (
            <p className="text-xs text-muted-foreground mt-3">
              Current top risk: {Object.entries(baseRisks).sort((a, b) => b[1] - a[1])[0][0].replace(/_/g, " ")} — hereditary history adds an estimated +{hereditaryBoost}% baseline consideration across related diseases.
            </p>
          )}
        </CardContent>
      </Card>

      <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4">
        <AnimatePresence>
          {(members || []).map((m, i) => {
            const rel = RELATIONS.find((r) => r.key === m.relation) || RELATIONS[7];
            return (
              <motion.div key={m.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, scale: 0.9 }} transition={{ delay: i * 0.05 }}
                className="glass-card rounded-2xl p-5">
                <div className="flex items-start justify-between">
                  <div className="text-4xl">{rel.emoji}</div>
                  <Button size="icon" variant="ghost" onClick={() => deleteMember.mutate(m.id)}><Trash2 className="w-3.5 h-3.5 text-red-500" /></Button>
                </div>
                <h3 className="font-bold mt-2">{m.name || rel.label}</h3>
                <p className="text-xs text-muted-foreground capitalize">{rel.label}{m.age ? ` · ${m.age} yrs` : ""}{m.deceased ? " · In memory" : ""}</p>
                {(m.diseases || []).length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {m.diseases.map((d) => (
                      <Badge key={d} variant="secondary" className="text-[10px] capitalize"><Heart className="w-2.5 h-2.5 mr-0.5 text-red-500" />{d}</Badge>
                    ))}
                  </div>
                )}
                {m.lifestyle && <p className="text-[11px] text-muted-foreground mt-2">Lifestyle: {m.lifestyle}</p>}
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}