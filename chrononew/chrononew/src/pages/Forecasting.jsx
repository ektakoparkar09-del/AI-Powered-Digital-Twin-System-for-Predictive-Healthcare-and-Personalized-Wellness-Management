

import React from "react";

import {
  determineForecast,
  getScoreColor,
} from "@/lib/healthUtils";

import {
  TrendingUp,
  TrendingDown,
  Minus,
  Calendar,
  Target,
  Brain,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
} from "lucide-react";

import { motion } from "framer-motion";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Area,
  AreaChart,
  Legend,
} from "recharts";

import {
  format,
  addMonths,
} from "date-fns";

import { Link } from "react-router-dom";


export default function Forecasting() {

  const [profile, setProfile] = React.useState(null);
  const [snapshots, setSnapshots] = React.useState([]);

  React.useEffect(() => {

    const loadData = () => {

      const savedProfile =
        JSON.parse(
          localStorage.getItem("healthProfile")
        ) || null;

      const savedSnapshots =
        JSON.parse(
          localStorage.getItem("healthSnapshots")
        ) || [];

      setProfile(savedProfile);
      setSnapshots(savedSnapshots);
    };

    loadData();

    window.addEventListener(
      "healthProfileUpdated",
      loadData
    );

    return () => {
      window.removeEventListener(
        "healthProfileUpdated",
        loadData
      );
    };

  }, []);


  const sorted = [...(snapshots || [])].sort(
  (a, b) =>
    new Date(a.snapshot_date) -
    new Date(b.snapshot_date)
);

  const forecast =
    sorted.length >= 2
      ? determineForecast(sorted)
      : "stable";
  if (!profile) {
  return (
    <div className="space-y-6">

      <h1 className="text-2xl md:text-3xl font-bold font-heading">
        Future Health Forecasting
      </h1>

      <div className="glass-card rounded-2xl p-12 text-center">

        <Calendar className="w-16 h-16 text-primary mx-auto mb-4 opacity-50" />

        <h2 className="text-lg font-bold mb-2">
          Health Profile Required
        </h2>

        <p className="text-sm text-muted-foreground mb-4">
          Complete your health profile to generate your personalized health forecast.
        </p>

        <Link
          to="/profile"
          className="inline-flex px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium"
        >
          Complete Health Profile
        </Link>

      </div>

    </div>
  );
}
const currentScore =
  profile.health_score ??
  sorted[sorted.length - 1]?.health_score ??
  0;

const storedForecast =
  profile.forecast || {};

const oneMonthScore =
  parseInt(storedForecast.one_month) ||
  currentScore;

const sixMonthScore =
  parseInt(storedForecast.six_months) ||
  currentScore;

const oneYearScore =
  parseInt(storedForecast.one_year) ||
  profile.future_health_score ||
  currentScore;

  const projectionData = [
  {
    period: "Current",
    score: currentScore,
    type: "Current",
  },
  {
    period: "1 Month",
    score: oneMonthScore,
    type: "Projected",
  },
  {
    period: "6 Months",
    score: sixMonthScore,
    type: "Projected",
  },
  {
    period: "1 Year",
    score: oneYearScore,
    type: "Projected",
  },
];
  const trendData = sorted.map(s => ({
    date: format(new Date(s.snapshot_date), "MMM d"),
    score: s.health_score,
    bmi: s.bmi,
    bp: s.blood_pressure_systolic,
    sugar: s.blood_sugar,
  }));
const historicalData = trendData.slice(-6);

const futureData = [
  {
    date: "Current",
    score: currentScore,
    projected: false,
  },
  {
    date: "1M",
    score: oneMonthScore,
    projected: true,
  },
  {
    date: "6M",
    score: sixMonthScore,
    projected: true,
  },
  {
    date: "1Y",
    score: oneYearScore,
    projected: true,
  },
];

const combinedData = [
  ...historicalData.map((item) => ({
    ...item,
    projected: false,
  })),
  ...futureData,
];



  const forecastConfig = {
    improving: { icon: TrendingUp, color: "text-green-500", bg: "bg-green-500", label: "Health Improving", desc: "Your health metrics show a positive trend. Keep up the great work!" },
    stable: { icon: Minus, color: "text-yellow-500", bg: "bg-yellow-500", label: "Health Stable", desc: "Your health metrics are stable. Consider optimizing your lifestyle for improvement." },
    declining: { icon: TrendingDown, color: "text-red-500", bg: "bg-red-500", label: "Health Declining", desc: "Your health metrics show a declining trend. Consider consulting a healthcare provider." },
  }[forecast];

  const FIcon = forecastConfig.icon;

  return (
    <div className="space-y-6">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl md:text-3xl font-bold font-heading">Future Health Forecasting</h1>
        <p className="text-sm text-muted-foreground mt-1">AI-powered predictions based on your health trajectory</p>
      </motion.div>

      {/* Forecast Banner */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card rounded-2xl p-6 flex items-center gap-4">
        <div className={`w-14 h-14 rounded-2xl ${forecastConfig.bg}/10 flex items-center justify-center flex-shrink-0`}>
          <FIcon className={`w-7 h-7 ${forecastConfig.color}`} />
        </div>
        <div>
          <h3 className={`text-lg font-bold font-heading ${forecastConfig.color}`}>{forecastConfig.label}</h3>
          <p className="text-sm text-muted-foreground">{forecastConfig.desc}</p>
        </div>
      </motion.div>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">

  <Card className="glass-card border-border/50">
    <CardContent className="p-5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-xs text-muted-foreground">
            1 Month Forecast
          </p>

          <p className="text-3xl font-bold mt-2">
            {oneMonthScore}
            <span className="text-sm text-muted-foreground">
              /100
            </span>
          </p>
        </div>

        <Target className="w-8 h-8 text-primary" />

      </div>

    </CardContent>
  </Card>


  <Card className="glass-card border-border/50">
    <CardContent className="p-5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-xs text-muted-foreground">
            6 Month Forecast
          </p>

          <p className="text-3xl font-bold mt-2">
            {sixMonthScore}
            <span className="text-sm text-muted-foreground">
              /100
            </span>
          </p>
        </div>

        <Activity className="w-8 h-8 text-primary" />

      </div>

    </CardContent>
  </Card>


  <Card className="glass-card border-border/50">
    <CardContent className="p-5">

      <div className="flex items-center justify-between">

        <div>
          <p className="text-xs text-muted-foreground">
            1 Year Forecast
          </p>

          <p className="text-3xl font-bold mt-2">
            {oneYearScore}
            <span className="text-sm text-muted-foreground">
              /100
            </span>
          </p>
        </div>

        <Brain className="w-8 h-8 text-primary" />

      </div>

    </CardContent>
  </Card>

</div>
      {/* Projection Chart */}
      <Card className="glass-card border-border/50">

  <CardHeader>

    <CardTitle className="text-base font-heading">
      Health Score Projection
    </CardTitle>

  </CardHeader>

  <CardContent>

    <div className="h-72">

      <ResponsiveContainer
        width="100%"
        height="100%"
      >

        <AreaChart data={combinedData}>

          <defs>

            <linearGradient
              id="forecastGradient"
              x1="0"
              y1="0"
              x2="0"
              y2="1"
            >

              <stop
                offset="5%"
                stopColor="hsl(207, 90%, 54%)"
                stopOpacity={0.3}
              />

              <stop
                offset="95%"
                stopColor="hsl(207, 90%, 54%)"
                stopOpacity={0}
              />

            </linearGradient>

          </defs>

          <CartesianGrid
            strokeDasharray="3 3"
            stroke="hsl(var(--border))"
          />

          <XAxis
            dataKey="date"
            tick={{ fontSize: 11 }}
          />

          <YAxis
            domain={[0, 100]}
            tick={{ fontSize: 11 }}
          />

          <Tooltip
            contentStyle={{
              background: "hsl(var(--card))",
              border: "1px solid hsl(var(--border))",
              borderRadius: "12px",
              fontSize: "12px",
            }}
          />

          <Area
            type="monotone"
            dataKey="score"
            stroke="hsl(207, 90%, 54%)"
            fill="url(#forecastGradient)"
            strokeWidth={2}
          />

        </AreaChart>

      </ResponsiveContainer>

    </div>

    <p className="text-[10px] text-muted-foreground text-center mt-2">
      Future values are estimated projections based on your current health trajectory.
    </p>

  </CardContent>

</Card>
<Card className="glass-card border-border/50">

  <CardHeader>

    <CardTitle className="text-base font-heading">
      AI Forecast Interpretation
    </CardTitle>

  </CardHeader>

  <CardContent>

    <div className="flex items-start gap-4">

      <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
        <Brain className="w-5 h-5 text-primary" />
      </div>

      <div>

        <h3 className="font-semibold">
          {oneYearScore > currentScore
            ? "Positive Health Trajectory"
            : oneYearScore < currentScore
            ? "Potential Health Decline"
            : "Stable Health Trajectory"}
        </h3>

        <p className="text-sm text-muted-foreground mt-1">

          {oneYearScore > currentScore
            ? "Your current health indicators suggest a potentially improving trajectory. Maintaining healthy lifestyle habits may support continued improvement."
            : oneYearScore < currentScore
            ? "Your current health indicators suggest a potential decline in your health score. Improving lifestyle factors and monitoring your health regularly may help."
            : "Your current health indicators suggest a relatively stable trajectory. Continued monitoring can help identify changes early."}

        </p>

      </div>

    </div>

  </CardContent>

</Card>
      {/* Multi-metric trends */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-heading">BMI Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "11px" }} />
                  <Line type="monotone" dataKey="bmi" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="glass-card border-border/50">
          <CardHeader>
            <CardTitle className="text-sm font-heading">Blood Pressure Trend</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-48">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={trendData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="date" tick={{ fontSize: 10 }} />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip contentStyle={{ background: "hsl(var(--card))", border: "1px solid hsl(var(--border))", borderRadius: "12px", fontSize: "11px" }} />
                  <Line type="monotone" dataKey="bp" stroke="#ef4444" strokeWidth={2} dot={{ r: 3 }} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}