import React from "react";
import { motion } from "framer-motion";

export default function PageHeader({ title, subtitle, icon: Icon, action }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
    >
      <div className="flex items-center gap-3">
        {Icon && (
          <div className="w-11 h-11 rounded-2xl gradient-primary flex items-center justify-center shadow-lg">
            <Icon className="w-6 h-6 text-white" />
          </div>
        )}
        <div>
          <h1 className="text-2xl md:text-3xl font-bold font-heading">{title}</h1>
          {subtitle && <p className="text-sm text-muted-foreground mt-0.5">{subtitle}</p>}
        </div>
      </div>
      {action}
    </motion.div>
  );
}