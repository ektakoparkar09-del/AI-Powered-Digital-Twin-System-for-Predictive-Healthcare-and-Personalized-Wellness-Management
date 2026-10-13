// Wellness helpers: organ health, simulation, gamification, scores, timeline, notifications.
import {
  Heart, Wind, Droplet, Brain, Bone, Scale, Footprints, Droplets,
  Moon, Dumbbell, Smile, User, Flame, Trophy, Target, Sparkles,
  Activity, Pill
} from "lucide-react";
import { calculateHealthScore, calculateDiseaseRisks, getScoreColor, getRiskLevel } from "./healthUtils";

// ---------------------------------------------------------------------------
// Organ health — maps chronic-disease risks to organs for the Interactive Twin
// ---------------------------------------------------------------------------
export const ORGANS = [
  { key: "heart", label: "Heart", icon: Heart, diseaseKeys: ["heart"] },
  { key: "brain", label: "Brain", icon: Brain, diseaseKeys: ["alzheimer", "stroke"] },
  { key: "lungs", label: "Lungs", icon: Wind, diseaseKeys: ["copd", "asthma"] },
  { key: "liver", label: "Liver", icon: Droplet, diseaseKeys: ["fatty_liver"] },
  { key: "kidneys", label: "Kidneys", icon: Droplet, diseaseKeys: ["kidney"] },
  { key: "bones", label: "Bones & Joints", icon: Bone, diseaseKeys: ["osteoporosis", "arthritis"] },
  { key: "metabolic", label: "Metabolic", icon: Scale, diseaseKeys: ["diabetes", "obesity", "hypertension"] },
];

export function getOrganHealth(profile) {
  const risks = calculateDiseaseRisks(profile);
  return ORGANS.map((o) => {
    const mapped = o.diseaseKeys.map((k) => risks[k] || 0);
    const peak = mapped.length ? Math.max(...mapped) : 0;
    const score = Math.max(5, Math.min(100, Math.round(100 - peak)));
    const info = getScoreColor(score);
    return { ...o, risk: peak, score, status: info.label, color: info.bg, textColor: info.text };
  });
}

// ---------------------------------------------------------------------------
// Sleep score
// ---------------------------------------------------------------------------
export function sleepScore(hours, quality) {
  let s = 0;
  if (hours >= 7 && hours <= 9) s += 60;
  else if (hours >= 6 && hours < 10) s += 40;
  else if (hours >= 5) s += 20;
  const qMap = { excellent: 40, good: 30, fair: 18, poor: 8 };
  s += qMap[quality] || 20;
  return Math.max(0, Math.min(100, s));
}

// ---------------------------------------------------------------------------
// Water tracking
// ---------------------------------------------------------------------------
export function waterGoal(weightKg = 70) {
  // ~35 ml per kg
  return Math.round((weightKg * 35) / 250); // glasses of 250ml
}
export function hydrationPct(glasses, goal) {
  if (!goal) return 0;
  return Math.min(100, Math.round((glasses / goal) * 100));
}

// ---------------------------------------------------------------------------
// Mental wellness score
// ---------------------------------------------------------------------------
export function moodScore(log) {
  if (!log) return 0;
  const moodMap = { great: 100, good: 80, okay: 60, low: 40, bad: 20 };
  const base = moodMap[log.mood] ?? 60;
  // invert 1-5 stress/anxiety; 1-5 energy/happiness scale up
  const stress = 100 - ((log.stress || 3) - 1) * 25;
  const anxiety = 100 - ((log.anxiety || 3) - 1) * 25;
  const energy = ((log.energy || 3) - 1) * 25;
  const happiness = ((log.happiness || 3) - 1) * 25;
  return Math.round((base + stress + anxiety + energy + happiness) / 5);
}

// ---------------------------------------------------------------------------
// Gamification — achievements & points
// ---------------------------------------------------------------------------
export const ACHIEVEMENTS = [
  { key: "profile_complete", label: "Profile Complete", icon: User, points: 100, desc: "Created your health profile" },
  { key: "healthy_heart", label: "Healthy Heart", icon: Heart, points: 150, desc: "Heart risk below 25%" },
  { key: "hydration_hero", label: "Hydration Hero", icon: Droplets, points: 120, desc: "Hit water goal 7 days" },
  { key: "fitness_champion", label: "Fitness Champion", icon: Dumbbell, points: 200, desc: "Logged 10 workouts" },
  { key: "sleep_master", label: "Sleep Master", icon: Moon, points: 150, desc: "7+ hours sleep for 5 nights" },
  { key: "mood_tracker", label: "Mindful Tracker", icon: Smile, points: 100, desc: "Logged 7 mood entries" },
  { key: "first_steps", label: "First Steps", icon: Footprints, points: 50, desc: "Completed your first workout" },
  { key: "streak_week", label: "Week Warrior", icon: Flame, points: 250, desc: "7-day activity streak" },
];

export function computeAchievements({ profile, exerciseLogs = [], waterLogs = [], sleepLogs = [], moodLogs = [] }) {
  const risks = calculateDiseaseRisks(profile);
  const unlocked = {};
  if (profile && profile.age) unlocked.profile_complete = true;
  if ((risks.heart || 0) < 25) unlocked.healthy_heart = true;
  if (exerciseLogs.length >= 10) unlocked.fitness_champion = true;
  if (exerciseLogs.length >= 1) unlocked.first_steps = true;
  if (moodLogs.length >= 7) unlocked.mood_tracker = true;

  // water streak
  const waterByDate = new Set(waterLogs.map((w) => w.log_date));
  let wStreak = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    if (waterByDate.has(k)) wStreak++;
  }
  if (wStreak >= 7) unlocked.hydration_hero = true;

  // sleep streak
  let sStreak = 0;
  for (let i = 0; i < 5; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    const k = d.toISOString().slice(0, 10);
    const log = sleepLogs.find((s) => s.log_date === k);
    if (log && log.hours >= 7) sStreak++;
  }
  if (sStreak >= 5) unlocked.sleep_master = true;

  // activity streak (any exercise log in last 7 distinct days)
  const exDates = new Set(exerciseLogs.map((e) => e.log_date));
  let aStreak = 0;
  for (let i = 0; i < 7; i++) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    if (exDates.has(d.toISOString().slice(0, 10))) aStreak++;
  }
  if (aStreak >= 7) unlocked.streak_week = true;

  const list = ACHIEVEMENTS.map((a) => ({ ...a, unlocked: !!unlocked[a.key] }));
  const points = list.filter((a) => a.unlocked).reduce((sum, a) => sum + a.points, 0);
  const level = Math.floor(points / 250) + 1;
  const xpInLevel = points % 250;
  return { list, points, level, xpInLevel, xpForNext: 250 };
}

export const DAILY_CHALLENGES = [
  { key: "water", label: "Drink 8 glasses of water", icon: Droplets, target: 8 },
  { key: "sleep", label: "Sleep 7-8 hours", icon: Moon, target: 1 },
  { key: "mood", label: "Log your mood", icon: Smile, target: 1 },
  { key: "exercise", label: "Exercise 30 minutes", icon: Dumbbell, target: 30 },
];

export const WEEKLY_CHALLENGES = [
  { key: "workouts", label: "Complete 3 workouts", icon: Dumbbell, target: 3 },
  { key: "hydration", label: "Hit water goal 5 days", icon: Droplets, target: 5 },
  { key: "sleep_avg", label: "Average 7h+ sleep", icon: Moon, target: 7 },
];

// ---------------------------------------------------------------------------
// What-if simulator
// ---------------------------------------------------------------------------
export function simulateProfile(profile, overrides) {
  const base = { ...(profile || {}), ...overrides };
  if (overrides.weight_kg && profile?.height_cm) {
    base.bmi = Math.round((overrides.weight_kg / Math.pow(profile.height_cm / 100, 2)) * 10) / 10;
  }
  const score = calculateHealthScore(base);
  const risks = calculateDiseaseRisks(base);
  const avgRisk = Math.round(Object.values(risks).reduce((a, b) => a + b, 0) / Object.values(risks).length);
  return { profile: base, score, risks, avgRisk };
}

// ---------------------------------------------------------------------------
// Notifications
// ---------------------------------------------------------------------------
export function generateNotifications({ profile, medications = [], waterLogs = [], sleepLogs = [], exerciseLogs = [] }) {
  const items = [];
  const risks = calculateDiseaseRisks(profile);
  const score = calculateHealthScore(profile);
  const today = new Date().toISOString().slice(0, 10);

  if (profile && score < 60) {
    items.push({ id: "score_drop", type: "warning", icon: Activity, title: "Health Score Needs Attention", message: `Your health score is ${score}/100. Review recommendations to improve.`, date: today });
  }
  const highRisk = Object.entries(risks).filter(([, v]) => v >= 60).sort((a, b) => b[1] - a[1])[0];
  if (highRisk) {
    items.push({ id: "risk_" + highRisk[0], type: "critical", icon: Heart, title: "Elevated Disease Risk", message: `${highRisk[0].replace(/_/g, " ")} risk is ${highRisk[1]}%. Consider lifestyle changes.`, date: today });
  }

  medications.filter((m) => m.active).forEach((m) => {
    if (m.refill_date) {
      const days = Math.ceil((new Date(m.refill_date) - new Date()) / 86400000);
      if (days <= 7) {
        items.push({ id: "refill_" + m.id, type: "info", icon: Pill, title: "Refill Reminder", message: `${m.name} needs a refill in ${Math.max(0, days)} day(s).`, date: today });
      }
    }
  });

  const todayWater = waterLogs.find((w) => w.log_date === today);
  const goal = waterGoal(profile?.weight_kg);
  if (profile && (!todayWater || (todayWater.glasses || 0) < goal)) {
    items.push({ id: "water_missed", type: "info", icon: Droplets, title: "Water Goal Pending", message: `You still need ${goal - (todayWater?.glasses || 0)} glasses to hit today's hydration goal.`, date: today });
  }

  const todaySleep = sleepLogs.find((s) => s.log_date === today);
  if (profile && !todaySleep) {
    items.push({ id: "sleep_log", type: "info", icon: Moon, title: "Log Your Sleep", message: "Track last night's sleep to keep your trends accurate.", date: today });
  }

  const exDates = new Set(exerciseLogs.map((e) => e.log_date));
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  if (profile && !exDates.has(yesterday.toISOString().slice(0, 10)) && !exDates.has(today)) {
    items.push({ id: "exercise_missed", type: "warning", icon: Dumbbell, title: "Exercise Reminder", message: "You haven't logged a workout recently. A short walk counts!", date: today });
  }

  items.push({ id: "checkup", type: "info", icon: Target, title: "Health Checkup Reminder", message: "Schedule a routine checkup with your healthcare provider.", date: today });

  return items;
}

// ---------------------------------------------------------------------------
// Timeline builder
// ---------------------------------------------------------------------------
export function buildTimeline({ profile, snapshots = [], medications = [], exerciseLogs = [] }) {
  const events = [];
  snapshots.forEach((s) => {
    if (s.snapshot_date) {
      events.push({
        date: s.snapshot_date,
        type: "score",
        icon: Activity,
        title: `Health Snapshot — Score ${s.health_score}`,
        description: `BMI ${s.bmi || "—"} · BP ${s.blood_pressure_systolic || "—"}/${s.blood_pressure_diastolic || "—"}`,
      });
    }
  });
  medications.forEach((m) => {
    if (m.start_date) {
      events.push({
        date: m.start_date,
        type: "medication",
        icon: Pill,
        title: `Medication Added — ${m.name}`,
        description: `${m.dosage || ""} · ${m.frequency || ""}`.trim(),
      });
    }
  });
  exerciseLogs.forEach((e) => {
    if (e.log_date) {
      events.push({
        date: e.log_date,
        type: "exercise",
        icon: Dumbbell,
        title: `Workout — ${e.workout_type}`,
        description: `${e.duration_min || 0} min · ${e.calories_burned || 0} kcal`,
      });
    }
  });
  if (profile && profile.recommendations?.length) {
    events.push({
      date: profile.updated_date || new Date().toISOString().slice(0, 10),
      type: "recommendation",
      icon: Sparkles,
      title: "AI Recommendations Updated",
      description: `${profile.recommendations.length} personalized suggestions generated.`,
    });
  }
  return events.sort((a, b) => new Date(b.date) - new Date(a.date));
}