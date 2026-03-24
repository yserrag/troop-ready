import { createSupabaseServiceClient } from "@/lib/supabase/server";

const CATEGORY_LABELS: Record<string, string> = {
  general: "General",
  cooking: "Cooking",
  shelter: "Shelter",
  safety: "Safety",
  personal: "Personal",
  activity: "Activity",
};

const CATEGORY_ORDER = ["general", "cooking", "shelter", "safety", "personal", "activity"];

export default async function GearListPage({
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

  const { data: gear } = await supabase
    .from("gear_items")
    .select("id, item_name, quantity, category, is_shared, sort_order")
    .eq("event_id", event.id)
    .order("sort_order");

  const items = gear ?? [];

  // Group by category
  const grouped: Record<string, typeof items> = {};
  for (const item of items) {
    const cat = item.category || "general";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  return (
    <section aria-labelledby="gear-heading">
      <h1 id="gear-heading" className="text-2xl font-bold mb-1">
        Gear List
      </h1>
      <p className="text-sm text-gray-500 mb-4">{event.title}</p>

      {items.length === 0 ? (
        <p className="text-gray-600">No gear list yet for this event.</p>
      ) : (
        <div className="space-y-6">
          {CATEGORY_ORDER.filter((cat) => grouped[cat]).map((cat) => (
            <div key={cat}>
              <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wide mb-2">
                {CATEGORY_LABELS[cat]}
              </h2>
              <ul className="space-y-1">
                {grouped[cat].map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center gap-2 text-sm text-gray-700 py-1"
                  >
                    <span>{item.item_name}</span>
                    {item.quantity > 1 && (
                      <span className="text-gray-400">×{item.quantity}</span>
                    )}
                    {item.is_shared && (
                      <span className="text-xs bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">
                        shared
                      </span>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
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
