interface RSVPSummaryProps {
  shortId: string;
  going: number;
  maybe: number;
}

export function RSVPSummary({ shortId, going, maybe }: RSVPSummaryProps) {
  return (
    <div className="space-y-2">
      <a
        href={`/e/${shortId}/rsvp`}
        className="block w-full rounded-md bg-[#1a2744] text-white py-3 px-4 text-center font-medium hover:bg-[#2a3754] focus:outline-none focus:ring-2 focus:ring-[#1a2744] focus:ring-offset-2"
      >
        RSVP — I&apos;m Going
      </a>
      <p className="text-sm text-gray-600 text-center">
        {going} going{maybe > 0 ? ` · ${maybe} maybe` : ""}
      </p>
    </div>
  );
}
