export default async function EventPage({
  params,
}: {
  params: Promise<{ shortId: string }>;
}) {
  const { shortId } = await params;

  return (
    <section aria-labelledby="event-heading">
      <h1 id="event-heading" className="text-2xl font-bold mb-4">
        Event: {shortId}
      </h1>
      <nav aria-label="Event sections" className="flex gap-4 mb-4">
        <a href={`/e/${shortId}/gear`} className="text-blue-600 hover:underline">
          Gear List
        </a>
        <a href={`/e/${shortId}/duties`} className="text-blue-600 hover:underline">
          Duty Roster
        </a>
        <a href={`/e/${shortId}/rsvp`} className="text-blue-600 hover:underline">
          RSVP
        </a>
      </nav>
      <a href="/" className="text-blue-600 hover:underline text-sm">
        &larr; Back to events
      </a>
    </section>
  );
}
