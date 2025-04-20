// frontend/src/components/ui/input.js
import React from "react";

export function Input(props) {
  return (
    <input
      {...props}
      style={{
        padding: "10px",
        margin: "10px 0",
        width: "100%",
        border: "1px solid #ccc",
        borderRadius: "6px",
      }}
    />
  );
}
