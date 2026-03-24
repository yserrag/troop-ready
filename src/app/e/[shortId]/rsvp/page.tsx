export default async function RSVPPage({
  params,
}: {
  params: Promise<{ shortId: string }>;
}) {
  const { shortId } = await params;

  return (
    <section aria-labelledby="rsvp-heading">
      <h1 id="rsvp-heading" className="text-2xl font-bold mb-4">
        RSVP
      </h1>
      <p className="text-gray-600">RSVP form will appear here.</p>
      <a href={`/e/${shortId}`} className="text-blue-600 hover:underline text-sm mt-4 inline-block">
        &larr; Back to event
      </a>
    </section>
  );
}
