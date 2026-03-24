import type { GearItem } from "@/lib/types/database";

interface GearPreviewProps {
  shortId: string;
  items: Pick<GearItem, "id" | "item_name" | "quantity" | "is_shared">[];
}

export function GearPreview({ shortId, items }: GearPreviewProps) {
  return (
    <section aria-labelledby="gear-preview-heading">
      <div className="flex items-center justify-between mb-2">
        <h2 id="gear-preview-heading" className="text-lg font-semibold">
          Gear List ({items.length} items)
        </h2>
        {items.length > 0 && (
          <a
            href={`/e/${shortId}/gear`}
            className="text-sm text-blue-600 hover:underline"
          >
            View all →
          </a>
        )}
      </div>
      {items.length === 0 ? (
        <p className="text-sm text-gray-500">No gear list yet</p>
      ) : (
        <ul className="space-y-1">
          {items.slice(0, 3).map((item) => (
            <li key={item.id} className="text-sm text-gray-700 flex items-center gap-2">
              <span>{item.item_name}</span>
              {item.quantity > 1 && (
                <span className="text-gray-400">×{item.quantity}</span>
              )}
              {item.is_shared && (
                <span className="text-xs bg-blue-100 text-blue-700 rounded px-1.5 py-0.5">
                  shared
                </span>
              )}
            </li>
          ))}
          {items.length > 3 && (
            <li className="text-sm text-gray-400">
              +{items.length - 3} more
            </li>
          )}
        </ul>
      )}
    </section>
  );
}
