import { createSupabaseServiceClient } from "@/lib/supabase/server";

export default async function DutyRosterPage({
  params,
}: {
  params: Promise<{ shortId: string }>;
}) {
  const { shortId } = await params;
  const supabase = createSupabaseServiceClient();

  const { data: event } = await supabase
    .from("events")
    .select("id, title")
    .eq("short_id", shortId)
    .eq("status", "published")
    .single();

  if (!event) {
    return (
      <section className="text-center py-12">
        <h1 className="text-2xl font-bold mb-2">Event not found</h1>
        <a href="/" className="text-blue-600 hover:underline">&larr; Back to events</a>
      </section>
    );
  }

  const { data: duties } = await supabase
    .from("duties")
    .select("id, title, description, time_slot, assigned_to, sort_order")
    .eq("event_id", event.id)
    .order("sort_order");

  const items = duties ?? [];

  return (
    <section aria-labelledby="duties-heading">
      <h1 id="duties-heading" className="text-2xl font-bold mb-1">
        Duty Roster
      </h1>
      <p className="text-sm text-gray-500 mb-4">{event.title}</p>

      {items.length === 0 ? (
        <p className="text-gray-600">No duties assigned yet for this event.</p>
      ) : (
        <ul className="space-y-3">
          {items.map((duty) => (
            <li
              key={duty.id}
              className="border border-gray-200 rounded-md p-3"
            >
              <div className="flex items-center justify-between">
                <h2 className="font-medium text-sm">{duty.title}</h2>
                <span
                  className={`text-xs rounded px-1.5 py-0.5 ${
                    duty.assigned_to
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}
                >
                  {duty.assigned_to ? "Filled" : "Open"}
                </span>
              </div>
              {duty.time_slot && (
                <p className="text-xs text-gray-500 mt-1">{duty.time_slot}</p>
              )}
              {duty.description && (
                <p className="text-sm text-gray-600 mt-1">{duty.description}</p>
              )}
            </li>
          ))}
        </ul>
      )}

      <a
        href={`/e/${shortId}`}
        className="text-blue-600 hover:underline text-sm mt-6 inline-block"
      >
        &larr; Back to event
      </a>
    </section>
  );
}
