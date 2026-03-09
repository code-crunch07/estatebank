import { DashboardLayoutClient } from './dashboard-layout-client';

// Force dynamic render for all dashboard routes — avoids prerender error
// "Cannot read properties of null (reading 'useEffect')" during next build.
// Dashboard is auth-dependent and must not be statically generated.
export const dynamic = 'force-dynamic';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <DashboardLayoutClient>{children}</DashboardLayoutClient>;
}
