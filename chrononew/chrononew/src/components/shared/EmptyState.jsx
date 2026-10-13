import React from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";

export default function EmptyState({ icon: Icon, title, description, ctaLabel, ctaTo }) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="glass-card rounded-2xl p-12 text-center"
    >
      {Icon && (
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-4">
          <Icon className="w-8 h-8 text-primary opacity-70" />
        </div>
      )}
      <h2 className="text-lg font-bold mb-2">{title}</h2>
      {description && <p className="text-sm text-muted-foreground mb-4 max-w-md mx-auto">{description}</p>}
      {ctaLabel && ctaTo && (
        <Link
          to={ctaTo}
          className="inline-flex px-6 py-2.5 rounded-xl gradient-primary text-white text-sm font-medium"
        >
          {ctaLabel}
        </Link>
      )}
    </motion.div>
  );
}