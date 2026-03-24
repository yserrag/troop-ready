import { NextResponse } from "next/server";
import { createSupabaseServiceClient } from "@/lib/supabase/server";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ shortId: string }> }
) {
  const { shortId } = await params;
  const supabase = createSupabaseServiceClient();

  // Fetch event by short_id
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(
      "id, short_id, title, description, location, starts_at, ends_at, itinerary, status"
    )
    .eq("short_id", shortId)
    .eq("status", "published")
    .single();

  if (eventError || !event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  // Fetch gear items (no personal data)
  const { data: gear } = await supabase
    .from("gear_items")
    .select("id, item_name, quantity, category, is_shared, sort_order")
    .eq("event_id", event.id)
    .order("sort_order");

  // Fetch duties (no assigned_to user details — just public info)
  const { data: duties } = await supabase
    .from("duties")
    .select("id, title, description, time_slot, sort_order")
    .eq("event_id", event.id)
    .order("sort_order");

  // RSVP summary — counts only, no personal data
  const { data: rsvps } = await supabase
    .from("rsvps")
    .select("status, head_count")
    .eq("event_id", event.id);

  const rsvpSummary = {
    going: 0,
    maybe: 0,
    not_going: 0,
    total_headcount: 0,
  };

  if (rsvps) {
    for (const r of rsvps) {
      if (r.status === "going") {
        rsvpSummary.going++;
        rsvpSummary.total_headcount += r.head_count;
      } else if (r.status === "maybe") {
        rsvpSummary.maybe++;
        rsvpSummary.total_headcount += r.head_count;
      } else if (r.status === "not_going") {
        rsvpSummary.not_going++;
      }
    }
  }

  return NextResponse.json(
    {
      event,
      gear: gear ?? [],
      duties: duties ?? [],
      rsvp_summary: rsvpSummary,
    },
    {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300",
      },
    }
  );
}
