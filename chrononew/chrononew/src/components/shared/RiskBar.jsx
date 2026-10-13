import React from "react";
import { motion } from "framer-motion";
import { getRiskLevel } from "@/lib/healthUtils";

export default function RiskBar({ label, value, icon: Icon }) {
  const info = getRiskLevel(value);
  return (
    <div>
      <div className="flex justify-between text-sm mb-1">
        <span className="flex items-center gap-1.5">
          {Icon && <Icon className="w-3.5 h-3.5 text-muted-foreground" />}
          {label}
        </span>
        <span className={`font-semibold ${info.color}`}>{value}% · {info.label}</span>
      </div>
      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={`h-full rounded-full ${info.bg}`}
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 0.8 }}
        />
      </div>
    </div>
  );
}