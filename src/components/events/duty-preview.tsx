interface DutyPreviewItem {
  id: string;
  title: string;
  time_slot: string | null;
}

interface DutyPreviewProps {
  shortId: string;
  duties: DutyPreviewItem[];
}

export function DutyPreview({ shortId, duties }: DutyPreviewProps) {
  return (
    <section aria-labelledby="duty-preview-heading">
      <div className="flex items-center justify-between mb-2">
        <h2 id="duty-preview-heading" className="text-lg font-semibold">
          Duty Roster ({duties.length} slots)
        </h2>
        {duties.length > 0 && (
          <a
            href={`/e/${shortId}/duties`}
            className="text-sm text-blue-600 hover:underline"
          >
            View all →
          </a>
        )}
      </div>
      {duties.length === 0 ? (
        <p className="text-sm text-gray-500">No duties assigned yet</p>
      ) : (
        <ul className="space-y-1">
          {duties.slice(0, 3).map((duty) => (
            <li key={duty.id} className="text-sm text-gray-700 flex items-center gap-2">
              <span>{duty.title}</span>
              {duty.time_slot && (
                <span className="text-gray-400">— {duty.time_slot}</span>
              )}
            </li>
          ))}
          {duties.length > 3 && (
            <li className="text-sm text-gray-400">
              +{duties.length - 3} more
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
