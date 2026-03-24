import type { ItineraryItem } from "@/lib/types/database";

interface ItinerarySectionProps {
  items: ItineraryItem[];
}

export function ItinerarySection({ items }: ItinerarySectionProps) {
  if (!items || items.length === 0) return null;

  return (
    <section aria-labelledby="itinerary-heading">
      <h2 id="itinerary-heading" className="text-lg font-semibold mb-3">
        Itinerary
      </h2>
      <dl className="space-y-2">
        {items.map((item, i) => (
          <div key={i} className="flex gap-3 text-sm">
            <dt className="font-medium text-gray-700 w-24 shrink-0">
              {item.time}
            </dt>
            <dd className="text-gray-600">
              {item.activity}
              {item.notes && (
                <span className="block text-gray-400 text-xs mt-0.5">
                  {item.notes}
                </span>
              )}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
