export default function SettingsPage() {
  return (
    <section aria-labelledby="settings-heading">
      <h1 id="settings-heading" className="text-2xl font-bold mb-4">
        Settings
      </h1>
      <p className="text-gray-600">User profile and notification preferences will appear here.</p>
      <a href="/" className="text-blue-600 hover:underline text-sm mt-4 inline-block">
        &larr; Back to events
      </a>
    </section>
  );
}
