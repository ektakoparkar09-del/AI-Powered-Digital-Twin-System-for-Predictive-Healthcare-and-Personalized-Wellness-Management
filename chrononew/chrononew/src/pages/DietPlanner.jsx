const db = globalThis.__B44_DB__ || { auth:{ isAuthenticated: async()=>false, me: async()=>null }, entities:new Proxy({}, { get:()=>({ filter:async()=>[], get:async()=>null, create:async()=>({}), update:async()=>({}), delete:async()=>({}) }) }), integrations:{ Core:{ UploadFile:async()=>({ file_url:'' }) } } };

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/lib/AuthContext";
import PageHeader from "@/components/shared/PageHeader";
import EmptyState from "@/components/shared/EmptyState";
import { Salad, Loader2, Sparkles, Save, ShoppingCart, Flame, Droplet, Beef } from "lucide-react";
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";

const PLAN_TYPES = [
  { key: "weight_loss", label: "Weight Loss" },
  { key: "weight_gain", label: "Weight Gain" },
  { key: "diabetes", label: "Diabetes" },
  { key: "heart_healthy", label: "Heart Healthy" },
  { key: "vegetarian", label: "Vegetarian" },
  { key: "vegan", label: "Vegan" },
  { key: "high_protein", label: "High Protein" },
  { key: "indian", label: "Indian Diet" },
];

const todayStr = () => new Date().toISOString().slice(0, 10);

export default function DietPlanner() {
  const { user } = useAuth();
  const qc = useQueryClient();
  const [type, setType] = useState("weight_loss");
  const [plan, setPlan] = useState(null);
  const [loading, setLoading] = useState(false);

  const { data: profiles } = useQuery({
    queryKey: ["health-profiles"],
    queryFn: () => db.entities.HealthProfile.filter({ created_by_id: user?.id }, "-created_date", 1),
    enabled: !!user?.id,
  });
  const profile = profiles?.[0];

  const { data: savedPlans } = useQuery({
    queryKey: ["meal-plans"],
    queryFn: () => db.entities.MealPlan.filter({ created_by_id: user?.id }, "-plan_date", 14),
    enabled: !!user?.id,
  });

  const savePlan = useMutation({
    mutationFn: (data) => db.entities.MealPlan.create(data),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["meal-plans"] }),
  });

  const generate = async () => {
    setLoading(true);
    try {
      const ctx = profile ? `Patient: age ${profile.age}, gender ${profile.gender}, BMI ${profile.bmi || "—"}, BP ${profile.blood_pressure_systolic}/${profile.blood_pressure_diastolic}, sugar ${profile.blood_sugar}, diet ${profile.diet_type}. ` : "";
      const res = await db.integrations.Core.InvokeLLM({
        prompt: `${ctx}Generate a one-day personalized meal plan for goal: ${type}. Include breakfast, lunch, dinner, snacks, total calories, protein grams, daily water goal (liters), and a shopping list of 8-12 items. Return JSON.`,
        response_json_schema: {
          type: "object",
          properties: {
            breakfast: { type: "string" }, lunch: { type: "string" }, dinner: { type: "string" }, snacks: { type: "string" },
            calories: { type: "number" }, protein: { type: "number" }, water_goal: { type: "number" },
            shopping_list: { type: "array", items: { type: "string" } },
          },
        },
      });
      setPlan({ ...res, plan_type: type, plan_date: todayStr() });
    } catch {
      setPlan(null);
    }
    setLoading(false);
  };

  const save = () => {
    if (!plan) return;
    savePlan.mutate({
      plan_type: plan.plan_type,
      plan_date: plan.plan_date,
      breakfast: plan.breakfast, lunch: plan.lunch, dinner: plan.dinner, snacks: plan.snacks,
      calories: plan.calories, protein: plan.protein, water_goal: plan.water_goal, shopping_list: plan.shopping_list,
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader title="AI Diet Planner" subtitle="Personalized meal plans tailored to your health goals" icon={Salad} />

      <Card className="glass-card border-border/50">
        <CardHeader><CardTitle className="text-base font-heading">Generate a Meal Plan</CardTitle></CardHeader>
        <CardContent className="flex flex-col sm:flex-row gap-3 items-end">
          <div className="flex-1 w-full">
            <label className="text-xs text-muted-foreground">Diet Goal</label>
            <Select value={type} onValueChange={setType}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>{PLAN_TYPES.map((p) => <SelectItem key={p.key} value={p.key}>{p.label}</SelectItem>)}</SelectContent>
            </Select>
          </div>
          <Button className="gradient-primary text-white rounded-xl" onClick={generate} disabled={loading}>
            {loading ? <Loader2 className="w-4 h-4 animate-spin mr-1" /> : <Sparkles className="w-4 h-4 mr-1" />}
            {loading ? "Generating..." : "Generate Plan"}
          </Button>
        </CardContent>
      </Card>

      {plan && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="glass-card border-border/50">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-base font-heading">{PLAN_TYPES.find((p) => p.key === plan.plan_type)?.label} Plan</CardTitle>
              <Button size="sm" variant="outline" onClick={save} disabled={savePlan.isPending}>
                <Save className="w-3.5 h-3.5 mr-1" /> Save to Planner
              </Button>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid sm:grid-cols-2 gap-3">
                {[["Breakfast", plan.breakfast], ["Lunch", plan.lunch], ["Dinner", plan.dinner], ["Snacks", plan.snacks]].map(([meal, val]) => (
                  <div key={meal} className="p-4 rounded-xl bg-muted/40">
                    <h4 className="text-sm font-semibold mb-1">{meal}</h4>
                    <p className="text-xs text-muted-foreground">{val || "—"}</p>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-lg bg-orange-500/10 text-center">
                  <Flame className="w-4 h-4 text-orange-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{plan.calories || "—"}</p>
                  <p className="text-[10px] text-muted-foreground">kcal</p>
                </div>
                <div className="p-3 rounded-lg bg-red-500/10 text-center">
                  <Beef className="w-4 h-4 text-red-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{plan.protein || "—"}</p>
                  <p className="text-[10px] text-muted-foreground">protein (g)</p>
                </div>
                <div className="p-3 rounded-lg bg-blue-500/10 text-center">
                  <Droplet className="w-4 h-4 text-blue-500 mx-auto mb-1" />
                  <p className="text-lg font-bold">{plan.water_goal || "—"}</p>
                  <p className="text-[10px] text-muted-foreground">water (L)</p>
                </div>
              </div>
              {plan.shopping_list?.length > 0 && (
                <div>
                  <h4 className="text-sm font-semibold mb-2 flex items-center gap-1"><ShoppingCart className="w-4 h-4 text-primary" /> Shopping List</h4>
                  <div className="flex flex-wrap gap-2">
                    {plan.shopping_list.map((item, i) => (
                      <Badge key={i} variant="secondary" className="text-xs">{item}</Badge>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
      )}

      <Card className="glass-card border-border/50">
        <CardHeader><CardTitle className="text-base font-heading">Weekly Meal Planner</CardTitle></CardHeader>
        <CardContent>
          {(savedPlans || []).length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-6">No saved plans yet. Generate and save meal plans to build your weekly schedule.</p>
          ) : (
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {[...(savedPlans || [])].reverse().map((p, i) => (
                <div key={p.id || i} className="p-3 rounded-xl bg-muted/40">
                  <div className="flex items-center justify-between mb-1">
                    <Badge variant="secondary" className="text-[10px]">{PLAN_TYPES.find((t) => t.key === p.plan_type)?.label}</Badge>
                    <span className="text-[10px] text-muted-foreground">{format(new Date(p.plan_date), "MMM d")}</span>
                  </div>
                  <p className="text-xs"><b>B:</b> {p.breakfast}</p>
                  <p className="text-xs"><b>L:</b> {p.lunch}</p>
                  <p className="text-xs"><b>D:</b> {p.dinner}</p>
                  <p className="text-[10px] text-muted-foreground mt-1">{p.calories} kcal · {p.protein}g protein</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}