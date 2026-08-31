// src/components/Providers.tsx
"use client";

import React from "react";
import { SettingsProvider } from "@/context/Settings";
import { NowProvider } from "@/context/Now";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SettingsProvider>
      <NowProvider>
        {children}
      </NowProvider>
    </SettingsProvider>
  );
}