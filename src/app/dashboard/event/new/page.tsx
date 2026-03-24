export default function CreateEventPage() {
  return (
    <section aria-labelledby="create-event-heading">
      <h1 id="create-event-heading" className="text-2xl font-bold mb-4">
        Create Event
      </h1>
      <p className="text-gray-600">Event creation form will appear here.</p>
      <a href="/dashboard" className="text-blue-600 hover:underline text-sm mt-4 inline-block">
        &larr; Back to dashboard
      </a>
    </section>
  );
}
