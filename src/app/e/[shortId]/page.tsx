import { createSupabaseServiceClient } from "@/lib/supabase/server";
import { EventHeader } from "@/components/events/event-header";
import { RSVPSummary } from "@/components/events/rsvp-summary";
import { ItinerarySection } from "@/components/events/itinerary-section";
import { GearPreview } from "@/components/events/gear-preview";
import { DutyPreview } from "@/components/events/duty-preview";
import { WhatsAppShare } from "@/components/events/whatsapp-share";
import { CopyLink } from "@/components/events/copy-link";
import { ShareButton } from "@/components/events/share-button";
import { formatEventDate } from "@/lib/date-utils";

export default async function EventPage({
  params,
}: {
  params: Promise<{ shortId: string }>;
}) {
  const { shortId } = await params;
  const supabase = createSupabaseServiceClient();

  const { data: event } = await supabase
    .from("events")
    .select(
      "id, short_id, title, description, location, starts_at, ends_at, itinerary, status"
    )
    .eq("short_id", shortId)
    .eq("status", "published")
    .single();

  if (!event) {
    return (
      <section aria-labelledby="not-found-heading" className="text-center py-12">
        <h1 id="not-found-heading" className="text-2xl font-bold mb-2">
          Event not found
        </h1>
        <p className="text-gray-600 mb-4">
          This event may have been cancelled or the link is incorrect.
        </p>
        <a href="/" className="text-blue-600 hover:underline">
          &larr; Back to events
        </a>
      </section>
    );
  }

  const [{ data: gear }, { data: duties }, { data: rsvps }] = await Promise.all(
    [
      supabase
        .from("gear_items")
        .select("id, item_name, quantity, category, is_shared, sort_order")
        .eq("event_id", event.id)
        .order("sort_order"),
      supabase
        .from("duties")
        .select("id, title, description, time_slot, sort_order")
        .eq("event_id", event.id)
        .order("sort_order"),
      supabase
        .from("rsvps")
        .select("status, head_count")
        .eq("event_id", event.id),
    ]
  );

  const rsvpSummary = { going: 0, maybe: 0, not_going: 0 };
  if (rsvps) {
    for (const r of rsvps) {
      if (r.status === "going") rsvpSummary.going++;
      else if (r.status === "maybe") rsvpSummary.maybe++;
      else if (r.status === "not_going") rsvpSummary.not_going++;
    }
  }

  const dateStr = formatEventDate(event.starts_at, event.ends_at);

  return (
    <article aria-labelledby="event-heading" className="space-y-6">
      <EventHeader event={event} />

      <hr className="border-gray-200" />

      <RSVPSummary
        shortId={shortId}
        going={rsvpSummary.going}
        maybe={rsvpSummary.maybe}
      />

      <hr className="border-gray-200" />

      <ItinerarySection items={event.itinerary ?? []} />

      {(event.itinerary ?? []).length > 0 && <hr className="border-gray-200" />}

      <GearPreview shortId={shortId} items={gear ?? []} />

      <hr className="border-gray-200" />

      <DutyPreview shortId={shortId} duties={duties ?? []} />

      <hr className="border-gray-200" />

      <section aria-label="Share this event" className="space-y-2">
        <WhatsAppShare
          title={event.title}
          date={dateStr}
          location={event.location}
        />
        <div className="flex gap-2">
          <CopyLink />
          <ShareButton title={event.title} />
        </div>
      </section>

      <a href="/" className="text-blue-600 hover:underline text-sm inline-block">
        &larr; Back to events
      </a>
    </article>
  );
}
