"use client";

import { useParams } from "next/navigation";
import { AuthGuard } from "@/components/auth/auth-guard";

function RSVPForm({ shortId }: { shortId: string }) {
  return (
    <section aria-labelledby="rsvp-heading">
      <h1 id="rsvp-heading" className="text-2xl font-bold mb-4">
        RSVP
      </h1>
      <p className="text-gray-600 mb-4">
        RSVP form will be implemented in WO#4.
      </p>
      <div className="space-y-3">
        <button
          type="button"
          disabled
          className="w-full rounded-md bg-green-600 text-white py-2.5 px-4 text-sm font-medium disabled:opacity-50"
        >
          Going
        </button>
        <button
          type="button"
          disabled
          className="w-full rounded-md border border-gray-300 text-gray-700 py-2.5 px-4 text-sm font-medium disabled:opacity-50"
        >
          Maybe
        </button>
        <button
          type="button"
          disabled
          className="w-full rounded-md border border-gray-300 text-gray-700 py-2.5 px-4 text-sm font-medium disabled:opacity-50"
        >
          Not Going
        </button>
      </div>
      <a
        href={`/e/${shortId}`}
        className="text-blue-600 hover:underline text-sm mt-6 inline-block"
      >
        &larr; Back to event
      </a>
    </section>
  );
}

export default function RSVPPage() {
  const params = useParams<{ shortId: string }>();

  return (
    <AuthGuard>
      <RSVPForm shortId={params.shortId} />
    </AuthGuard>
  );
}
