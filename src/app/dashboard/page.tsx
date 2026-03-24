export default function DashboardPage() {
  return (
    <section aria-labelledby="dashboard-heading">
      <h1 id="dashboard-heading" className="text-2xl font-bold mb-4">
        Leader Dashboard
      </h1>
      <nav aria-label="Dashboard actions" className="flex gap-4 mb-4">
        <a href="/dashboard/event/new" className="text-blue-600 hover:underline">
          Create Event
        </a>
      </nav>
      <p className="text-gray-600">Your events will appear here.</p>
      <a href="/" className="text-blue-600 hover:underline text-sm mt-4 inline-block">
        &larr; Back to events
      </a>
    </section>
  );
}
