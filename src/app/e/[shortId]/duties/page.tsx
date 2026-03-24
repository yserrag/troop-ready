export default async function DutyRosterPage({
  params,
}: {
  params: Promise<{ shortId: string }>;
}) {
  const { shortId } = await params;

  return (
    <section aria-labelledby="duties-heading">
      <h1 id="duties-heading" className="text-2xl font-bold mb-4">
        Duty Roster
      </h1>
      <p className="text-gray-600">Duty assignments for this event will appear here.</p>
      <a href={`/e/${shortId}`} className="text-blue-600 hover:underline text-sm mt-4 inline-block">
        &larr; Back to event
      </a>
    </section>
  );
}
