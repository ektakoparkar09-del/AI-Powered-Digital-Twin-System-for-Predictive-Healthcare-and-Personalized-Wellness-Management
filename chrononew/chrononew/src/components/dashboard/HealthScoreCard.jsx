import React from "react";
import { getScoreColor } from "@/lib/healthUtils";
import { motion } from "framer-motion";
import { Activity } from "lucide-react";

export default function HealthScoreCard({
  score = 0,
  bmi,
  age,
  heartRate,
}) {
  const { bg, text, label } = getScoreColor(score);
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (score / 100) * circumference;
  const pulseCircumference = 2 * Math.PI * 62;

  return (
    <motion.div 
      className="glass-card rounded-2xl p-6 flex flex-col items-center group cursor-pointer"
      whileHover={{ y: -4, scale: 1.02 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-2 mb-4 w-full">
        <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center shadow-lg">
          <Activity className="w-4 h-4 text-white" />
        </div>
        <h3 className="font-heading font-semibold text-sm">Health Score</h3>
      </div>
      
      <div className="relative w-36 h-36">
        {/* Pulsing outer ring */}
        <svg className="absolute inset-0 w-36 h-36 -rotate-90" viewBox="0 0 136 136">
          <motion.circle
            cx="68" cy="68" r="62" fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeOpacity={0.3}
            className={text}
            animate={{ scale: [1, 1.06, 1], opacity: [0.4, 0.1, 0.4] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
        </svg>
        
        <svg className="w-32 h-32 -rotate-90 absolute top-0.5 left-0.5" viewBox="0 0 120 120">
          <circle cx="60" cy="60" r="54" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
          <motion.circle
            cx="60" cy="60" r="54" fill="none"
            stroke="currentColor"
            strokeWidth="8"
            strokeLinecap="round"
            strokeDasharray={circumference}
            initial={{ strokeDashoffset: circumference }}
            animate={{ strokeDashoffset: offset }}
            transition={{ duration: 1.5, ease: "easeOut" }}
            className={text}
          />
        </svg>
        
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <motion.span
            className="text-3xl font-bold font-display"
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.5, type: "spring", stiffness: 200 }}
          >
            {score}
          </motion.span>
          <span className="text-xs text-muted-foreground">/ 100</span>
        </div>
      </div>
      
      <motion.div
  className={`mt-3 px-3 py-1 rounded-full text-xs font-medium ${bg} text-white shadow-md`}
  whileHover={{ scale: 1.1 }}
>
  {label}
</motion.div>

<div className="grid grid-cols-3 gap-3 mt-6 w-full">

  <div className="rounded-xl bg-slate-100 p-3 text-center">

    <p className="text-xs text-muted-foreground">
      BMI
    </p>

    <p className="font-bold">
      {bmi ?? "--"}
    </p>

  </div>

  <div className="rounded-xl bg-slate-100 p-3 text-center">

    <p className="text-xs text-muted-foreground">
      Age
    </p>

    <p className="font-bold">
      {age ?? "--"}
    </p>

  </div>

  <div className="rounded-xl bg-slate-100 p-3 text-center">

    <p className="text-xs text-muted-foreground">
      Heart Rate
    </p>

    <p className="font-bold">
      {heartRate ?? "--"}
    </p>

  </div>

</div>
    </motion.div>
  );
}