
import React, { useState, useEffect } from "react";


import {

calculateBMI,

calculateHealthScore,

calculateDiseaseRisks,

generateRecommendations

}

from "@/lib/healthUtils";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { User, Save, Plus, X, Activity } from "lucide-react";
import { motion } from "framer-motion";
import { format } from "date-fns";
import { toast } from "sonner";

const diseaseOptions = [
  "Heart Disease",
  "Type 2 Diabetes",
  "Stroke",
  "Hypertension",
  "Cardiac Arrhythmia",
  "Heart Failure",

  "Chronic Kidney Disease",
  "Fatty Liver Disease",
  "Liver Cirrhosis",

  "COPD",
  "Asthma",
  "Sleep Apnea",

  "Cancer",

  "Alzheimer's Disease",
  "Parkinson's Disease",
  "Migraine",
  "Epilepsy",

  "Depression",
  "Anxiety Disorder",

  "Obesity",
  "Thyroid Disease",
  "Gout",

  "Osteoporosis",
  "Arthritis",

  "Anemia",

  "GERD",
  "Peptic Ulcer Disease",
  "Irritable Bowel Syndrome",

  "Glaucoma",
  "Cataract",

  "Lupus",
  "Psoriasis"
];

export default function HealthProfile() {
  
 
  const [form, setForm] = useState({});
  const [medInput, setMedInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState(null);

  useEffect(() => {
  const saved = JSON.parse(localStorage.getItem("healthProfile"));

  if (saved) {
    setProfile(saved);
    setForm(saved);
  }
}, []);

  const bmi = calculateBMI(form.weight_kg, form.height_cm);
  const completionFields = [

"name",

"age",

"gender",

"height_cm",

"weight_kg",

"occupation",

"blood_group",

"blood_pressure_systolic",

"blood_pressure_diastolic",

"blood_sugar",

"cholesterol",

"heart_rate",

"body_temperature",

"respiratory_rate",

"sleep_hours",

"exercise_frequency",

"diet_type",

"water_intake_liters",

"smoking",

"alcohol",

"stress_level",

"daily_activity"

];
  const completedFields = completionFields.filter(field => {
    const value = form[field];
    return value !== undefined && value !== null && value !== "";
  }).length;
  const profileCompletion = Math.round((completedFields / completionFields.length) * 100);
  const previewScore = Object.keys(form).length ? calculateHealthScore({ ...form, bmi }) : null;

  

  
    
      




    
    
  const updateField = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const addToArray = (field, value, setter) => {
    if (!value?.trim()) return;
    setForm(prev => ({ ...prev, [field]: [...(prev[field] || []), value.trim()] }));
    setter("");
  };

  const removeFromArray = (field, index) => {
    setForm(prev => ({ ...prev, [field]: (prev[field] || []).filter((_, i) => i !== index) }));
  };

  const handleSave = () => {
     setLoading(true);
  const computedBMI = calculateBMI(
    form.weight_kg,
    form.height_cm
  );

  const enriched = {
    ...form,
    bmi: computedBMI,
  };

  const healthScore =
    calculateHealthScore(enriched);

  const risks =
    calculateDiseaseRisks(enriched);

  const recommendations =
    generateRecommendations(enriched);

  const totalRisk = Object.values(risks).reduce((a, b) => a + b, 0);
  const riskPenalty = Math.floor(totalRisk / 120);

const futureHealthScore = Math.max(
  0,
  Math.min(100, healthScore - riskPenalty)
);

const futureRiskLevel =
  futureHealthScore >= 80
    ? "Low"
    : futureHealthScore >= 60
    ? "Moderate"
    : "High";
  
  const forecast = {
  one_month: `${Math.max(
    healthScore - Math.floor(totalRisk / 400),
    0
  )}/100`,

  six_months: `${Math.max(
    healthScore - Math.floor(totalRisk / 180),
    0
  )}/100`,

  one_year: `${futureHealthScore}/100`,
};
const snapshots =
JSON.parse(localStorage.getItem("healthSnapshots")) || [];
  const fullData = {
    ...enriched,

  bmi: computedBMI,

  created_date: profile?.created_date || new Date().toISOString(),

  last_updated: new Date().toISOString(),

  health_score: healthScore,

  future_health_score: futureHealthScore,

  future_risk_level: futureRiskLevel,

  digital_twin_status: "Active",

  
 

forecast,

digital_twin: {
  status: "Active",
  created: profile?.created_date || new Date().toISOString(),
  last_sync: new Date().toISOString(),
  version: "2.0",
  engine: "ChronoTwin-X",
  accuracy: 98,
},
  heart_disease_risk: risks.heart,

  diabetes_risk: risks.diabetes,

  stroke_risk: risks.stroke,

  hypertension_risk: risks.hypertension,

  disease_risks: risks,
  prediction_date: new Date().toISOString(),

prediction_version: "ChronoTwin AI v2.0",

health_category:
  healthScore >= 85
    ? "Excellent"
    : healthScore >= 70
    ? "Good"
    : healthScore >= 50
    ? "Average"
    : "High Risk",

high_risk_count:
  Object.values(risks).filter(v => v >= 70).length,

moderate_risk_count:
  Object.values(risks).filter(v => v >= 40 && v < 70).length,

low_risk_count:
  Object.values(risks).filter(v => v < 40).length,

risk_summary:{
   high:
      Object.values(risks).filter(v=>v>=70).length,

   moderate:
      Object.values(risks).filter(v=>v>=40 && v<70).length,

   low:
      Object.values(risks).filter(v=>v<40).length
},

ai_confidence: Math.max(
  75,
  98 - Math.floor(totalRisk / 400)
),

twin_accuracy: 98,
  recommendations,
  dashboard_stats: {
  bmi: computedBMI,
  healthScore,
  futureHealthScore,
  riskLevel: futureRiskLevel,
  snapshotCount: snapshots.length + 1,

  profileCompletion,

  age: form.age,
  gender: form.gender,

  heartRate: form.heart_rate,
  bloodPressure:
    `${form.blood_pressure_systolic || "--"}/${form.blood_pressure_diastolic || "--"}`,

  bloodSugar: form.blood_sugar,

  cholesterol: form.cholesterol,

  sleep: form.sleep_hours,

  water: form.water_intake_liters,

  stress: form.stress_level,

  exercise: form.exercise_frequency,
},
};
localStorage.setItem(
  "healthProfile",
  JSON.stringify(fullData)
);
 

snapshots.unshift({

  ...fullData,

  snapshot_date: format(
      new Date(),
      "yyyy-MM-dd"
  ),

});

localStorage.setItem(
"healthSnapshots",
JSON.stringify(
snapshots.slice(0,20)
)
);

window.dispatchEvent(new StorageEvent("storage"));
setLoading(false);
window.dispatchEvent(
  new CustomEvent("healthProfileUpdated")
);
  toast.success("Health Profile Saved Successfully");

setProfile(fullData);
setForm(fullData);
};

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold font-heading">Health Profile</h1>
        <p className="text-sm text-muted-foreground mt-1">Build your Digital Twin by entering your health data</p>
      </motion.div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="glass-card border-border/50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">Profile Completion</span>
              <span className="text-primary font-semibold">{profileCompletion}%</span>
            </div>
            <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
              <motion.div
                className="h-full rounded-full bg-primary"
                initial={{ width: 0 }}
                animate={{ width: `${profileCompletion}%` }}
              />
            </div>
            <p className="mt-2 text-xs text-muted-foreground">Complete vital and lifestyle details for more accurate predictions.</p>
          </CardContent>
        </Card>
        <Card className="glass-card border-border/50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium">AI Summary</p>
            <p className="mt-2 text-sm text-muted-foreground">
              {previewScore === null
                ? "Enter your health details to generate your personalized health analysis."
                : `Your current estimated health score is ${previewScore}/100. Save the profile to generate disease risks, forecasts, and recommendations.`}
            </p>
          </CardContent>
        </Card>
      </div>

      <form
  onSubmit={(e) => {
    e.preventDefault();

    if (!form.age || !form.height_cm || !form.weight_kg) {
      toast.error("Please complete required fields.");
      return;
    }

    handleSave();
  }}
>
        {/* Personal Info */}
        
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <User className="w-4 h-4 text-primary" /> Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
  <Label>Name</Label>

  <Input
    value={form.name || ""}
    onChange={(e)=>updateField("name",e.target.value)}
    placeholder="John Doe"
  />
</div>
            <div>
              <Label className="text-xs">Age</Label>
              <Input type="number" value={form.age || ""} onChange={e => updateField("age", Number(e.target.value))} placeholder="25" />
            </div>
            <div>
              <Label className="text-xs">Gender</Label>
              <Select value={form.gender || ""} onValueChange={v => updateField("gender", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Height (cm)</Label>
              <Input type="number" value={form.height_cm || ""} onChange={e => updateField("height_cm", Number(e.target.value))} placeholder="170" />
            </div>
            <div>
              <Label className="text-xs">Weight (kg)</Label>
              <Input type="number" value={form.weight_kg || ""} onChange={e => updateField("weight_kg", Number(e.target.value))} placeholder="70" />
            </div>
            <div>
  <Label className="text-xs">Occupation</Label>
  <Input
    value={form.occupation || ""}
    onChange={(e)=>updateField("occupation",e.target.value)}
    placeholder="Software Engineer"
  />
</div>
            <div>
  <Label className="text-xs">Marital Status</Label>

  <Select
    value={form.marital_status || ""}
    onValueChange={(v)=>updateField("marital_status",v)}
  >

    <SelectTrigger>
      <SelectValue placeholder="Select"/>
    </SelectTrigger>

    <SelectContent>

      <SelectItem value="single">Single</SelectItem>

      <SelectItem value="married">Married</SelectItem>

      <SelectItem value="divorced">Divorced</SelectItem>

      <SelectItem value="widowed">Widowed</SelectItem>

    </SelectContent>

  </Select>

</div>
            <div>

<Label className="text-xs">

Blood Group

</Label>

<Select
value={form.blood_group||""}
onValueChange={(v)=>updateField("blood_group",v)}
>

<SelectTrigger>

<SelectValue placeholder="Blood Group"/>

</SelectTrigger>

<SelectContent>

<SelectItem value="A+">A+</SelectItem>

<SelectItem value="A-">A-</SelectItem>

<SelectItem value="B+">B+</SelectItem>

<SelectItem value="B-">B-</SelectItem>

<SelectItem value="AB+">AB+</SelectItem>

<SelectItem value="AB-">AB-</SelectItem>

<SelectItem value="O+">O+</SelectItem>

<SelectItem value="O-">O-</SelectItem>

</SelectContent>

</Select>

</div> 
            
            <div>
              <Label className="text-xs">BMI (Auto)</Label>
              <Input value={bmi || "--"} disabled className="bg-muted" />
            </div>
          </CardContent>
        </Card>

        {/* Vitals */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-heading flex items-center gap-2">
              <Activity className="w-4 h-4 text-red-500" /> Vital Signs
            </CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Systolic BP (mmHg)</Label>
              <Input type="number" value={form.blood_pressure_systolic || ""} onChange={e => updateField("blood_pressure_systolic", Number(e.target.value))} placeholder="120" />
            </div>
            <div>
              <Label className="text-xs">Diastolic BP (mmHg)</Label>
              <Input type="number" value={form.blood_pressure_diastolic || ""} onChange={e => updateField("blood_pressure_diastolic", Number(e.target.value))} placeholder="80" />
            </div>
            <div>
              <Label className="text-xs">Blood Sugar (mg/dL)</Label>
              <Input type="number" value={form.blood_sugar || ""} onChange={e => updateField("blood_sugar", Number(e.target.value))} placeholder="90" />
            </div>
            <div>
              <Label className="text-xs">Cholesterol (mg/dL)</Label>
              <Input type="number" value={form.cholesterol || ""} onChange={e => updateField("cholesterol", Number(e.target.value))} placeholder="180" />
            </div>
            <div>
              <Label className="text-xs">Heart Rate (bpm)</Label>
              <Input type="number" value={form.heart_rate || ""} onChange={e => updateField("heart_rate", Number(e.target.value))} placeholder="72" />
            </div>
            <div>
<Label className="text-xs">
Body Temperature (°C)
</Label>

<Input
type="number"
step="0.1"
value={form.body_temperature||""}
onChange={(e)=>updateField(
"body_temperature",
Number(e.target.value)
)}
placeholder="36.8"
/>
</div>
<div>

<Label className="text-xs">
Respiratory Rate
</Label>

<Input
type="number"
value={form.respiratory_rate||""}
onChange={(e)=>updateField(
"respiratory_rate",
Number(e.target.value)
)}
placeholder="16"
/>

</div>
          </CardContent>
        </Card>

        {/* Medical History */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-heading">Medical History</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs">Existing Diseases</Label>
              <Select onValueChange={v => addToArray("existing_diseases", v, () => {})}>
                <SelectTrigger><SelectValue placeholder="Add disease" /></SelectTrigger>
                <SelectContent>
                  {diseaseOptions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {(form.existing_diseases || []).map((d, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {d} <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromArray("existing_diseases", i)} />
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Family History</Label>
              <Select onValueChange={v => addToArray("family_history", v, () => {})}>
                <SelectTrigger><SelectValue placeholder="Select Disease" /></SelectTrigger>
                <SelectContent>
                  {diseaseOptions.map(d => <SelectItem key={d} value={d}>{d}</SelectItem>)}
                </SelectContent>
              </Select>
              <div className="flex flex-wrap gap-2 mt-2">
                {(form.family_history || []).map((d, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {d} <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromArray("family_history", i)} />
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Medications</Label>
              <div className="flex gap-2">
                <Input value={medInput} onChange={e => setMedInput(e.target.value)} placeholder="e.g., Metformin" className="flex-1" />
                <Button type="button" variant="outline" size="icon" onClick={() => addToArray("medications", medInput, setMedInput)}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(form.medications || []).map((d, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {d} <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromArray("medications", i)} />
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Previous Surgeries</Label>
              <div className="flex gap-2">
                <Input placeholder="Appendectomy" value={form.surgeryInput || ""} onChange={e => updateField("surgeryInput", e.target.value)} />
                <Button type="button" onClick={() => addToArray("surgeries", form.surgeryInput, () => updateField("surgeryInput", ""))}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(form.surgeries || []).map((s, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {s} <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromArray("surgeries", i)} />
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Hospitalizations</Label>
              <div className="flex gap-2">
                <Input placeholder="COVID Admission" value={form.hospitalInput || ""} onChange={e => updateField("hospitalInput", e.target.value)} />
                <Button type="button" onClick={() => addToArray("hospitalizations", form.hospitalInput, () => updateField("hospitalInput", ""))}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(form.hospitalizations || []).map((h, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {h} <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromArray("hospitalizations", i)} />
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Allergies</Label>
              <div className="flex gap-2">
                <Input placeholder="Penicillin" value={form.allergyInput || ""} onChange={e => updateField("allergyInput", e.target.value)} />
                <Button type="button" onClick={() => addToArray("allergies", form.allergyInput, () => updateField("allergyInput", ""))}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(form.allergies || []).map((a, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {a} <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromArray("allergies", i)} />
                  </Badge>
                ))}
              </div>
            </div>
            <div>
              <Label className="text-xs">Vaccinations</Label>
              <div className="flex gap-2">
                <Input placeholder="COVID Booster" value={form.vaccineInput || ""} onChange={e => updateField("vaccineInput", e.target.value)} />
                <Button type="button" onClick={() => addToArray("vaccinations", form.vaccineInput, () => updateField("vaccineInput", ""))}>
                  <Plus className="w-4 h-4" />
                </Button>
              </div>
              <div className="flex flex-wrap gap-2 mt-2">
                {(form.vaccinations || []).map((v, i) => (
                  <Badge key={i} variant="secondary" className="gap-1">
                    {v} <X className="w-3 h-3 cursor-pointer" onClick={() => removeFromArray("vaccinations", i)} />
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Lifestyle */}
        <Card className="glass-card border-border/50">
          <CardHeader className="pb-4">
            <CardTitle className="text-base font-heading">Lifestyle</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label className="text-xs">Sleep Hours</Label>
              <Input type="number" step="0.5" value={form.sleep_hours || ""} onChange={e => updateField("sleep_hours", Number(e.target.value))} placeholder="7" />
            </div>
            <div>
              <Label className="text-xs">Exercise Frequency</Label>
              <Select value={form.exercise_frequency || ""} onValueChange={v => updateField("exercise_frequency", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="light">Light (1-2x/week)</SelectItem>
                  <SelectItem value="moderate">Moderate (3-4x/week)</SelectItem>
                  <SelectItem value="active">Active (5-6x/week)</SelectItem>
                  <SelectItem value="very_active">Very Active (Daily)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Diet Type</Label>
              <Select value={form.diet_type || ""} onValueChange={v => updateField("diet_type", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="balanced">Balanced</SelectItem>
                  <SelectItem value="vegetarian">Vegetarian</SelectItem>
                  <SelectItem value="vegan">Vegan</SelectItem>
                  <SelectItem value="keto">Keto</SelectItem>
                  <SelectItem value="mediterranean">Mediterranean</SelectItem>
                  <SelectItem value="fast_food">Fast Food Heavy</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Water Intake (L/day)</Label>
              <Input type="number" step="0.5" value={form.water_intake_liters || ""} onChange={e => updateField("water_intake_liters", Number(e.target.value))} placeholder="2" />
            </div>
            <div>
              <Label className="text-xs">Smoking</Label>
              <Select value={form.smoking || ""} onValueChange={v => updateField("smoking", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="former">Former</SelectItem>
                  <SelectItem value="occasional">Occasional</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Alcohol</Label>
              <Select value={form.alcohol || ""} onValueChange={v => updateField("alcohol", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="occasional">Occasional</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="heavy">Heavy</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Stress Level</Label>
              <Select value={form.stress_level || ""} onValueChange={v => updateField("stress_level", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                  <SelectItem value="very_high">Very High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Daily Activity</Label>
              <Select value={form.daily_activity || ""} onValueChange={v => updateField("daily_activity", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="sedentary">Sedentary</SelectItem>
                  <SelectItem value="lightly_active">Lightly Active</SelectItem>
                  <SelectItem value="moderately_active">Moderately Active</SelectItem>
                  <SelectItem value="very_active">Very Active</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Sleep Quality</Label>
              <Select value={form.sleep_quality || ""} onValueChange={v => updateField("sleep_quality", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="poor">Poor</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="good">Good</SelectItem>
                  <SelectItem value="excellent">Excellent</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs">Screen Time (hrs)</Label>
              <Input type="number" value={form.screen_time || ""} onChange={e => updateField("screen_time", Number(e.target.value))} placeholder="4" />
            </div>
            <div>
              <Label className="text-xs">Working Hours</Label>
              <Input type="number" value={form.working_hours || ""} onChange={e => updateField("working_hours", Number(e.target.value))} placeholder="8" />
            </div>
            <div>
              <Label className="text-xs">Coffee Intake (cups/day)</Label>
              <Input type="number" value={form.coffee_intake || ""} onChange={e => updateField("coffee_intake", Number(e.target.value))} placeholder="2" />
            </div>
            <div>
              <Label className="text-xs">Fruit Intake (servings/day)</Label>
              <Input type="number" value={form.fruit_intake || ""} onChange={e => updateField("fruit_intake", Number(e.target.value))} placeholder="2" />
            </div>
            <div>
              <Label className="text-xs">Vegetable Intake (servings/day)</Label>
              <Input type="number" value={form.vegetable_intake || ""} onChange={e => updateField("vegetable_intake", Number(e.target.value))} placeholder="3" />
            </div>
            <div>
              <Label className="text-xs">Junk Food</Label>
              <Select value={form.junk_food || ""} onValueChange={v => updateField("junk_food", v)}>
                <SelectTrigger><SelectValue placeholder="Select" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="rare">Rare</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="daily">Daily</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
<Card className="glass-card border-border/50 mt-6">
  <CardHeader>
    <CardTitle>Live AI Analysis</CardTitle>
  </CardHeader>

  <CardContent className="grid md:grid-cols-2 gap-4">

<div className="flex justify-between">
<span>Health Score</span>
<strong>{previewScore ?? "--"}/100</strong>
</div>

<div className="flex justify-between">
<span>BMI</span>
<strong>{bmi || "--"}</strong>
</div>

<div className="flex justify-between">
<span>Completion</span>
<strong>{profileCompletion}%</strong>
</div>

<div className="flex justify-between">
<span>Heart Rate</span>
<strong>{form.heart_rate || "--"} bpm</strong>
</div>

<div className="flex justify-between">
<span>Blood Pressure</span>
<strong>
{form.blood_pressure_systolic || "--"}
/
{form.blood_pressure_diastolic || "--"}
</strong>
</div>

<div className="flex justify-between">
<span>Blood Sugar</span>
<strong>{form.blood_sugar || "--"}</strong>
</div>

</CardContent>
</Card>
        <Button
  type="submit"
  disabled={loading}
className="w-full gradient-primary text-white h-12 rounded-xl"
>
{
loading
?
"Analyzing..."
:
<>
<Save className="w-4 h-4 mr-2"/>
Save Health Profile
</>
}
</Button>
      </form>
    </div>
  );
}
