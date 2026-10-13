import React from "react";
import { getRiskLevel } from "@/lib/healthUtils";
import { motion } from "framer-motion";
import { CircleAlert } from "lucide-react";

export default function RiskGauge({ label, value, icon: Icon }) {
  const risk = getRiskLevel(value);

  // Prevent crash if no icon is passed
  const SafeIcon = Icon || CircleAlert;

  return (
    <motion.div
      className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 cursor-pointer group"
      whileHover={{
        scale: 1.02,
        y: -2,
      }}
      transition={{ duration: 0.2 }}
    >
      {/* Icon */}
      <motion.div
        className="w-10 h-10 rounded-xl bg-card border flex items-center justify-center shadow-sm"
        transition={{ duration: 0.3 }}
      >
        <SafeIcon className={`w-5 h-5 ${risk.color}`} />
      </motion.div>

      {/* Content */}
      <div className="flex-1 min-w-0">

        {/* Label + Probability */}
        <div className="flex items-center justify-between mb-1">
          <span className="text-xs font-medium truncate">
            {label}
          </span>

          <motion.span
            className={`text-xs font-bold ${risk.color}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8 }}
          >
            {value}%
          </motion.span>
        </div>

        {/* AI Estimated Probability */}
        <p className="text-[10px] text-muted-foreground mb-1">
          AI Estimated Probability
        </p>

        {/* Progress bar */}
        <div className="w-full h-1.5 bg-muted rounded-full overflow-hidden">
          <motion.div
            className={`h-full rounded-full ${risk.bg}`}
            initial={{ width: 0 }}
            animate={{ width: `${value}%` }}
            transition={{
              duration: 1.5,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Risk level + percentage */}
        <div className="flex justify-between items-center mt-1">

          <span className={`text-[10px] ${risk.color}`}>
            {risk.label} Risk
          </span>

          <span
            className={`text-[10px] px-2 py-0.5 rounded-full ${risk.bg} text-white`}
          >
            {value}%
          </span>

        </div>
      </div>
    </motion.div>
  );
}