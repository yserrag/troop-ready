"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/lib/hooks/use-auth";

function DashboardContent() {
  const { isLeader } = useAuth();

  if (!isLeader) {
    return (
      <section aria-labelledby="dashboard-heading">
        <h1 id="dashboard-heading" className="text-2xl font-bold mb-4">
          Leader Dashboard
        </h1>
        <div className="rounded-md bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
          <p className="font-medium">Leader access required</p>
          <p className="mt-1">
            You need a leader invite code to access the dashboard.
          </p>
          <a
            href="/auth/leader-invite"
            className="inline-block mt-3 text-blue-600 hover:underline font-medium"
          >
            Enter invite code
          </a>
        </div>
        <a href="/" className="text-blue-600 hover:underline text-sm mt-6 inline-block">
          &larr; Back to events
        </a>
      </section>
    );
  }

  return (
    <section aria-labelledby="dashboard-heading">
      <h1 id="dashboard-heading" className="text-2xl font-bold mb-4">
        Leader Dashboard
      </h1>
      <nav aria-label="Dashboard actions" className="flex gap-4 mb-4">
        <a
          href="/dashboard/event/new"
          className="rounded-md bg-[#1a2744] text-white py-2 px-4 text-sm font-medium hover:bg-[#2a3754]"
        >
          Create Event
        </a>
      </nav>
      <p className="text-gray-600">Your events will appear here. Full dashboard coming in WO#7.</p>
      <a href="/" className="text-blue-600 hover:underline text-sm mt-4 inline-block">
        &larr; Back to events
      </a>
    </section>
  );
}

export default function DashboardPage() {
  return (
    <AuthGuard>
      <DashboardContent />
    </AuthGuard>
  );
}
