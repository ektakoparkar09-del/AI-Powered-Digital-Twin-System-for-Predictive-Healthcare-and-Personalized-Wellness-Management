import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";

import {
  Sparkles,
  ArrowRight,
  BrainCircuit,
  Heart,
  Droplets,
  Scale,
  Gauge,
  Moon,
  Dumbbell,
} from "lucide-react";

import {
  calculateBMI,
  calculateHealthScore,
  calculateDiseaseRisks,
  generateRecommendations,
  getRiskLevel,
} from "../lib/healthUtils";

import HealthScoreCard from "@/components/dashboard/HealthScoreCard";
import DiseaseRiskPanel from "@/components/dashboard/DiseaseRiskPanel";
import HealthTrendChart from "@/components/dashboard/HealthTrendChart";
import RecommendationsPanel from "@/components/dashboard/RecommendationsPanel";
import StatCard from "@/components/dashboard/StatCard";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import digitalTwin from "@/assets/digitalTwin.png";

export default function Dashboard() {
  const [profile, setProfile] = React.useState(null);
  const [snapshots, setSnapshots] = React.useState([]);

  React.useEffect(() => {

  const loadProfile = () => {

    try {

      const savedRaw =
        localStorage.getItem("healthProfile");

      const saved = savedRaw
        ? JSON.parse(savedRaw)
        : null;

      if (saved) {
        setProfile(saved);
      } else {
        setProfile(null);
      }

      const snapshotRaw =
        localStorage.getItem("healthSnapshots");

      const savedSnapshots = snapshotRaw
        ? JSON.parse(snapshotRaw)
        : [];

      setSnapshots(
        Array.isArray(savedSnapshots)
          ? savedSnapshots
          : []
      );

    } catch (error) {

      console.error(
        "Failed to load health data:",
        error
      );

      setProfile(null);
      setSnapshots([]);

    }

  };

  loadProfile();

  window.addEventListener(
    "storage",
    loadProfile
  );

  window.addEventListener(
    "healthProfileUpdated",
    loadProfile
  );

  return () => {

    window.removeEventListener(
      "storage",
      loadProfile
    );

    window.removeEventListener(
      "healthProfileUpdated",
      loadProfile
    );

  };

}, []);
React.useEffect(() => {
  if (!profile) return;

  const score = calculateHealthScore(profile);

  const today = new Date()
    .toISOString()
    .split("T")[0];

  const existingSnapshots = JSON.parse(
    localStorage.getItem("healthSnapshots") || "[]"
  );

  const alreadyExists = existingSnapshots.some(
    (snapshot) =>
      snapshot.snapshot_date === today
  );

  if (!alreadyExists) {
    const newSnapshot = {
      snapshot_date: today,
      health_score: score,
      bmi:
        profile.bmi ||
        calculateBMI(
          profile.weight_kg,
          profile.height_cm
        ),
      blood_pressure_systolic:
        profile.blood_pressure_systolic || 120,
      blood_sugar:
        profile.blood_sugar || 90,
      cholesterol:
        profile.cholesterol || 180,
    };

    const updatedSnapshots = [
      ...existingSnapshots,
      newSnapshot,
    ];

    localStorage.setItem(
      "healthSnapshots",
      JSON.stringify(updatedSnapshots)
    );

    setSnapshots(updatedSnapshots);
  }
}, [profile]);
  const healthScore = profile
    ? calculateHealthScore(profile)
    : 0;

  const risks = profile
    ? calculateDiseaseRisks(profile)
    : {};

  const bmi =
    profile?.bmi ||
    (profile?.weight_kg && profile?.height_cm
      ? calculateBMI(
          profile.weight_kg,
          profile.height_cm
        )
      : "--");

  const twinStatus = "Active";

const currentRisks = profile
  ? calculateDiseaseRisks(profile)
  : {};

const riskValues = Object.values(currentRisks);

const averageRisk =
  riskValues.length > 0
    ? Math.round(
        riskValues.reduce(
          (sum, value) => sum + Number(value || 0),
          0
        ) / riskValues.length
      )
    : 0;

const riskLevel = getRiskLevel(averageRisk);

const futureScore = Math.min(
  100,
  Math.max(
    0,
    Math.round(
      healthScore - averageRisk * 0.05
    )
  )
);

const futureRisk = riskLevel.label;

const sortedRisks = Object.entries(currentRisks)
  .sort((a, b) => b[1] - a[1]);

const topRisk = sortedRisks[0] || ["none", 0];
const secondRisk = sortedRisks[1] || ["none", 0];
const thirdRisk = sortedRisks[2] || ["none", 0];

const riskLabelMap = {
  heart: "Heart Disease",
  stroke: "Stroke",
  hypertension: "Hypertension",
  diabetes: "Type 2 Diabetes",
  kidney: "Chronic Kidney Disease",
  copd: "COPD",
  cancer: "Cancer",
  alzheimer: "Alzheimer's Disease",
  fatty_liver: "Fatty Liver Disease",
  osteoporosis: "Osteoporosis",
  arthritis: "Arthritis",
  asthma: "Asthma",
  depression: "Depression",
  obesity: "Obesity / Metabolic Syndrome",
  thyroid: "Thyroid Disease",
  anemia: "Anemia",
  sleep_apnea: "Sleep Apnea",
  migraine: "Migraine",
  parkinson: "Parkinson's Disease",
  anxiety: "Anxiety Disorder",
  gerd: "GERD",
  ibs: "Irritable Bowel Syndrome",
  ulcer: "Peptic Ulcer Disease",
  cataract: "Cataract",
  glaucoma: "Glaucoma",
  lupus: "Lupus",
  psoriasis: "Psoriasis",
  arrhythmia: "Cardiac Arrhythmia",
  heart_failure: "Heart Failure",
  liver_cirrhosis: "Liver Cirrhosis",
  gout: "Gout",
};

const topRiskName =
  riskLabelMap[topRisk[0]] || topRisk[0];

const secondRiskName =
  riskLabelMap[secondRisk[0]] || secondRisk[0];

const thirdRiskName =
  riskLabelMap[thirdRisk[0]] || thirdRisk[0];

const predictionStatus =
  healthScore >= 80
    ? "Your current health profile shows a favorable overall status."
    : healthScore >= 60
    ? "Your health profile appears relatively stable, with some areas requiring attention."
    : "Your health profile indicates multiple areas where lifestyle improvement may be beneficial.";

const forecast = {
  one_month: `${Math.min(
    100,
    Math.max(
      0,
      Math.round(
        healthScore - averageRisk * 0.02
      )
    )
  )}/100`,

  six_months: `${Math.min(
    100,
    Math.max(
      0,
      Math.round(
        healthScore - averageRisk * 0.04
      )
    )
  )}/100`,

  one_year: `${Math.min(
    100,
    Math.max(
      0,
      Math.round(
        healthScore - averageRisk * 0.06
      )
    )
  )}/100`,
};

const forecastDirection =
  futureScore > healthScore
    ? "Improving"
    : futureScore < healthScore
    ? "Needs Attention"
    : "Stable";
  return (
    <div
      className="relative min-h-screen bg-cover bg-center bg-fixed"
      style={{
        backgroundImage: `url(${digitalTwin})`,
      }}
    >
      {/* Background overlay */}
      <div className="absolute inset-0 bg-slate-950/75 backdrop-blur-sm"></div>

      {/* Main content wrapper */}
      <div className="relative z-10">

        {!profile ? (
          <>
            {/* ============================= */}
            {/* NO PROFILE / CREATE TWIN PAGE */}
            {/* ============================= */}

            <motion.section
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="relative overflow-hidden rounded-3xl min-h-screen shadow-2xl"
            >
              <motion.img
                src={digitalTwin}
                alt="AI Digital Twin"
                initial={{ scale: 1.05 }}
                animate={{ scale: 1 }}
                transition={{ duration: 2 }}
                className="absolute inset-0 w-full h-full object-cover object-center"
              />

              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-900/75 to-black/70" />

              <div className="absolute inset-0">
                <div className="absolute top-16 left-20 w-96 h-96 bg-cyan-500/25 blur-[180px]" />

                <div className="absolute bottom-20 right-24 w-96 h-96 bg-blue-600/25 blur-[180px]" />
              </div>

              <div className="relative z-10 flex flex-col justify-center items-center text-center h-full px-8 py-20">

                <motion.span
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 text-white mb-6"
                >
                  <Sparkles size={16} />

                  AI Powered Preventive Healthcare
                </motion.span>

                <motion.h1
                  initial={{
                    opacity: 0,
                    y: 30,
                  }}
                  animate={{
                    opacity: 1,
                    y: 0,
                  }}
                  transition={{
                    duration: 0.8,
                  }}
                  className="text-6xl md:text-7xl font-extrabold text-white mb-6 leading-tight"
                >
                  Build Your AI Digital Twin
                </motion.h1>

                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="max-w-3xl text-slate-300 text-lg md:text-xl leading-8"
                >
                  Create your AI-powered Digital Health Twin
                  to analyze your current health, predict future
                  disease risks, generate personalized health
                  scores, and receive intelligent wellness
                  recommendations in real time.
                </motion.p>

                <div className="flex gap-4 mt-8">

                  <Link
                    to="/profile"
                    className="px-8 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold shadow-xl hover:scale-105 duration-300"
                  >
                    Create Twin
                  </Link>

                  <Link
                    to="/login"
                    className="px-8 py-3 rounded-xl border border-white/30 bg-white/10 backdrop-blur-md text-white hover:bg-white/20 duration-300"
                  >
                    Login
                  </Link>

                </div>
              </div>
            </motion.section>

            {/* Create Digital Twin Card */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-card rounded-2xl p-10 text-center"
            >
              <div className="w-16 h-16 mx-auto rounded-2xl bg-blue-600 flex items-center justify-center mb-4">
                <BrainCircuit className="text-white" />
              </div>

              <h2 className="text-2xl font-bold">
                Create Your Digital Twin
              </h2>

              <p className="mt-3 text-muted-foreground">
                Complete your health profile to unlock
                AI-powered predictions.
              </p>

              <Link
                to="/profile"
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-blue-600 rounded-xl text-white"
              >
                Get Started

                <ArrowRight size={18} />
              </Link>
            </motion.div>
          </>
        ) : (

          /* ============================= */
          /* PROFILE EXISTS / DASHBOARD */
          /* ============================= */

          <div className="relative z-10 max-w-7xl mx-auto p-6 space-y-6">

            {/* Dashboard Header */}
            <div className="flex justify-between">

              <div>
                <h2 className="text-3xl font-bold text-white">
                  Welcome Back,{" "}
                  {profile.name || "User"} 👋
                </h2>

                <h3 className="text-lg text-cyan-300 font-semibold mt-2">
                  ChronoTwin-X AI Digital Twin Dashboard
                </h3>

                <p className="text-slate-300">
                  Your AI-powered Digital Twin is continuously
                  monitoring your health and generating
                  personalized predictive insights.
                </p>

                <div className="mt-3 inline-flex items-center rounded-full bg-green-100 px-4 py-1 text-sm font-medium text-green-700">
                  🟢 Digital Twin Active
                </div>
              </div>

              <div className="text-right text-white">
                <p className="text-sm">
                  Last Updated
                </p>

                <p>
                  {profile.last_updated
                    ? new Date(
                        profile.last_updated
                      ).toLocaleDateString()
                    : "Today"}
                </p>
              </div>

            </div>

            {/* ============================= */}
            {/* TOP HEALTH STATS */}
            {/* ============================= */}

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">

              <StatCard
                icon={Scale}
                label="BMI"
                value={bmi}
                unit="kg/m²"
              />

              <StatCard
                icon={Heart}
                label="Blood Pressure"
                value={`${
                  profile.blood_pressure_systolic ||
                  "--"
                }/${
                  profile.blood_pressure_diastolic ||
                  "--"
                }`}
              />

              <StatCard
                icon={Droplets}
                label="Blood Sugar"
                value={
                  profile.blood_sugar || "--"
                }
              />

              <StatCard
                icon={Gauge}
                label="Cholesterol"
                value={
                  profile.cholesterol || "--"
                }
              />

            </div>

            {/* ============================= */}
            {/* MAIN DASHBOARD GRID */}
            {/* ============================= */}

            <div className="grid lg:grid-cols-3 gap-6">

              {/* ============================= */}
              {/* LEFT COLUMN */}
              {/* ============================= */}

              <div className="space-y-6">

                <HealthScoreCard
                  score={healthScore}
                  bmi={bmi}
                  age={profile.age}
                  heartRate={profile.heart_rate}
                />

                <DiseaseRiskPanel
                  risks={risks}
                  profile={profile}
                />

                {/* Health Summary */}
                <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">

                  <CardHeader>
                    <CardTitle>
                      Health Summary
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-2">

                    <p>
                      Age : {profile.age}
                    </p>

                    <p>
                      Gender : {profile.gender}
                    </p>

                    <p>
                      BMI : {bmi}
                    </p>

                    <p>
                      Current Health Score :
                      <strong>
                        {" "}
                        {healthScore}
                      </strong>
                    </p>

                    <p>
                      Future Health Score :
                      <strong>
                        {" "}
                        {futureScore}
                      </strong>
                    </p>

                    <p>
  Average Disease Risk :
  <strong>
    {" "}
    {averageRisk}%
  </strong>
</p>

<p>
  Overall Risk Level :
  <strong className={`ml-1 ${riskLevel.color}`}>
    {futureRisk}
  </strong>
</p>

<p>
  Forecast Direction :
  <strong>
    {" "}
    {forecastDirection}
  </strong>
</p>

                    <p>
                      Digital Twin :
                      <strong>
                        {" "}
                        {twinStatus}
                      </strong>
                    </p>

                    <p>
                      Health Snapshot Count :
                      <strong>
                        {" "}
                        {snapshots.length}
                      </strong>
                    </p>

                  </CardContent>
                </Card>

                {/* Digital Twin Status */}
                <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">

                  <CardHeader>
                    <CardTitle>
                      Digital Twin Status
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-4">

                    <div className="flex justify-between">
                      <span>Status</span>

                      <span className="text-green-600 font-semibold">
                        🟢 {twinStatus}
                      </span>
                    </div>

                    <div className="flex justify-between">
  <span>Last Sync</span>

  <span>
    {profile.last_updated
      ? new Date(
          profile.last_updated
        ).toLocaleDateString()
      : "Today"}
  </span>
</div>

                    <div className="flex justify-between">
                      <span>
                        Prediction Engine
                      </span>

                      <span>Online</span>
                    </div>

                    <div className="flex justify-between">
                      <span>
                        Prediction Confidence
                      </span>

                      <span>
                        {profile.ai_confidence ??
                          "95"}
                        %
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Monitoring</span>

                      <span className="text-green-600">
                        Live
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>Twin Accuracy</span>

                      <span>
                        {profile.twin_accuracy ??
                          "98"}
                        %
                      </span>
                    </div>

                    <div className="flex justify-between">
                      <span>AI Model</span>

                      <span>
                        ChronoTwin-X v1.0
                      </span>
                    </div>

                  </CardContent>
                </Card>

                {/* Health Forecast */}
                <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">

                  <CardHeader>
                    <CardTitle>
                      Health Forecast
                    </CardTitle>
                  </CardHeader>

                  <CardContent className="space-y-6">

                    <div className="flex items-center gap-4">

                      <div className="w-4 h-4 rounded-full bg-blue-600"></div>

                      <div>
                        <p className="font-semibold">
                          Today
                        </p>

                        <p>
                          Health Score :{" "}
                          {healthScore}
                        </p>
                      </div>

                    </div>

                    <div className="ml-2 h-8 border-l-2 border-blue-400"></div>

                    <div className="flex items-center gap-4">

                      <div className="w-4 h-4 rounded-full bg-cyan-500"></div>

                      <div>
                        <p className="font-semibold">
                          1 Month
                        </p>

                        <p>
                          {forecast.one_month}
                        </p>
                      </div>

                    </div>

                    <div className="ml-2 h-8 border-l-2 border-blue-400"></div>

                    <div className="flex items-center gap-4">

                      <div className="w-4 h-4 rounded-full bg-sky-500"></div>

                      <div>
                        <p className="font-semibold">
                          6 Months
                        </p>

                        <p>
                          {forecast.six_months}
                        </p>
                      </div>

                    </div>

                    <div className="ml-2 h-8 border-l-2 border-blue-400"></div>

                    <div className="flex items-center gap-4">

                      <div className="w-4 h-4 rounded-full bg-indigo-600"></div>

                      <div>
                        <p className="font-semibold">
                          1 Year
                        </p>

                        <p>
                          {forecast.one_year}
                        </p>
                      </div>

                    </div>

                  </CardContent>
                </Card>

                {/* Health Trend */}
                <HealthTrendChart
                  snapshots={snapshots}
                />

                {/* AI Prediction */}
<Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">

  <CardHeader>
    <CardTitle className="flex items-center gap-2">
      <BrainCircuit className="text-blue-600" />
      AI Prediction
    </CardTitle>
  </CardHeader>

  <CardContent className="space-y-3">

    <div className="p-4 rounded-xl bg-blue-50 border border-blue-200">
      <p className="font-semibold text-blue-900">
        🧠 AI Health Outlook
      </p>

      <p className="text-blue-800 mt-1">
        {predictionStatus}
      </p>
    </div>

    <div className="p-4 rounded-xl bg-red-50 border border-red-200">
      <p className="font-semibold text-red-900">
        ⚠️ Highest Predicted Risk
      </p>

      <p className="text-red-800 mt-1">
        {topRiskName} — {topRisk[1]}%
      </p>
    </div>

    <div className="p-4 rounded-xl bg-orange-50 border border-orange-200">
      <p className="font-semibold text-orange-900">
        🔎 Secondary Risk
      </p>

      <p className="text-orange-800 mt-1">
        {secondRiskName} — {secondRisk[1]}%
      </p>
    </div>

    <div className="p-4 rounded-xl bg-yellow-50 border border-yellow-200">
      <p className="font-semibold text-yellow-900">
        📊 Third Risk Factor
      </p>

      <p className="text-yellow-800 mt-1">
        {thirdRiskName} — {thirdRisk[1]}%
      </p>
    </div>

    <div className="p-4 rounded-xl bg-green-50 border border-green-200">
      <p className="font-semibold text-green-900">
        ✅ Current Health Score
      </p>

      <p className="text-green-800 mt-1 text-lg font-bold">
        {healthScore}/100
      </p>
    </div>

    <div className="p-4 rounded-xl bg-purple-50 border border-purple-200">
      <p className="font-semibold text-purple-900">
        📈 Predicted Future Score
      </p>

      <p className="text-purple-800 mt-1 text-lg font-bold">
        {futureScore}/100
      </p>
    </div>

    <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
      <p className="font-semibold text-slate-900">
        🚨 Overall Risk Level
      </p>

      <p className="text-slate-800 mt-1 font-bold">
        {futureRisk}
      </p>
    </div>

  </CardContent>
</Card>

                {/* Sleep & Exercise */}
                <div className="grid md:grid-cols-2 gap-4">

                  <StatCard
                    icon={Moon}
                    label="Sleep"
                    value={
                      profile.sleep_hours ||
                      "--"
                    }
                  />

                  <StatCard
                    icon={Dumbbell}
                    label="Exercise"
                    value={
                      profile.exercise_frequency ||
                      "--"
                    }
                  />

                </div>

                {/* Recommendations */}
                <RecommendationsPanel
                  recommendations={generateRecommendations(
                    profile
                  )}
                />

                {/* Chronic Diseases */}
                <Card className="bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">

                  <CardHeader>
                    <CardTitle>
                      Detected Chronic Diseases
                    </CardTitle>
                  </CardHeader>

                  <CardContent>

                    {profile.existing_diseases?.length ? (

                      profile.existing_diseases.map(
                        (disease, index) => (
                          <div
                            key={index}
                            className="py-1"
                          >
                            • {disease}
                          </div>
                        )
                      )

                    ) : (

                      <p>
                        No diseases selected.
                      </p>

                    )}

                  </CardContent>
                </Card>

              </div>

              {/* ============================= */}
              {/* RIGHT COLUMN */}
              {/* ============================= */}

              <div className="lg:col-span-2 space-y-6">

  {/* AI DIGITAL TWIN INSIGHTS */}
  <Card className="bg-white/90 backdrop-blur-xl border-white/30 shadow-2xl overflow-hidden">

    <CardHeader className="bg-gradient-to-r from-blue-600 to-cyan-500 text-white">

      <CardTitle className="flex items-center gap-3 text-xl">

        <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
          <BrainCircuit size={22} />
        </div>

        <div>
          <p>AI Digital Twin Insights</p>

          <p className="text-xs font-normal text-blue-100 mt-1">
            ChronoTwin-X Predictive Health Engine
          </p>
        </div>

      </CardTitle>

    </CardHeader>

    <CardContent className="p-6 space-y-6">

      {/* AI OVERVIEW */}
      <div className="rounded-2xl bg-blue-50 border border-blue-200 p-5">

        <div className="flex items-start gap-4">

          <div className="w-12 h-12 rounded-xl bg-blue-600 flex items-center justify-center shrink-0">
            <BrainCircuit className="text-white" />
          </div>

          <div>

            <h3 className="font-bold text-lg text-blue-950">
              AI Health Assessment
            </h3>

            <p className="text-blue-800 mt-1 leading-6">
              {predictionStatus}
            </p>

          </div>

        </div>

      </div>

      {/* SCORE + RISK */}
      <div className="grid md:grid-cols-2 gap-4">

        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <div className="flex justify-between items-center">

            <div>
              <p className="text-sm text-slate-500">
                Current Health Score
              </p>

              <p className="text-4xl font-extrabold text-blue-600 mt-2">
                {healthScore}
                <span className="text-lg text-slate-400">
                  /100
                </span>
              </p>
            </div>

            <Gauge
              size={42}
              className="text-blue-600"
            />

          </div>

        </div>

        <div className="rounded-2xl border bg-white p-5 shadow-sm">

          <div className="flex justify-between items-center">

            <div>

              <p className="text-sm text-slate-500">
                Overall Risk
              </p>

              <p className={`text-2xl font-extrabold mt-2 ${riskLevel.color}`}>
                {futureRisk}
              </p>

              <p className="text-xs text-slate-500 mt-1">
                Average risk: {averageRisk}%
              </p>

            </div>

            <Heart
              size={42}
              className={riskLevel.color}
            />

          </div>

        </div>

      </div>

      {/* TOP RISKS */}
      <div>

        <h3 className="text-lg font-bold text-slate-900 mb-4">
          Top Predicted Risk Factors
        </h3>

        <div className="space-y-3">

          <div className="flex items-center justify-between p-4 rounded-xl bg-red-50 border border-red-200">

            <div>
              <p className="font-semibold text-red-900">
                01. {topRiskName}
              </p>

              <p className="text-xs text-red-700 mt-1">
                Highest calculated risk factor
              </p>
            </div>

            <span className="text-xl font-bold text-red-600">
              {topRisk[1]}%
            </span>

          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-orange-50 border border-orange-200">

            <div>
              <p className="font-semibold text-orange-900">
                02. {secondRiskName}
              </p>

              <p className="text-xs text-orange-700 mt-1">
                Secondary calculated risk factor
              </p>
            </div>

            <span className="text-xl font-bold text-orange-600">
              {secondRisk[1]}%
            </span>

          </div>

          <div className="flex items-center justify-between p-4 rounded-xl bg-yellow-50 border border-yellow-200">

            <div>
              <p className="font-semibold text-yellow-900">
                03. {thirdRiskName}
              </p>

              <p className="text-xs text-yellow-700 mt-1">
                Third calculated risk factor
              </p>
            </div>

            <span className="text-xl font-bold text-yellow-600">
              {thirdRisk[1]}%
            </span>

          </div>

        </div>

      </div>

      {/* FUTURE FORECAST */}
      <div>

        <div className="flex justify-between items-center mb-4">

          <h3 className="text-lg font-bold text-slate-900">
            Predictive Health Forecast
          </h3>

          <span className="px-3 py-1 rounded-full bg-blue-100 text-blue-700 text-xs font-semibold">
            {forecastDirection}
          </span>

        </div>

        <div className="grid md:grid-cols-3 gap-4">

          <div className="p-5 rounded-2xl bg-slate-50 border">

            <p className="text-sm text-slate-500">
              1 Month
            </p>

            <p className="text-2xl font-bold text-cyan-600 mt-2">
              {forecast.one_month}
            </p>

          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border">

            <p className="text-sm text-slate-500">
              6 Months
            </p>

            <p className="text-2xl font-bold text-blue-600 mt-2">
              {forecast.six_months}
            </p>

          </div>

          <div className="p-5 rounded-2xl bg-slate-50 border">

            <p className="text-sm text-slate-500">
              1 Year
            </p>

            <p className="text-2xl font-bold text-indigo-600 mt-2">
              {forecast.one_year}
            </p>

          </div>

        </div>

      </div>

      {/* AI CONFIDENCE */}
      <div className="rounded-2xl bg-slate-900 text-white p-5">

        <div className="flex justify-between items-center mb-3">

          <div>

            <p className="font-semibold">
              AI Prediction Engine
            </p>

            <p className="text-xs text-slate-400 mt-1">
              ChronoTwin-X v1.0
            </p>

          </div>

          <span className="text-green-400 font-bold">
            ● Online
          </span>

        </div>

        <div className="grid grid-cols-2 gap-4 mt-4">

          <div>
            <p className="text-xs text-slate-400">
              Prediction Confidence
            </p>

            <p className="text-xl font-bold mt-1">
              {profile.ai_confidence ?? 95}%
            </p>
          </div>

          <div>
            <p className="text-xs text-slate-400">
              Digital Twin Accuracy
            </p>

            <p className="text-xl font-bold mt-1">
              {profile.twin_accuracy ?? 98}%
            </p>
          </div>

        </div>

      </div>

      {/* IMPORTANT DISCLAIMER */}
      <div className="text-xs text-slate-500 bg-slate-50 border rounded-xl p-4">
        <strong>Research Prototype:</strong> Risk values and
        future scores are computational estimates generated
        from the entered health profile for preventive-health
        demonstration purposes. They are not medical diagnoses
        or a substitute for professional medical advice.
      </div>

    </CardContent>

  </Card>


  {/* KEY HEALTH METRICS */}
  <Card className="bg-white/90 backdrop-blur-xl border-white/30 shadow-xl">

    <CardHeader>

      <CardTitle>
        Key Health Metrics
      </CardTitle>

    </CardHeader>

    <CardContent>

      <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">

        <div className="p-4 rounded-xl bg-blue-50 border border-blue-100">

          <p className="text-xs text-slate-500">
            BMI
          </p>

          <p className="text-2xl font-bold text-blue-700 mt-1">
            {bmi}
          </p>

        </div>

        <div className="p-4 rounded-xl bg-red-50 border border-red-100">

          <p className="text-xs text-slate-500">
            Blood Pressure
          </p>

          <p className="text-2xl font-bold text-red-700 mt-1">
            {profile.blood_pressure_systolic || "--"}/
            {profile.blood_pressure_diastolic || "--"}
          </p>

        </div>

        <div className="p-4 rounded-xl bg-purple-50 border border-purple-100">

          <p className="text-xs text-slate-500">
            Blood Sugar
          </p>

          <p className="text-2xl font-bold text-purple-700 mt-1">
            {profile.blood_sugar || "--"}
          </p>

        </div>

        <div className="p-4 rounded-xl bg-green-50 border border-green-100">

          <p className="text-xs text-slate-500">
            Cholesterol
          </p>

          <p className="text-2xl font-bold text-green-700 mt-1">
            {profile.cholesterol || "--"}
          </p>

        </div>

      </div>

    </CardContent>

  </Card>

</div>

            </div>

          </div>

        )}

      </div>

    </div>
  );
}