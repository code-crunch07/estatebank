// Force dynamic render for /login — avoids prerender error
// "Cannot read properties of null (reading 'useEffect')" during next build.
// Route segment config must be in a Server Component (not in the client page).
export const dynamic = 'force-dynamic';

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
