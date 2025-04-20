// frontend/src/components/ui/tabs.js
import React, { useState } from "react";

export function Tabs({ defaultValue, children }) {
  const [activeTab, setActiveTab] = useState(defaultValue);
  return React.Children.map(children, (child) => {
    return React.cloneElement(child, { activeTab, setActiveTab });
  });
}

export function TabsList({ children }) {
  return <div style={{ display: "flex", marginBottom: "1rem" }}>{children}</div>;
}

export function TabsTrigger({ value, children, activeTab, setActiveTab }) {
  return (
    <button
      onClick={() => setActiveTab(value)}
      style={{
        padding: "10px 16px",
        borderBottom: activeTab === value ? "2px solid #007bff" : "none",
        background: "none",
        border: "none",
        cursor: "pointer",
        fontWeight: activeTab === value ? "bold" : "normal",
      }}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, activeTab, children }) {
  if (value !== activeTab) return null;
  return <div>{children}</div>;
}
