import React from "react";
import {
  Sparkles,
  Salad,
  Dumbbell,
  Moon,
  Droplets,
  Wind,
  Scale,
  HeartPulse,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

function getRecommendationInfo(text) {
  const lower = text.toLowerCase();

  if (lower.includes("exercise"))
    return {
      icon: Dumbbell,
      color: "bg-orange-500",
      priority: "High",
    };

  if (lower.includes("sleep"))
    return {
      icon: Moon,
      color: "bg-indigo-500",
      priority: "Medium",
    };

  if (lower.includes("water"))
    return {
      icon: Droplets,
      color: "bg-cyan-500",
      priority: "Medium",
    };

  if (
    lower.includes("diet") ||
    lower.includes("food") ||
    lower.includes("nutrition") ||
    lower.includes("sugar")
  )
    return {
      icon: Salad,
      color: "bg-green-500",
      priority: "High",
    };

  if (
    lower.includes("stress") ||
    lower.includes("mental")
  )
    return {
      icon: Wind,
      color: "bg-violet-500",
      priority: "Medium",
    };

  if (
    lower.includes("weight") ||
    lower.includes("bmi")
  )
    return {
      icon: Scale,
      color: "bg-pink-500",
      priority: "High",
    };

  return {
    icon: HeartPulse,
    color: "gradient-primary",
    priority: "General",
  };
}

export default function RecommendationsPanel({
  recommendations,
}) {
  const items = Array.isArray(recommendations)
  ? recommendations
  : [];

  return (
    <motion.div
      className="glass-card rounded-2xl p-6"
      whileHover={{ y: -2 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex justify-between items-center mb-5">

        <div className="flex items-center gap-2">

          <div className="w-8 h-8 rounded-lg gradient-accent flex items-center justify-center">

            <Sparkles className="w-4 h-4 text-white" />

          </div>

          <h3 className="font-heading font-semibold">
            AI Recommendations
          </h3>

        </div>

        <span className="text-xs text-muted-foreground">
          {items.length} Suggestions
        </span>

      </div>

      {items.length === 0 ? (

        <div className="text-center py-10">

          <Sparkles className="w-10 h-10 mx-auto text-primary mb-3 opacity-60" />

          <p className="font-medium">
            No Recommendations Yet
          </p>

          <p className="text-sm text-muted-foreground mt-2">
            Complete your health profile to receive
            personalized AI wellness guidance.
          </p>

        </div>

      ) : (

        <div className="space-y-3">

          {items.slice(0, 6).map((rec, index) => {

  const recommendation =
    typeof rec === "string"
      ? rec
      : rec?.text || "Health recommendation";

  const info = getRecommendationInfo(recommendation);
  const Icon = info.icon;

  return (

    <motion.div
      key={index}
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay: index * 0.1,
      }}
      whileHover={{
        scale: 1.02,
      }}
      className="border rounded-xl p-4 bg-muted/30"
    >

      <div className="flex justify-between items-start">

        <div className="flex gap-3">

          <div
            className={`w-10 h-10 rounded-xl ${info.color} flex items-center justify-center`}
          >
            <Icon className="w-5 h-5 text-white" />
          </div>

          <div>

            <p className="text-sm leading-relaxed">
              {recommendation}
            </p>

            <span className="text-xs text-primary font-medium">
              {info.priority} Priority
            </span>

          </div>

        </div>

        <ChevronRight className="w-4 h-4 text-muted-foreground" />

      </div>

    </motion.div>

  );

})}

        </div>

      )}
    </motion.div>
  );
}