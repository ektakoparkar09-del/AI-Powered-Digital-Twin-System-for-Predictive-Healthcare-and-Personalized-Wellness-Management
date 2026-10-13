import {
  Heart,
  Droplets,
  Zap,
  Activity,
  Wind,
  Brain,
  BrainCircuit,
  Scale,
  Droplet,
  AlertCircle,
  Bone,
  Moon,
  Pill,
  ShieldAlert,
} from "lucide-react";

export function calculateBMI(weightKg, heightCm) {
  if (!weightKg || !heightCm) return 0;
  const heightM = heightCm / 100;
  return Math.round((weightKg / (heightM * heightM)) * 10) / 10;
}

export function getBMICategory(bmi) {
  if (bmi < 18.5) return { label: "Underweight", color: "text-yellow-500" };
  if (bmi < 25) return { label: "Normal", color: "text-green-500" };
  if (bmi < 30) return { label: "Overweight", color: "text-orange-500" };
  return { label: "Obese", color: "text-red-500" };
}

export function calculateHealthScore(profile) {
  if (!profile) return 0;
  let score = 100;

  const bmi = profile.bmi || calculateBMI(profile.weight_kg, profile.height_cm);
  if (bmi < 18.5 || bmi > 30) score -= 15;
  else if (bmi < 20 || bmi > 27) score -= 8;
  else if (bmi < 22 || bmi > 25) score -= 3;

  const sys = profile.blood_pressure_systolic || 120;
  if (sys > 140) score -= 15;
  else if (sys > 130) score -= 10;
  else if (sys > 120) score -= 5;

  const sugar = profile.blood_sugar || 90;
  if (sugar > 126) score -= 15;
  else if (sugar > 100) score -= 8;

  const chol = profile.cholesterol || 180;
  if (chol > 240) score -= 10;
  else if (chol > 200) score -= 5;

  const ex = profile.exercise_frequency || "moderate";
  if (ex === "none") score -= 10;
  else if (ex === "light") score -= 5;

  const sleep = profile.sleep_hours || 7;
  if (sleep < 5 || sleep > 10) score -= 10;
  else if (sleep < 6 || sleep > 9) score -= 5;

  const smoke = profile.smoking || "never";
  if (smoke === "regular") score -= 10;
  else if (smoke === "occasional") score -= 5;
  else if (smoke === "former") score -= 2;

  const stress = profile.stress_level || "moderate";
  if (stress === "very_high") score -= 10;
  else if (stress === "high") score -= 6;
  else if (stress === "moderate") score -= 2;

  const diet = profile.diet_type || "balanced";
  if (diet === "fast_food") score -= 5;

  return Math.max(0, Math.min(100, Math.round(score)));
}

export function getScoreColor(score) {
  if (score >= 80)
  return {
    bg: "bg-green-500",
    text: "text-green-500",
    label: "Excellent",
  };

if (score >= 60)
  return {
    bg: "bg-emerald-500",
    text: "text-emerald-500",
    label: "Very Good",
  };

if (score >= 40)
  return {
    bg: "bg-yellow-500",
    text: "text-yellow-500",
    label: "Average",
  };

if (score >= 20)
  return {
    bg: "bg-orange-500",
    text: "text-orange-500",
    label: "Needs Improvement",
  };

return {
  bg: "bg-red-500",
  text: "text-red-500",
  label: "High Risk",
};
}

// Registry of all chronic diseases the platform tracks.
export const CHRONIC_DISEASES = [

  // Cardiovascular
  {
    key: "heart",
    label: "Heart Disease",
    icon: Heart,
    category: "Cardiovascular",
  },
  {
    key: "stroke",
    label: "Stroke",
    icon: Zap,
    category: "Cardiovascular",
  },
  {
    key: "hypertension",
    label: "Hypertension",
    icon: Activity,
    category: "Cardiovascular",
  },
  {
    key: "arrhythmia",
    label: "Cardiac Arrhythmia",
    icon: Heart,
    category: "Cardiovascular",
  },
  {
    key: "heart_failure",
    label: "Heart Failure",
    icon: Heart,
    category: "Cardiovascular",
  },

  // Metabolic
  {
    key: "diabetes",
    label: "Type 2 Diabetes",
    icon: Droplets,
    category: "Metabolic",
  },
  {
    key: "obesity",
    label: "Obesity / Metabolic Syndrome",
    icon: Scale,
    category: "Metabolic",
  },
  {
    key: "fatty_liver",
    label: "Fatty Liver Disease",
    icon: Droplet,
    category: "Hepatic",
  },
  {
    key: "thyroid",
    label: "Thyroid Disease",
    icon: Activity,
    category: "Endocrine",
  },
  {
    key: "gout",
    label: "Gout",
    icon: Bone,
    category: "Metabolic",
  },

  // Kidney & Liver
  {
    key: "kidney",
    label: "Chronic Kidney Disease",
    icon: Droplet,
    category: "Renal",
  },
  {
    key: "liver_cirrhosis",
    label: "Liver Cirrhosis",
    icon: Droplet,
    category: "Hepatic",
  },

  // Respiratory
  {
    key: "copd",
    label: "COPD",
    icon: Wind,
    category: "Respiratory",
  },
  {
    key: "asthma",
    label: "Asthma",
    icon: Wind,
    category: "Respiratory",
  },
  {
    key: "sleep_apnea",
    label: "Sleep Apnea",
    icon: Wind,
    category: "Respiratory",
  },

  // Neurology
  {
    key: "alzheimer",
    label: "Alzheimer's Disease",
    icon: Brain,
    category: "Neurological",
  },
  {
    key: "parkinson",
    label: "Parkinson's Disease",
    icon: Brain,
    category: "Neurological",
  },
  {
    key: "migraine",
    label: "Migraine",
    icon: Brain,
    category: "Neurological",
  },
  {
    key: "epilepsy",
    label: "Epilepsy",
    icon: Brain,
    category: "Neurological",
  },

  // Mental Health
  {
    key: "depression",
    label: "Depression",
    icon: BrainCircuit,
    category: "Mental Health",
  },
  {
    key: "anxiety",
    label: "Anxiety Disorder",
    icon: BrainCircuit,
    category: "Mental Health",
  },

  // Musculoskeletal
  {
    key: "arthritis",
    label: "Arthritis",
    icon: Bone,
    category: "Musculoskeletal",
  },
  {
    key: "osteoporosis",
    label: "Osteoporosis",
    icon: Bone,
    category: "Musculoskeletal",
  },

  // Blood Disorders
  {
    key: "anemia",
    label: "Anemia",
    icon: Droplets,
    category: "Blood",
  },

  // Cancer
  {
    key: "cancer",
    label: "Cancer",
    icon: AlertCircle,
    category: "Oncology",
  },

  // Digestive
  {
    key: "ibs",
    label: "Irritable Bowel Syndrome",
    icon: Activity,
    category: "Digestive",
  },
  {
    key: "ulcer",
    label: "Peptic Ulcer Disease",
    icon: Activity,
    category: "Digestive",
  },
  {
    key: "gerd",
    label: "GERD",
    icon: Activity,
    category: "Digestive",
  },

  // Eye
  {
    key: "glaucoma",
    label: "Glaucoma",
    icon: Activity,
    category: "Eye",
  },
  {
    key: "cataract",
    label: "Cataract",
    icon: Activity,
    category: "Eye",
  },

  // Immune
  {
    key: "lupus",
    label: "Lupus",
    icon: ShieldAlert,
    category: "Autoimmune",
  },
  {
    key: "psoriasis",
    label: "Psoriasis",
    icon: ShieldAlert,
    category: "Autoimmune",
  },

];

export const DISEASE_COLORS = [
"#ef4444",
"#f97316",
"#f59e0b",
"#84cc16",
"#22c55e",
"#14b8a6",
"#06b6d4",
"#3b82f6",
"#6366f1",
"#8b5cf6",
"#a855f7",
"#d946ef",
"#ec4899",
"#e11d48",
"#10b981",
"#0ea5e9",
"#fb7185",
"#f43f5e",
"#c084fc",
"#2dd4bf",
"#bef264",
"#facc15",
"#38bdf8",
"#818cf8",
"#34d399",
"#f87171",
"#4ade80",
"#f472b6",
"#fcd34d",
"#93c5fd",
];
const clamp = (v) => Math.max(0, Math.min(100, Math.round(v)));

export function calculateDiseaseRisks(profile) {
  if (!profile) {
  return Object.fromEntries(
    CHRONIC_DISEASES.map((d) => [d.key, 0])
  );
}

  const age = Number(profile.age) || 30;
  const bmi =
  Number(profile.bmi) ||
  calculateBMI(profile.weight_kg, profile.height_cm);
  const sys = Number(profile.blood_pressure_systolic) || 120;
  const dia = Number(profile.blood_pressure_diastolic) || 80;
  const sugar = Number(profile.blood_sugar) || 90;
  const chol = Number(profile.cholesterol) || 180;
  const hr = Number(profile.heart_rate) || 72;
  const smoke = profile.smoking || "never";
  const alcohol = profile.alcohol || "never";
  const ex = profile.exercise_frequency || "moderate";
  const sleep = Number(profile.sleep_hours) || 7;
  const stress = profile.stress_level || "moderate";
  const diet = profile.diet_type || "balanced";
  const gender = String(profile.gender || "other").toLowerCase();
  const family = Array.isArray(profile.family_history)
  ? profile.family_history
  : [];
  const existing = Array.isArray(profile.existing_diseases)
  ? profile.existing_diseases
  : [];

  const has = (arr, term) => arr.some((x) => String(x).toLowerCase().includes(term));
  const ageFactor = age > 60 ? 3 : age > 45 ? 2 : age > 35 ? 1 : 0;
 const smokeFactor = {
    never: 0,
    former: 1,
    occasional: 2,
    regular: 3,
}[smoke] ?? 0;
  const obese = bmi > 30, over = bmi > 25;
  const bpHigh = sys > 140 || dia > 90;
  const bpMod = sys > 130 || dia > 85;
  const sugarHigh = sugar > 126, sugarMod = sugar > 100;
  const cholHigh = chol > 240, cholMod = chol > 200;
  const exLow = ex === "none" || ex === "light";
  const exActive = ex === "active" || ex === "very_active";
  const stressHigh = stress === "high" || stress === "very_high";
  const sleepPoor = sleep < 6 || sleep > 9;

  const risks = {};

  // Heart Disease
  let heart = 5 + ageFactor * 6;
  if (obese) heart += 15; else if (over) heart += 8;
  if (bpHigh) heart += 15; else if (bpMod) heart += 8;
  if (cholHigh) heart += 15; else if (cholMod) heart += 8;
  if (sugarHigh) heart += 10; else if (sugarMod) heart += 5;
  heart += smokeFactor * 5;
  if (has(family, "heart")) heart += 12;
  if (exLow) heart += 8; else if (exActive) heart -= 5;
  if (stressHigh) heart += 6;
  if (hr > 100) heart += 5;
  risks.heart = clamp(heart);

  // Type 2 Diabetes
  let diabetes = 5 + ageFactor * 5;
  if (obese) diabetes += 20; else if (over) diabetes += 12;
  if (sugarHigh) diabetes += 30; else if (sugarMod) diabetes += 15;
  if (cholHigh) diabetes += 5;
  if (has(family, "diabetes")) diabetes += 12;
  if (exLow) diabetes += 8; else if (exActive) diabetes -= 5;
  if (diet === "fast_food") diabetes += 8;
  risks.diabetes = clamp(diabetes);

  // Stroke
  let stroke = 5 + ageFactor * 7;
  if (bpHigh) stroke += 20; else if (bpMod) stroke += 10;
  if (cholHigh) stroke += 10; else if (cholMod) stroke += 5;
  stroke += smokeFactor * 5;
  if (obese) stroke += 8;
  if (risks.heart > 50) stroke += 8;
  if (stressHigh) stroke += 5;
  if (has(family, "stroke")) stroke += 12;
  if (exActive) stroke -= 3;
  risks.stroke = clamp(stroke);

  // Hypertension
  let hypertension = 5 + ageFactor * 5;
  if (bpHigh) hypertension += 25; else if (bpMod) hypertension += 15;
  if (obese) hypertension += 15; else if (over) hypertension += 8;
  if (stressHigh) hypertension += 10;
  hypertension += smokeFactor * 3;
  if (alcohol === "heavy") hypertension += 8; else if (alcohol === "moderate") hypertension += 4;
  if (has(family, "hypertension")) hypertension += 10;
  if (exActive) hypertension -= 5;
  risks.hypertension = clamp(hypertension);

  // Chronic Kidney Disease
  let kidney = 3 + ageFactor * 5;
  if (bpHigh) kidney += 15; else if (bpMod) kidney += 8;
  if (sugarHigh) kidney += 20; else if (sugarMod) kidney += 10;
  if (risks.hypertension > 50) kidney += 8;
  if (has(family, "kidney")) kidney += 12;
  if (has(existing, "kidney")) kidney += 25;
  risks.kidney = clamp(kidney);

  // COPD / Lung Disease
  let copd = 3 + ageFactor * 4;
  copd += smokeFactor * 8;
  if (has(existing, "copd") || has(existing, "lung")) copd += 30;
  if (has(family, "copd") || has(family, "lung")) copd += 10;
  if (exLow) copd += 3;
  risks.copd = clamp(copd);

  // Cancer
  let cancer = 3 + ageFactor * 6;
  cancer += smokeFactor * 6;
  if (alcohol === "heavy") cancer += 8; else if (alcohol === "moderate") cancer += 4;
  if (obese) cancer += 8;
  if (diet === "fast_food") cancer += 6;
  if (has(family, "cancer")) cancer += 15;
  if (exActive) cancer -= 4;
  if (exLow) cancer += 4;
  risks.cancer = clamp(cancer);

  // Alzheimer's / Dementia
  let alzheimer = 3 + (age > 65 ? 18 : age > 55 ? 10 : age > 45 ? 5 : 0);
  if (stressHigh) alzheimer += 6;
  if (sleepPoor) alzheimer += 8;
  if (exLow) alzheimer += 5; else if (exActive) alzheimer -= 5;
  if (has(family, "alzheimer") || has(family, "dementia")) alzheimer += 15;
  if (sugarHigh) alzheimer += 6;
  risks.alzheimer = clamp(alzheimer);

  // Fatty Liver Disease
  let fatty_liver = 3;
  if (obese) fatty_liver += 20; else if (over) fatty_liver += 10;
  if (sugarHigh) fatty_liver += 10; else if (sugarMod) fatty_liver += 5;
  if (cholHigh) fatty_liver += 8;
  if (alcohol === "heavy") fatty_liver += 15; else if (alcohol === "moderate") fatty_liver += 7;
  if (diet === "fast_food") fatty_liver += 8;
  if (has(existing, "liver")) fatty_liver += 20;
  risks.fatty_liver = clamp(fatty_liver);

  // Osteoporosis
  let osteoporosis = 3 + (age > 60 ? 15 : age > 50 ? 8 : 0);
  if (gender === "female" && age > 50) osteoporosis += 10;
  if (bmi < 19) osteoporosis += 8;
  if (exLow) osteoporosis += 6; else if (exActive) osteoporosis -= 4;
  if (sleepPoor) osteoporosis += 3;
  if (has(family, "osteoporosis")) osteoporosis += 10;
  risks.osteoporosis = clamp(osteoporosis);

  // Arthritis
  let arthritis = 3 + (age > 60 ? 15 : age > 50 ? 8 : age > 40 ? 4 : 0);
  if (obese) arthritis += 12; else if (over) arthritis += 6;
  if (has(existing, "arthritis")) arthritis += 25;
  if (has(family, "arthritis")) arthritis += 10;
  if (exActive) arthritis -= 2;
  risks.arthritis = clamp(arthritis);

  // Asthma
  let asthma = 3;
  asthma += smokeFactor * 5;
  if (has(existing, "asthma")) asthma += 30;
  if (has(family, "asthma")) asthma += 12;
  if (stressHigh) asthma += 4;
  if (exLow) asthma += 3;
  risks.asthma = clamp(asthma);

  // Depression
  let depression = 3;
  if (stressHigh) depression += 18; else if (stress === "moderate") depression += 6;
  if (sleepPoor) depression += 12;
  if (exLow) depression += 8; else if (exActive) depression -= 6;
  if (has(family, "depression")) depression += 12;
  if (has(existing, "depression")) depression += 20;
  if (diet === "fast_food") depression += 3;
  risks.depression = clamp(depression);

  // Obesity / Metabolic Syndrome
  let obesity = 3;
  if (bmi > 35) obesity += 40; else if (obese) obesity += 30; else if (over) obesity += 15; else if (bmi < 18.5) obesity += 10;
  if (sugarHigh) obesity += 10; else if (sugarMod) obesity += 5;
  if (bpMod) obesity += 8;
  if (cholHigh) obesity += 8;
  if (diet === "fast_food") obesity += 10;
  if (exLow) obesity += 8; else if (exActive) obesity -= 8;
  if (sleepPoor) obesity += 5;
  risks.obesity = clamp(obesity);
// Thyroid Disease
let thyroid = 5;

if (gender === "female")
  thyroid += 8;

if (age > 40)
  thyroid += 6;

if (stressHigh)
  thyroid += 5;

if (has(family, "thyroid"))
  thyroid += 15;

risks.thyroid = clamp(thyroid);


// Anemia

let anemia = 5;

if (gender === "female")
  anemia += 10;

if (diet === "fast_food")
  anemia += 8;

if (has(existing, "anemia"))
  anemia += 20;

risks.anemia = clamp(anemia);


// Sleep Apnea

let sleep_apnea = 5;

if (obese)
  sleep_apnea += 20;

if (sleepPoor)
  sleep_apnea += 12;

if (smokeFactor)
  sleep_apnea += 8;

risks.sleep_apnea = clamp(sleep_apnea);


// Migraine

let migraine = 5;

if (stressHigh)
  migraine += 18;

if (sleepPoor)
  migraine += 10;

if (has(family,"migraine"))
  migraine += 12;

risks.migraine = clamp(migraine);


// Parkinson

let parkinson = 5;

if(age>60)
    parkinson+=18;

if(has(family,"parkinson"))
    parkinson+=15;

risks.parkinson=clamp(parkinson);


// Anxiety

let anxiety=5;

if(stressHigh)
    anxiety+=25;

if(sleepPoor)
    anxiety+=10;

if(exLow)
    anxiety+=6;

risks.anxiety=clamp(anxiety);


// GERD

let gerd=5;

if(obese)
    gerd+=15;

if(diet==="fast_food")
    gerd+=12;

risks.gerd=clamp(gerd);


// IBS

let ibs=5;

if(stressHigh)
    ibs+=18;

if(diet==="fast_food")
    ibs+=8;

risks.ibs=clamp(ibs);


// Ulcer

let ulcer=5;

if(stressHigh)
    ulcer+=10;

if(smokeFactor)
    ulcer+=8;

risks.ulcer=clamp(ulcer);


// Cataract

let cataract=5;

if(age>60)
    cataract+=25;

if(has(family,"cataract"))
    cataract+=12;

risks.cataract=clamp(cataract);


// Glaucoma

let glaucoma=5;

if(age>50)
    glaucoma+=18;

if(has(family,"glaucoma"))
    glaucoma+=15;

risks.glaucoma=clamp(glaucoma);


// Lupus

let lupus=3;

if(gender==="female")
    lupus+=12;

if(has(family,"lupus"))
    lupus+=18;

risks.lupus=clamp(lupus);


// Psoriasis

let psoriasis=3;

if(stressHigh)
    psoriasis+=10;

if(has(family,"psoriasis"))
    psoriasis+=15;

risks.psoriasis=clamp(psoriasis);


// Arrhythmia

let arrhythmia=5;

if(bpHigh)
    arrhythmia+=15;

if(hr>100)
    arrhythmia+=15;

risks.arrhythmia=clamp(arrhythmia);


// Heart Failure

let heart_failure=5;

if(risks.heart>60)
    heart_failure+=20;

if(bpHigh)
    heart_failure+=15;

risks.heart_failure=clamp(heart_failure);


// Liver Cirrhosis

let liver_cirrhosis=5;

if(alcohol==="heavy")
    liver_cirrhosis+=25;

if(has(existing,"liver"))
    liver_cirrhosis+=20;

risks.liver_cirrhosis=clamp(liver_cirrhosis);


// Gout

let gout=5;

if(obese)
    gout+=10;

if(diet==="fast_food")
    gout+=10;

risks.gout=clamp(gout);
  return risks;
}

// Returns an array of { key, label, icon, category, value } sorted by risk (desc).
export function getAllDiseaseRisks(profile) {
  const risks = calculateDiseaseRisks(profile);
  return CHRONIC_DISEASES.map((d) => ({ ...d, value: risks[d.key] || 0 })).sort(
    (a, b) => b.value - a.value
  );
}

// Reads stored normalized risks (from disease_risks object) with live fallback.
export function risksFromProfile(profile) {
  if (!profile) return calculateDiseaseRisks(null);
  if (profile.disease_risks && typeof profile.disease_risks === "object") {
    const base = {};
    CHRONIC_DISEASES.forEach((d) => (base[d.key] = profile.disease_risks[d.key] || 0));
    return base;
  }
  return calculateDiseaseRisks(profile);
}

export function determineForecast(snapshots) {
  if (!snapshots || snapshots.length < 2) return "stable";
  const sorted = [...snapshots].sort((a, b) => new Date(a.snapshot_date) - new Date(b.snapshot_date));
  const recent = sorted.slice(-3);
  if (recent.length < 2) return "stable";
  const scores = recent.map((s) => s.health_score);
  const trend = scores[scores.length - 1] - scores[0];
  if (trend > 5) return "improving";
  if (trend < -5) return "declining";
  return "stable";
}

export function getRiskLevel(risk) {
  if (risk < 20) {
    return {
      label: "Low",
      color: "text-green-500",
    };
  }

  if (risk < 40) {
    return {
      label: "Moderate",
      color: "text-yellow-500",
    };
  }

  if (risk < 60) {
    return {
      label: "Elevated",
      color: "text-orange-500",
    };
  }

  return {
    label: "High",
    color: "text-red-500",
  };
}
export function generateRecommendations(profile) {
  if (!profile) return [];

  const recommendations = [];
const addRecommendation = (text) => {
  if (!recommendations.includes(text)) {
    recommendations.push(text);
  }
};
  const bmi =
    profile.bmi ||
    calculateBMI(profile.weight_kg, profile.height_cm);

  if (bmi > 25)
    addRecommendation(
      "Maintain a calorie-controlled diet and exercise at least 30 minutes daily."
    );

if (bmi < 18.5)
  addRecommendation(
    "Increase healthy calorie intake and include protein-rich foods."
  );

if ((profile.blood_pressure_systolic || 120) > 130)
  addRecommendation(
    "Reduce salt intake and monitor your blood pressure regularly."
  );

if ((profile.blood_sugar || 90) > 100)
  addRecommendation(
    "Limit sugary foods and monitor blood glucose frequently."
  );

if ((profile.cholesterol || 180) > 200)
  addRecommendation(
    "Choose heart-healthy foods and reduce saturated fat intake."
  );

if (profile.exercise_frequency === "none")
  addRecommendation(
    "Aim for at least 150 minutes of moderate exercise every week."
  );

if ((profile.sleep_hours || 7) < 6)
  addRecommendation(
    "Try to sleep 7–8 hours each night for better recovery."
  );

if (
  profile.stress_level === "high" ||
  profile.stress_level === "very_high"
)
  addRecommendation(
    "Practice meditation, breathing exercises, or yoga to reduce stress."
  );

if (profile.smoking === "regular")
  addRecommendation(
    "Stopping smoking can significantly lower your long-term disease risk."
  );

if (recommendations.length === 0) {
  addRecommendation(
    "Excellent health profile. Continue maintaining your healthy lifestyle."
  );
}

return recommendations.slice(0, 8);

}