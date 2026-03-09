"use client";

import { useEffect, useState } from "react";
import { GoogleAnalytics } from "./google-analytics";

export function AnalyticsLoader() {
  const [analyticsId, setAnalyticsId] = useState<string | undefined>();

  useEffect(() => {
    // Fetch SEO settings to get Google Analytics ID
    const fetchAnalyticsId = async () => {
      try {
        const response = await fetch("/api/seo");
        const data = await response.json();
        if (data.success && data.data?.googleAnalyticsId) {
          setAnalyticsId(data.data.googleAnalyticsId);
        }
      } catch (error) {
        console.error("Failed to load Google Analytics ID:", error);
      }
    };

    fetchAnalyticsId();
  }, []);

  if (!analyticsId) {
    return null;
  }

  return <GoogleAnalytics googleAnalyticsId={analyticsId} />;
}
