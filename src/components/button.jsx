// src/components/Button.jsx
import React from "react";

const Button = ({ type = "button", variant = "guardar", onClick, disabled = false, children, className = "" }) => {
  // Use inline-flex and smaller padding by default so icon+label stay on one line
  let baseClasses = "inline-flex items-center gap-2 text-sm font-semibold py-1 px-3 rounded-md transition-all duration-300 focus:outline-none";
  let colorClasses = "";

  switch (variant) {
    case "guardar":
      colorClasses = "bg-indigo-600 text-white hover:bg-indigo-700 disabled:bg-indigo-400";
      type = "submit"; // siempre será submit
      break;
    case "cancelar":
      colorClasses = "bg-gray-200 text-gray-800 hover:bg-gray-300 disabled:bg-gray-100";
      type = "button"; // siempre button
      break;
    case "editar":
      colorClasses = "bg-blue-600 text-white hover:bg-blue-700 disabled:bg-blue-400 shadow-sm";
      type = "button";
      break;
    case "eliminar":
      colorClasses = "bg-red-600 text-white hover:bg-red-700 disabled:bg-red-400 shadow-sm";
      type = "button";
      break;
    case "ver":
      colorClasses = "bg-green-600 text-white hover:bg-green-700 disabled:bg-green-400 shadow-sm";
      type = "button";
      break;
    default:
      colorClasses = "bg-gray-200 text-gray-800 hover:bg-gray-300";
  }

  const classes = `${baseClasses} ${colorClasses} ${className}`.trim();

  return (
    <button type={type} onClick={onClick} className={classes} disabled={disabled}>
      {children}
    </button>
  );
};

export default Button;
