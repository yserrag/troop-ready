export default async function GearListPage({
  params,
}: {
  params: Promise<{ shortId: string }>;
}) {
  const { shortId } = await params;

  return (
    <section aria-labelledby="gear-heading">
      <h1 id="gear-heading" className="text-2xl font-bold mb-4">
        Gear List
      </h1>
      <p className="text-gray-600">Gear list for this event will appear here.</p>
      <a href={`/e/${shortId}`} className="text-blue-600 hover:underline text-sm mt-4 inline-block">
        &larr; Back to event
      </a>
    </section>
  );
}
