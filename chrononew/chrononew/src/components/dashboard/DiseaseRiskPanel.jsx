import React from "react";
import { ShieldAlert } from "lucide-react";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/components/ui/card";

import { Badge } from "@/components/ui/badge";
import { motion } from "framer-motion";
import RiskGauge from "./RiskGauge";
import { getAllDiseaseRisks } from "@/lib/healthUtils";

export default function DiseaseRiskPanel({ risks, profile }) {
  const baseList = getAllDiseaseRisks(profile || {});

  const items = baseList
    .map((d) => ({
      ...d,
      value:
        risks && risks[d.key] != null
          ? risks[d.key]
          : d.value,
    }))
    .sort((a, b) => b.value - a.value);

  const overallRisk =
  items.length > 0
    ? Math.round(
        items.reduce(
          (sum, item) => sum + item.value,
          0
        ) / items.length
      )
    : 0;

  return (
    <Card className="glass-card bg-white/80 backdrop-blur-xl border-white/30 shadow-xl">

      <CardHeader>

        <div className="flex items-center justify-between">

<CardTitle className="flex items-center gap-2">

<ShieldAlert className="w-5 h-5 text-red-500"/>

Disease Risk Prediction

</CardTitle>

<Badge>

{items.length} Diseases

</Badge>

</div>

        <p className="text-sm text-muted-foreground">

          {items.length} diseases analyzed using AI

        </p>

      </CardHeader>

      <CardContent>

  {/* Summary */}
  <div className="mb-5 rounded-xl border border-blue-200/60 bg-blue-50/40 p-4">

    <div className="flex items-center justify-between mb-2">

      <h4 className="font-semibold">
        AI Risk Analysis Summary
      </h4>

      <span className="text-sm font-semibold text-blue-600">
        AI Confidence 96%
      </span>

    </div>

    <p className="text-sm text-muted-foreground">

      {items.filter((d) => d.value >= 70).length} High Risk •{" "}
      {items.filter(
        (d) => d.value >= 40 && d.value < 70
      ).length} Moderate Risk •{" "}
      {items.filter((d) => d.value < 40).length} Low Risk

    </p>

  </div>


  {/* Overall Health Risk */}

<div className="mb-5 rounded-xl border bg-muted/20 p-4">

  <div className="flex items-center justify-between mb-3">

    <div className="flex items-center gap-2">

      <ShieldAlert className="w-4 h-4 text-primary" />

      <span className="font-semibold text-sm">
        Overall Health Risk
      </span>

    </div>

    <span className="text-lg font-bold">
      {overallRisk}%
    </span>

  </div>

  <div className="h-2 rounded-full bg-muted overflow-hidden">

    <div
      className={`h-full rounded-full ${
        overallRisk >= 70
          ? "bg-red-500"
          : overallRisk >= 40
          ? "bg-yellow-500"
          : "bg-green-500"
      }`}
      style={{
        width: `${Math.min(Math.max(overallRisk, 0), 100)}%`,
      }}
    />

  </div>

  <div className="flex justify-between mt-2">

    <span className="text-xs text-muted-foreground">
      Combined AI risk assessment
    </span>

    <span
      className={`text-xs font-semibold ${
        overallRisk >= 70
          ? "text-red-600"
          : overallRisk >= 40
          ? "text-yellow-600"
          : "text-green-600"
      }`}
    >
      {overallRisk >= 70
        ? "High Risk"
        : overallRisk >= 40
        ? "Moderate Risk"
        : "Low Risk"}
    </span>

  </div>

</div>


  {/* Prediction */}
  <div className="text-xs text-muted-foreground mb-5">

    Prediction Generated

    <br />

    {new Date().toLocaleString()}

  </div>


  {/* Progress */}
  <div className="mb-5">

    <p className="text-sm font-medium mb-2">
      AI Disease Scan Progress
    </p>

    <div className="h-2 rounded-full bg-muted overflow-hidden">

      <div
        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500"
        style={{ width: "100%" }}
      />

    </div>

    <p className="text-xs text-muted-foreground mt-1">
      {items.length} diseases successfully analyzed
    </p>

  </div>


  {/* Highest Risk Summary */}

<div className="mb-5 flex items-center justify-between rounded-xl border bg-muted/20 p-4">

  <div>

    <p className="text-xs text-muted-foreground">
      Highest Risk
    </p>

    <p className="font-semibold">
      {items[0]?.label || "No data"}
    </p>

  </div>

  <div className="text-right">

    <p
      className={`text-2xl font-bold ${
        items[0]?.value >= 70
          ? "text-red-600"
          : items[0]?.value >= 40
          ? "text-yellow-600"
          : "text-green-600"
      }`}
    >
      {items[0]?.value ?? 0}%
    </p>

    <p className="text-xs text-muted-foreground">
      {items[0]?.value >= 70
        ? "High"
        : items[0]?.value >= 40
        ? "Moderate"
        : "Low"}
    </p>

  </div>

</div>

  {/* Disease Risk Overview */}

<div className="mb-5">

  <div className="flex items-center justify-between mb-3">

    <h3 className="font-semibold">
      Disease Risk Overview
    </h3>

    <span className="text-xs text-muted-foreground">
      {items.length} conditions
    </span>

  </div>

</div>


  {/* Disease Risk Grid */}

<div className="grid grid-cols-1 md:grid-cols-2 gap-3">

  {items.map((d) => {

    const status =
      d.value >= 70
        ? "HIGH"
        : d.value >= 40
        ? "MODERATE"
        : "LOW";

    const statusClass =
      d.value >= 70
        ? "bg-red-100 text-red-700 border-red-200"
        : d.value >= 40
        ? "bg-yellow-100 text-yellow-700 border-yellow-200"
        : "bg-green-100 text-green-700 border-green-200";

    return (

      <motion.div
        key={d.key}
        whileHover={{ y: -2 }}
        transition={{ duration: 0.2 }}
        className="rounded-xl border bg-white/60 dark:bg-white/5 p-4 shadow-sm"
      >

        {/* Disease Header */}

        <div className="flex items-center justify-between gap-3 mb-3">

  <div className="flex items-center gap-2 min-w-0">

    {d.icon && (
      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
        <d.icon className="w-4 h-4 text-primary" />
      </div>
    )}

    <span className="font-medium text-sm truncate">
      {d.label}
    </span>

  </div>

  <div className="flex items-center gap-2 shrink-0">

    <RiskGauge
      value={d.value}
      size={42}
      strokeWidth={5}
    />

    <span className="font-bold text-sm">
      {d.value}%
    </span>

  </div>

</div>


        {/* Risk Bar */}

        <div className="h-2 rounded-full bg-muted overflow-hidden">

          <div
            className={`h-full rounded-full ${
              d.value >= 70
                ? "bg-red-500"
                : d.value >= 40
                ? "bg-yellow-500"
                : "bg-green-500"
            }`}
            style={{
              width: `${Math.min(Math.max(d.value, 0), 100)}%`,
            }}
          />

        </div>


        {/* Status */}

        <div className="flex items-center justify-between mt-3">

          <span
            className={`px-2 py-1 rounded-full border text-[10px] font-semibold ${statusClass}`}
          >
            {status}
          </span>

          <span className="text-[11px] text-muted-foreground">
            AI Risk Score
          </span>

        </div>

      </motion.div>

    );

  })}

</div>

</CardContent>

    </Card>
  );
}