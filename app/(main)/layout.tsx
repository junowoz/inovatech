import { Header } from "@/components/layout/header";
import { Footer } from "@/components/layout/footer";
import { getCurrentUser, isCurrentUserAdmin, userDisplayName } from "@/lib/auth";

export default async function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const user = await getCurrentUser();
  const displayName = userDisplayName(user);
  const isAdmin = user ? await isCurrentUserAdmin() : false;

  return (
    <div className="flex min-h-dvh flex-col">
      <Header user={user ? { displayName, isAdmin } : null} />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}
