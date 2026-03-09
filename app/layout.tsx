import type { Metadata } from "next";
import { Forum } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/providers";
import { FaviconUpdater } from "@/components/favicon-updater";
import { FontPreconnect } from "@/components/font-preconnect";
import { ErrorHandler } from "@/components/error-handler";
import { AnalyticsLoader } from "@/components/analytics-loader";

const forum = Forum({
  subsets: ["latin", "cyrillic"],
  weight: ["400"],
  variable: "--font-forum",
  display: "swap",
  preload: true,
  fallback: ["Georgia", "serif"],
});

export const metadata: Metadata = {
  title: "EstateBANK.in - Real Estate • Investments • Trust",
  description:
    "A premium destination for property investments & real estate growth. Find your dream property with EstateBANK.in.",
  icons: {
    icon: "/images/fav-icon/icon.png",
    apple: "/images/fav-icon/icon.png",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Performance hints only — no favicon here. Keys satisfy React list warning during SSG. */}
        <link key="preconnect-googleapis" rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          key="preconnect-gstatic"
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link key="dns-cloudinary" rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link key="dns-unsplash" rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className={`${forum.variable} font-sans`}>
        <ErrorHandler />
        <FaviconUpdater />
        <AnalyticsLoader />
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
