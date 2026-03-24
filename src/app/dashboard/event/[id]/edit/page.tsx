export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <section aria-labelledby="edit-event-heading">
      <h1 id="edit-event-heading" className="text-2xl font-bold mb-4">
        Edit Event
      </h1>
      <p className="text-gray-600">Edit form for event {id} will appear here.</p>
      <a href="/dashboard" className="text-blue-600 hover:underline text-sm mt-4 inline-block">
        &larr; Back to dashboard
      </a>
    </section>
  );
}
