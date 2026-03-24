"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/lib/hooks/use-auth";
import { EventForm } from "@/components/events/event-form";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";

interface EventData {
  id: string;
  short_id: string;
  title: string;
  description: string | null;
  location: string | null;
  starts_at: string;
  ends_at: string | null;
  itinerary: { time: string; activity: string; notes?: string }[];
  status: string;
}

function EditEventContent() {
  const { isLeader } = useAuth();
  const params = useParams<{ id: string }>();
  const [event, setEvent] = useState<EventData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    async function fetchEvent() {
      const supabase = createSupabaseBrowserClient();
      const { data, error } = await supabase
        .from("events")
        .select("id, short_id, title, description, location, starts_at, ends_at, itinerary, status")
        .eq("id", params.id)
        .single();

      if (error || !data) {
        setNotFound(true);
      } else {
        setEvent(data as EventData);
      }
      setLoading(false);
    }
    fetchEvent();
  }, [params.id]);

  if (!isLeader) {
    return (
      <section>
        <h1 className="text-2xl font-bold mb-4">Edit Event</h1>
        <p className="text-gray-600">Only leaders can edit events.</p>
        <a href="/dashboard" className="text-blue-600 hover:underline text-sm mt-4 inline-block">
          &larr; Back to dashboard
        </a>
      </section>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12" role="status">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-gray-200 border-t-[#1a2744]" />
        <span className="sr-only">Loading event...</span>
      </div>
    );
  }

  if (notFound || !event) {
    return (
      <section>
        <h1 className="text-2xl font-bold mb-4">Event not found</h1>
        <a href="/dashboard" className="text-blue-600 hover:underline text-sm mt-4 inline-block">
          &larr; Back to dashboard
        </a>
      </section>
    );
  }

  return (
    <section aria-labelledby="edit-event-heading">
      <h1 id="edit-event-heading" className="text-2xl font-bold mb-4">
        Edit Event
      </h1>
      <EventForm
        mode="edit"
        eventId={event.id}
        initialData={{
          title: event.title,
          description: event.description ?? "",
          location: event.location ?? "",
          starts_at: event.starts_at,
          ends_at: event.ends_at ?? "",
          itinerary: (event.itinerary ?? []).map((item) => ({
            time: item.time,
            activity: item.activity,
            notes: item.notes ?? "",
          })),
          short_id: event.short_id,
          status: event.status,
        }}
      />
      <a href="/dashboard" className="text-blue-600 hover:underline text-sm mt-6 inline-block">
        &larr; Back to dashboard
      </a>
    </section>
  );
}

export default function EditEventPage() {
  return (
    <AuthGuard>
      <EditEventContent />
    </AuthGuard>
  );
}
