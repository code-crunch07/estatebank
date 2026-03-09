import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Real Deals | Trusted Real Estate Consultants in Mumbai Since 2004",
  description:
    "Real Deals is a RERA registered real estate consultancy in Mumbai established in 2004. We specialize in primary sales, resale, rentals, and NRI property management across Mumbai.",
};

export default function AboutLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
