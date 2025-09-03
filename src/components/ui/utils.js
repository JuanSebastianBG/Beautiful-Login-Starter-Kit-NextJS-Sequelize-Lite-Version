import React from "react";

// Utilidades para colores
export const getRandomColor = () => {
  const colors = [
    "purple", "blue", "green", "pink", "cyan", "indigo", "violet",
    "rose", "teal", "amber", "lime", "emerald", "orange", "yellow", "red"
  ];
  return colors[Math.floor(Math.random() * colors.length)];
};

export const getColorVariant = (color, variant = "400") => {
  const colorMap = {
    purple: { 200: "#e9d5ff", 400: "#a855f7", 500: "#8b5cf6", 600: "#7c3aed" },
    blue: { 200: "#bfdbfe", 400: "#3b82f6", 500: "#1d4ed8", 600: "#2563eb" },
    green: { 200: "#bbf7d0", 400: "#22c55e", 500: "#16a34a", 600: "#059669" },
    pink: { 200: "#fbcfe8", 400: "#ec4899", 500: "#db2777", 600: "#be185d" },
    cyan: { 200: "#a5f3fc", 400: "#06b6d4", 500: "#0891b2", 600: "#0e7490" },
    indigo: { 200: "#c7d2fe", 400: "#6366f1", 500: "#4f46e5", 600: "#4338ca" },
    violet: { 200: "#ddd6fe", 400: "#8b5cf6", 500: "#7c3aed", 600: "#6d28d9" },
    rose: { 200: "#fecdd3", 400: "#f43f5e", 500: "#e11d48", 600: "#be123c" },
    teal: { 200: "#99f6e4", 400: "#14b8a6", 500: "#0d9488", 600: "#0f766e" },
    amber: { 200: "#fed7aa", 400: "#f59e0b", 500: "#d97706", 600: "#b45309" },
    lime: { 200: "#d9f99d", 400: "#84cc16", 500: "#65a30d", 600: "#4d7c0f" },
    emerald: { 200: "#a7f3d0", 400: "#10b981", 500: "#059669", 600: "#047857" },
    orange: { 200: "#fed7aa", 400: "#f97316", 500: "#ea580c", 600: "#c2410c" },
    yellow: { 200: "#fef3c7", 400: "#eab308", 500: "#ca8a04", 600: "#a16207" },
    red: { 200: "#fecaca", 400: "#ef4444", 500: "#dc2626", 600: "#b91c1c" }
  };
  return colorMap[color]?.[variant] || "#a855f7";
};

// Componente base para todos los fondos
export const BaseBackground = ({ children, isDark = false, gradient = null }) => {
  const defaultGradient = isDark
    ? "from-gray-900 via-slate-800 to-black"
    : "from-blue-50 via-purple-50 to-indigo-50";

  return (
    <div className={`fixed inset-0 overflow-hidden pointer-events-none bg-gradient-to-br ${gradient || defaultGradient}`}>
      {children}
    </div>
  );
};