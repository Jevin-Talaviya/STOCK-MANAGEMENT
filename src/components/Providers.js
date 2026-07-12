"use client";

import React from "react";
import { SessionProvider } from "next-auth/react";
import { ConfigProvider, theme } from "antd";

export default function Providers({ children }) {
  return (
    <SessionProvider>
      <ConfigProvider
        theme={{
          algorithm: theme.defaultAlgorithm,
          token: {
            colorPrimary: "#4f46e5", // Modern indigo
            colorSuccess: "#10b981", // Emerald
            colorWarning: "#f59e0b", // Amber
            colorError: "#ef4444", // Modern red
            borderRadius: 8,
            fontFamily: "var(--font-geist-sans), Arial, sans-serif",
          },
          components: {
            Button: {
              controlHeight: 38,
              borderRadius: 6,
            },
            Input: {
              controlHeight: 38,
              borderRadius: 6,
            },
            Select: {
              controlHeight: 38,
            },
          },
        }}
      >
        {children}
      </ConfigProvider>
    </SessionProvider>
  );
}
