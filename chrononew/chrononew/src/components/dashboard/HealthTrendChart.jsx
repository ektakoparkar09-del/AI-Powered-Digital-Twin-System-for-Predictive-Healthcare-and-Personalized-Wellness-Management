import React from "react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
import { TrendingUp } from "lucide-react";
import { motion } from "framer-motion";

import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

export default function HealthTrendChart({ snapshots }) {
  const data = [...(snapshots || [])]
  .sort(
    (a, b) =>
      new Date(a.snapshot_date) -
      new Date(b.snapshot_date)
  )
    .slice(-12)
    .map((s) => ({
  date: format(new Date(s.snapshot_date), "MMM d"),
  score: s.health_score ?? 0,
  bmi: s.bmi ?? "--",
  bp: s.blood_pressure_systolic ?? "--",
}));

  const latest = data[data.length - 1];

  if (data.length === 0) {
    return (
      <Card className="glass-card">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-purple-500" />
            Health Trends
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="h-56 flex flex-col items-center justify-center text-center text-muted-foreground">

            <motion.div
              animate={{ scale: [1, 1.15, 1] }}
              transition={{
                duration: 2,
                repeat: Infinity,
              }}
              className="w-12 h-12 rounded-full bg-purple-500/10 flex items-center justify-center mb-4"
            >
              <TrendingUp className="w-6 h-6 text-purple-500" />
            </motion.div>

            <p className="font-medium">
              No trend data available yet.
            </p>

            <p className="text-sm mt-2">
              Save your health profile multiple
              times to generate trend analysis.
            </p>

          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <motion.div
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <Card className="glass-card">

        <CardHeader>

          <div className="flex justify-between items-center">

            <CardTitle className="flex items-center gap-2">

              <TrendingUp className="w-5 h-5 text-purple-500" />

              Health Trends

            </CardTitle>

            <div className="text-right">

              <p className="text-xs text-muted-foreground">
                Current Score
              </p>

              <p className="font-bold text-primary text-lg">
                {latest?.score || "--"}
              </p>

            </div>

          </div>

          <p className="text-sm text-muted-foreground">
            Last 12 Health Snapshots
          </p>

        </CardHeader>

        <CardContent>

          <div className="h-64">

            <ResponsiveContainer
              width="100%"
              height="100%"
            >

              <AreaChart data={data}>

                <defs>

                  <linearGradient
                    id="scoreGrad"
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >

                    <stop
                      offset="5%"
                      stopColor="#0ea5e9"
                      stopOpacity={0.35}
                    />

                    <stop
                      offset="95%"
                      stopColor="#0ea5e9"
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
  formatter={(value) => [`${value}/100`, "Health Score"]}
  labelFormatter={(label) => `Snapshot : ${label}`}
  contentStyle={{
    borderRadius: 12,
    border: "1px solid hsl(var(--border))",
    background: "hsl(var(--card))",
  }}
/>

                <Area
                  type="natural"
                  dataKey="score"
                  stroke="#0ea5e9"
                  fill="url(#scoreGrad)"
                  strokeWidth={3}
                  animationDuration={1500}
                />

              </AreaChart>

            </ResponsiveContainer>

          </div>

        </CardContent>

      </Card>
    </motion.div>
  );
}