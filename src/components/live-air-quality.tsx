"use client";

import React from "react";
import { useAirQuality } from "./air-quality-client";

export function LiveAirQualityUpdates() {
  const { data } = useAirQuality();

  // This component can be used to show live updates or status indicators
  // For now, it just provides the updated data context to child components
  return (
    <div className="sr-only">
      {/* Hidden component that provides live data updates */}
      {JSON.stringify(data.lastFetch)}
    </div>
  );
}