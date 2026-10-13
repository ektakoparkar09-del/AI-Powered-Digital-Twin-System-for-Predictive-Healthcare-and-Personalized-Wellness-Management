import React from "react";
import { motion } from "framer-motion";

export default function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  color,
  delay = 0,
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        delay,
        duration: 0.5,
      }}
      whileHover={{
        y: -5,
        scale: 1.03,
      }}
      whileTap={{
        scale: 0.98,
      }}
      className="glass-card rounded-2xl p-5 relative overflow-hidden group cursor-pointer hover:shadow-xl transition-all duration-300"
    >
      {/* Top Accent Line */}

      <div
        className={`absolute top-0 left-0 w-full h-1 ${color}`}
      />

      <div className="flex justify-between items-start">

        <div className="flex-1">

          <p className="text-xs uppercase tracking-wide text-muted-foreground font-medium">
            {label}
          </p>

          <div className="mt-2 flex items-end gap-2">

            <motion.span
              className="text-3xl font-bold font-display"
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              transition={{
                delay: delay + 0.2,
              }}
            >
              {value}
            </motion.span>

            {unit && (
              <span className="text-xs text-muted-foreground mb-1">
                {unit}
              </span>
            )}

          </div>

        </div>

        <motion.div
          className={`w-12 h-12 rounded-xl flex items-center justify-center ${color} shadow-lg`}
          whileHover={{
            rotate: 360,
          }}
          transition={{
            duration: 0.6,
          }}
        >
          <Icon className="w-6 h-6 text-white" />
        </motion.div>

      </div>

      {/* Bottom Glow */}

      <div className="absolute bottom-0 left-0 w-full h-8 bg-gradient-to-t from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
    </motion.div>
  );
}