import localFont from "next/font/local";
import ClientLayoutClient from "./client-layout-client";

const figtree = localFont({
  src: [
    { path: "../../public/fonts/Figtree-Regular.woff", weight: "400", style: "normal" },
    { path: "../../public/fonts/Figtree-Bold.woff", weight: "700", style: "normal" },
  ],
  variable: "--font-figtree",
  display: "swap",
  preload: true,
});

export default function ClientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <ClientLayoutClient className={`${figtree.variable} font-figtree`}>{children}</ClientLayoutClient>;
}

