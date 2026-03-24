"use client";

import { useEffect, useState } from "react";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/lib/hooks/use-auth";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { formatShortDate } from "@/lib/date-utils";

interface EventRow {
  id: string;
  short_id: string;
  title: string;
  location: string | null;
  starts_at: string;
  status: string;
}

interface RSVPCount {
  event_id: string;
  status: string;
}

function DashboardContent() {
  const { isLeader, profile } = useAuth();
  const [events, setEvents] = useState<EventRow[]>([]);
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, { going: number; maybe: number }>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isLeader || !profile) return;

    async function fetchEvents() {
      const supabase = createSupabaseBrowserClient();
      const { data } = await supabase
        .from("events")
        .select("id, short_id, title, location, starts_at, status")
        .eq("unit_id", profile!.unit_id)
        .order("starts_at", { ascending: false });

      const eventList = (data ?? []) as EventRow[];
      setEvents(eventList);

      // Fetch RSVP counts for all events
      if (eventList.length > 0) {
        const eventIds = eventList.map((e) => e.id);
        const { data: rsvps } = await supabase
          .from("rsvps")
          .select("event_id, status")
          .in("event_id", eventIds);

        const counts: Record<string, { going: number; maybe: number }> = {};
        for (const r of (rsvps ?? []) as RSVPCount[]) {
          if (!counts[r.event_id]) counts[r.event_id] = { going: 0, maybe: 0 };
          if (r.status === "going") counts[r.event_id].going++;
          else if (r.status === "maybe") counts[r.event_id].maybe++;
        }
        setRsvpCounts(counts);
      }

      setLoading(false);
    }

    fetchEvents();
  }, [isLeader, profile]);

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
      <div className="flex items-center justify-between mb-4">
        <h1 id="dashboard-heading" className="text-2xl font-bold">
          Leader Dashboard
        </h1>
        <a
          href="/dashboard/event/new"
          className="rounded-md bg-[#1a2744] text-white py-2 px-4 text-sm font-medium hover:bg-[#2a3754] focus:outline-none focus:ring-2 focus:ring-[#1a2744] focus:ring-offset-2"
        >
          Create Event
        </a>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12" role="status">
          <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#1a2744]" />
          <span className="sr-only">Loading events...</span>
        </div>
      ) : events.length === 0 ? (
        <p className="text-gray-600">No events yet. Create your first event.</p>
      ) : (
        <ul className="space-y-3" role="list">
          {events.map((event) => {
            const counts = rsvpCounts[event.id] ?? { going: 0, maybe: 0 };
            return (
              <li
                key={event.id}
                className="border border-gray-200 rounded-md p-4"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <h2 className="font-medium text-sm truncate">{event.title}</h2>
                    <p className="text-xs text-gray-500 mt-0.5">
                      {formatShortDate(event.starts_at)}
                      {event.location && ` · ${event.location}`}
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {counts.going} going
                      {counts.maybe > 0 && ` · ${counts.maybe} maybe`}
                    </p>
                  </div>
                  <span
                    className={`shrink-0 text-xs rounded px-1.5 py-0.5 ${
                      event.status === "published"
                        ? "bg-green-100 text-green-700"
                        : event.status === "cancelled"
                          ? "bg-red-100 text-red-700"
                          : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {event.status}
                  </span>
                </div>
                <div className="flex gap-3 mt-2">
                  <a
                    href={`/e/${event.short_id}`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    View
                  </a>
                  <a
                    href={`/dashboard/event/${event.id}/edit`}
                    className="text-xs text-blue-600 hover:underline"
                  >
                    Edit
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      )}

      <a href="/" className="text-blue-600 hover:underline text-sm mt-6 inline-block">
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
