import type { Event } from "@/lib/types/database";
import { formatEventDate } from "@/lib/date-utils";

interface EventHeaderProps {
  event: Pick<Event, "title" | "description" | "location" | "starts_at" | "ends_at">;
}

export function EventHeader({ event }: EventHeaderProps) {
  const dateStr = formatEventDate(event.starts_at, event.ends_at);

  return (
    <div className="space-y-2">
      <h1 id="event-heading" className="text-2xl font-bold">
        {event.title}
      </h1>
      <p className="text-gray-700 text-sm">{dateStr}</p>
      {event.location && (
        <p className="text-gray-700 text-sm">{event.location}</p>
      )}
      {event.description && (
        <p className="text-gray-600 mt-3">{event.description}</p>
      )}
    </div>
  );
}
