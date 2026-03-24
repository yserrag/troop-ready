"use client";

import { AuthGuard } from "@/components/auth/auth-guard";
import { useAuth } from "@/lib/hooks/use-auth";
import { EventForm } from "@/components/events/event-form";

function CreateEventContent() {
  const { isLeader } = useAuth();

  if (!isLeader) {
    return (
      <section>
        <h1 className="text-2xl font-bold mb-4">Create Event</h1>
        <p className="text-gray-600">Only leaders can create events.</p>
        <a href="/dashboard" className="text-blue-600 hover:underline text-sm mt-4 inline-block">
          &larr; Back to dashboard
        </a>
      </section>
    );
  }

  return (
    <section aria-labelledby="create-event-heading">
      <h1 id="create-event-heading" className="text-2xl font-bold mb-4">
        Create Event
      </h1>
      <EventForm mode="create" />
      <a href="/dashboard" className="text-blue-600 hover:underline text-sm mt-6 inline-block">
        &larr; Back to dashboard
      </a>
    </section>
  );
}

export default function CreateEventPage() {
  return (
    <AuthGuard>
      <CreateEventContent />
    </AuthGuard>
  );
}
