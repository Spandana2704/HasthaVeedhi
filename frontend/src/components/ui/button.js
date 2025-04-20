// frontend/src/components/ui/button.js
import React from "react";

export function Button({ children, ...props }) {
  return (
    <button
      {...props}
      style={{
        padding: "10px 16px",
        backgroundColor: "#007bff",
        color: "white",
        border: "none",
        borderRadius: "6px",
        cursor: "pointer",
      }}
    >
      {children}
    </button>
  );
}
