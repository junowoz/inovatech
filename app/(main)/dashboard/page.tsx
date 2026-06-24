import type { Metadata } from "next";

import { DashboardClient } from "@/components/dashboard/dashboard-client";
import { requireAdmin } from "@/lib/auth";
import { getAllProjects, getLookups } from "@/lib/supabase/queries";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  robots: { index: false, follow: false },
};

export default async function DashboardPage() {
  await requireAdmin();
  const [projects, lookups] = await Promise.all([
    getAllProjects(),
    getLookups(),
  ]);

  return (
    <div className="mx-auto w-full max-w-6xl px-4 py-8">
      <h1 className="mb-6 text-2xl font-bold">Admin Dashboard</h1>
      <DashboardClient projects={projects} lookups={lookups} />
    </div>
  );
}
