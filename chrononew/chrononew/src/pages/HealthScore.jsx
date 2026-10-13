import React from "react";
import {
  calculateHealthScore,
  getScoreColor,
  calculateBMI,
} from "@/lib/healthUtils";

import {
  Activity,
  Scale,
  Heart,
  Moon,
  Dumbbell,
  Droplets,
  Salad,
  Wind,
  Gauge,
  ArrowUp,
  ArrowDown,
  Minus,
} from "lucide-react";

import { motion } from "framer-motion";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import { Link } from "react-router-dom";

function ScoreFactor({ label, score, maxScore, icon: Icon, color }) {
  const pct = Math.min(100, Math.max(0, Math.round((score / maxScore) * 100)));

  return (
    <div className="flex items-center gap-3 p-3 rounded-xl bg-muted/50">
      <div
        className={`w-9 h-9 rounded-lg ${color} flex items-center justify-center flex-shrink-0`}
      >
        <Icon className="w-4 h-4 text-white" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex justify-between text-xs mb-1">
          <span className="font-medium">{label}</span>

          <span className="text-muted-foreground">
            {score}/{maxScore}
          </span>
        </div>

        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${color}`}
            initial={{ width: 0 }}
            animate={{ width: `${pct}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>
    </div>
  );
}

export default function HealthScore() {
  const [profile, setProfile] = React.useState(null);

  // Load Health Profile from localStorage
  React.useEffect(() => {
    const loadProfile = () => {
      try {
        const saved = localStorage.getItem("healthProfile");

        if (saved) {
          setProfile(JSON.parse(saved));
        } else {
          setProfile(null);
        }
      } catch (error) {
        console.error("Failed to load health profile:", error);
        setProfile(null);
      }
    };

    loadProfile();

    // Update Health Score whenever HealthProfile is saved
    window.addEventListener("healthProfileUpdated", loadProfile);

    return () => {
      window.removeEventListener("healthProfileUpdated", loadProfile);
    };
  }, []);

  // No profile
  if (!profile) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl md:text-3xl font-bold font-heading">
          Health Score
        </h1>

        <div className="glass-card rounded-2xl p-12 text-center">
          <Activity className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />

          <h2 className="text-lg font-bold mb-2">
            No Health Data Available
          </h2>

          <p className="text-sm text-muted-foreground mb-4">
            Complete your Health Profile to generate your personalized health
            score.
          </p>

          <Link
            to="/profile"
            className="inline-flex px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium"
          >
            Create Health Profile
          </Link>
        </div>
      </div>
    );
  }

  // BMI
  const bmi =
    Number(profile.bmi) ||
    calculateBMI(profile.weight_kg, profile.height_cm);

  // Main Health Score
  const score = Math.round(calculateHealthScore(profile));

  const scoreInfo = getScoreColor(score);

  // -----------------------------------------
  // INDIVIDUAL FACTOR SCORES
  // -----------------------------------------

  const bmiScore =
    bmi >= 18.5 && bmi <= 25
      ? 15
      : bmi >= 17 && bmi <= 27
      ? 10
      : bmi > 27 && bmi <= 30
      ? 5
      : 0;

  const systolic = Number(profile.blood_pressure_systolic) || 120;

  const bpScore =
    systolic <= 120
      ? 15
      : systolic <= 130
      ? 10
      : systolic <= 140
      ? 5
      : 0;

  const bloodSugar = Number(profile.blood_sugar) || 90;

  const sugarScore =
    bloodSugar <= 100
      ? 15
      : bloodSugar <= 126
      ? 7
      : 0;

  const cholesterol = Number(profile.cholesterol) || 180;

  const cholScore =
    cholesterol <= 200
      ? 10
      : cholesterol <= 240
      ? 5
      : 0;

  const exerciseScore =
    profile.exercise_frequency === "very_active"
      ? 10
      : profile.exercise_frequency === "active"
      ? 10
      : profile.exercise_frequency === "moderate"
      ? 10
      : profile.exercise_frequency === "light"
      ? 5
      : 0;

  const sleepHours = Number(profile.sleep_hours) || 7;

  const sleepScore =
    sleepHours >= 6 && sleepHours <= 9
      ? 10
      : sleepHours >= 5 && sleepHours <= 10
      ? 5
      : 0;

  const smokingScore =
    profile.smoking === "never"
      ? 10
      : profile.smoking === "former"
      ? 8
      : profile.smoking === "occasional"
      ? 5
      : 0;

  const stressScore =
    profile.stress_level === "low"
      ? 10
      : profile.stress_level === "moderate"
      ? 8
      : profile.stress_level === "high"
      ? 4
      : 0;

  const dietScore =
    profile.diet_type === "fast_food"
      ? 0
      : profile.diet_type
      ? 5
      : 0;

  // -----------------------------------------
  // SCORE CIRCLE
  // -----------------------------------------

  const circumference = 2 * Math.PI * 80;

  const offset =
    circumference - (score / 100) * circumference;

  // -----------------------------------------
  // HEALTH CATEGORY
  // -----------------------------------------

  const healthCategory =
    score >= 85
      ? "Excellent"
      : score >= 70
      ? "Good"
      : score >= 50
      ? "Average"
      : "Needs Attention";

  // -----------------------------------------
  // SCORE MESSAGE
  // -----------------------------------------

  const scoreMessage =
    score >= 85
      ? "Excellent! Keep maintaining your healthy lifestyle."
      : score >= 70
      ? "You're doing well. Focus on improving your lower-scoring areas."
      : score >= 50
      ? "There is room for improvement. Review the factors below."
      : "Your health profile needs attention. Consider discussing concerns with a healthcare professional.";

  // -----------------------------------------
  // SCORE TREND
  // -----------------------------------------

  const snapshots =
    JSON.parse(localStorage.getItem("healthSnapshots")) || [];

  let previousScore = null;

  if (snapshots.length > 1) {
    previousScore =
      Number(snapshots[1]?.health_score) || null;
  }

  const scoreDifference =
    previousScore !== null
      ? score - previousScore
      : 0;

  // -----------------------------------------
  // RENDER
  // -----------------------------------------

  return (
    <div className="space-y-6">

      {/* HEADER */}

      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
      >
        <h1 className="text-2xl md:text-3xl font-bold font-heading">
          Health Score
        </h1>

        <p className="text-sm text-muted-foreground mt-1">
          AI-generated wellness score based on your health profile
        </p>
      </motion.div>


      {/* TOP SUMMARY */}

      <div className="grid md:grid-cols-3 gap-4">

        {/* SCORE */}

        <Card className="glass-card border-border/50">
          <CardContent className="p-5">

            <p className="text-xs text-muted-foreground">
              Current Health Score
            </p>

            <div className="flex items-center gap-3 mt-2">

              <span className="text-4xl font-bold">
                {score}
              </span>

              <span className="text-sm text-muted-foreground">
                /100
              </span>

            </div>

          </CardContent>
        </Card>


        {/* CATEGORY */}

        <Card className="glass-card border-border/50">
          <CardContent className="p-5">

            <p className="text-xs text-muted-foreground">
              Health Category
            </p>

            <p
              className={`text-xl font-bold mt-2 ${scoreInfo.text}`}
            >
              {healthCategory}
            </p>

          </CardContent>
        </Card>


        {/* TREND */}

        <Card className="glass-card border-border/50">
          <CardContent className="p-5">

            <p className="text-xs text-muted-foreground">
              Score Trend
            </p>

            <div className="flex items-center gap-2 mt-2">

              {previousScore === null ? (
                <>
                  <Minus className="w-5 h-5" />
                  <span className="font-semibold">
                    Baseline
                  </span>
                </>
              ) : scoreDifference > 0 ? (
                <>
                  <ArrowUp className="w-5 h-5 text-green-500" />
                  <span className="font-semibold text-green-500">
                    +{scoreDifference}
                  </span>
                </>
              ) : scoreDifference < 0 ? (
                <>
                  <ArrowDown className="w-5 h-5 text-red-500" />
                  <span className="font-semibold text-red-500">
                    {scoreDifference}
                  </span>
                </>
              ) : (
                <>
                  <Minus className="w-5 h-5" />
                  <span className="font-semibold">
                    No Change
                  </span>
                </>
              )}

            </div>

          </CardContent>
        </Card>

      </div>


      {/* MAIN SECTION */}

      <div className="grid md:grid-cols-2 gap-6">

        {/* BIG SCORE */}

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-card rounded-2xl p-8 flex flex-col items-center justify-center"
        >

          <div className="relative w-48 h-48">

            <svg
              className="w-48 h-48 -rotate-90"
              viewBox="0 0 180 180"
            >

              <circle
                cx="90"
                cy="90"
                r="80"
                fill="none"
                stroke="hsl(var(--muted))"
                strokeWidth="12"
              />

              <motion.circle
                cx="90"
                cy="90"
                r="80"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={circumference}
                initial={{
                  strokeDashoffset: circumference,
                }}
                animate={{
                  strokeDashoffset: offset,
                }}
                transition={{
                  duration: 2,
                  ease: "easeOut",
                }}
                className={scoreInfo.text}
              />

            </svg>


            <div className="absolute inset-0 flex flex-col items-center justify-center">

              <motion.span
                className="text-5xl font-bold font-display"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.8 }}
              >
                {score}
              </motion.span>

              <span className="text-sm text-muted-foreground">
                out of 100
              </span>

            </div>

          </div>


          <div
            className={`mt-6 px-6 py-2 rounded-full text-sm font-semibold ${scoreInfo.bg} text-white`}
          >
            {healthCategory}
          </div>


          <p className="text-xs text-muted-foreground mt-3 text-center max-w-xs">
            {scoreMessage}
          </p>

        </motion.div>


        {/* FACTOR BREAKDOWN */}

        <Card className="glass-card border-border/50">

          <CardHeader>

            <CardTitle className="text-base font-heading">
              Score Breakdown
            </CardTitle>

          </CardHeader>


          <CardContent className="space-y-2">

            <ScoreFactor
              label="BMI"
              score={bmiScore}
              maxScore={15}
              icon={Scale}
              color="bg-blue-500"
            />

            <ScoreFactor
              label="Blood Pressure"
              score={bpScore}
              maxScore={15}
              icon={Heart}
              color="bg-red-500"
            />

            <ScoreFactor
              label="Blood Sugar"
              score={sugarScore}
              maxScore={15}
              icon={Droplets}
              color="bg-purple-500"
            />

            <ScoreFactor
              label="Cholesterol"
              score={cholScore}
              maxScore={10}
              icon={Gauge}
              color="bg-orange-500"
            />

            <ScoreFactor
              label="Exercise"
              score={exerciseScore}
              maxScore={10}
              icon={Dumbbell}
              color="bg-emerald-500"
            />

            <ScoreFactor
              label="Sleep"
              score={sleepScore}
              maxScore={10}
              icon={Moon}
              color="bg-indigo-500"
            />

            <ScoreFactor
              label="Smoking"
              score={smokingScore}
              maxScore={10}
              icon={Wind}
              color="bg-slate-500"
            />

            <ScoreFactor
              label="Stress"
              score={stressScore}
              maxScore={10}
              icon={Activity}
              color="bg-amber-500"
            />

            <ScoreFactor
              label="Diet"
              score={dietScore}
              maxScore={5}
              icon={Salad}
              color="bg-green-500"
            />

          </CardContent>

        </Card>

      </div>


      {/* PROFILE SNAPSHOT */}

      <Card className="glass-card border-border/50">

        <CardHeader>

          <CardTitle className="text-base font-heading">
            Health Snapshot
          </CardTitle>

        </CardHeader>


        <CardContent>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

            <div className="p-4 rounded-xl bg-muted/50">

              <p className="text-xs text-muted-foreground">
                BMI
              </p>

              <p className="text-xl font-bold mt-1">
                {bmi || "--"}
              </p>

            </div>


            <div className="p-4 rounded-xl bg-muted/50">

              <p className="text-xs text-muted-foreground">
                Heart Rate
              </p>

              <p className="text-xl font-bold mt-1">
                {profile.heart_rate || "--"}
                <span className="text-xs font-normal ml-1">
                  bpm
                </span>
              </p>

            </div>


            <div className="p-4 rounded-xl bg-muted/50">

              <p className="text-xs text-muted-foreground">
                Blood Pressure
              </p>

              <p className="text-xl font-bold mt-1">
                {profile.blood_pressure_systolic || "--"}/
                {profile.blood_pressure_diastolic || "--"}
              </p>

            </div>


            <div className="p-4 rounded-xl bg-muted/50">

              <p className="text-xs text-muted-foreground">
                Blood Sugar
              </p>

              <p className="text-xl font-bold mt-1">
                {profile.blood_sugar || "--"}
              </p>

            </div>

          </div>

        </CardContent>

      </Card>


      {/* LAST UPDATED */}

      <p className="text-xs text-muted-foreground text-center">

        Last analyzed:{" "}
        {profile.last_updated
          ? new Date(profile.last_updated).toLocaleString()
          : "Not available"}

      </p>

    </div>
  );
}