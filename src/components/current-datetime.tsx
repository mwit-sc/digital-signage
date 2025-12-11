"use client";

import React, { useEffect, useState, useCallback } from "react";

export function CurrentDateTime() {
  const [currentTime, setCurrentTime] = useState(new Date());
  const [timeOffset, setTimeOffset] = useState(0);

  const syncTime = useCallback(async () => {
    try {
      const start = Date.now();
      const response = await fetch('/api/time', { cache: 'no-store' });
      const end = Date.now();

      if (response.ok) {
        const serverTime = new Date(await response.text());
        const networkDelay = (end - start) / 2;
        const serverTimestamp = serverTime.getTime() + networkDelay;
        const localTimestamp = Date.now();
        setTimeOffset(serverTimestamp - localTimestamp);
      }
    } catch (error) {
      console.warn('Failed to sync time with server:', error);
    }
  }, []);

  useEffect(() => {
    // Initial sync on mount
    syncTime();

    // Set up periodic sync every 10 minutes (instead of 5)
    const syncInterval = setInterval(syncTime, 10 * 60 * 1000);

    return () => {
      clearInterval(syncInterval);
    };
  }, [syncTime]);

  // Separate useEffect for the clock tick to avoid dependency on timeOffset
  useEffect(() => {
    const clockInterval = setInterval(() => {
      setCurrentTime(new Date(Date.now() + timeOffset));
    }, 1000);

    return () => {
      clearInterval(clockInterval);
    };
  }, [timeOffset]);

  const formattedDate = currentTime.toLocaleDateString('th-TH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const formattedTime = currentTime.toLocaleTimeString('th-TH', {
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false
  });

  return (
    <div className="text-right" suppressHydrationWarning>
      <div className="text-3xl font-semibold text-white drop-shadow-xl opacity-95">
        {formattedDate}
      </div>
      <div className="text-4xl font-bold text-white drop-shadow-xl mt-1">
        {formattedTime} น.
      </div>
    </div>
  );
}