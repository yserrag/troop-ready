"use client";

import { useState } from "react";
import { createSupabaseBrowserClient } from "@/lib/supabase/client";
import { generateShortId } from "@/lib/nanoid";
import { useAuth } from "@/lib/hooks/use-auth";

interface ItineraryRow {
  time: string;
  activity: string;
  notes: string;
}

interface EventFormProps {
  mode: "create" | "edit";
  eventId?: string;
  initialData?: {
    title: string;
    description: string;
    location: string;
    starts_at: string;
    ends_at: string;
    itinerary: ItineraryRow[];
    short_id?: string;
    status?: string;
  };
}

function toDatetimeLocal(iso: string): string {
  if (!iso) return "";
  const d = new Date(iso);
  const pad = (n: number) => n.toString().padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function EventForm({ mode, eventId, initialData }: EventFormProps) {
  const { profile } = useAuth();

  const [title, setTitle] = useState(initialData?.title ?? "");
  const [description, setDescription] = useState(initialData?.description ?? "");
  const [location, setLocation] = useState(initialData?.location ?? "");
  const [startsAt, setStartsAt] = useState(
    initialData?.starts_at ? toDatetimeLocal(initialData.starts_at) : ""
  );
  const [endsAt, setEndsAt] = useState(
    initialData?.ends_at ? toDatetimeLocal(initialData.ends_at) : ""
  );
  const [itinerary, setItinerary] = useState<ItineraryRow[]>(
    initialData?.itinerary?.length
      ? initialData.itinerary
      : [{ time: "", activity: "", notes: "" }]
  );
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateItineraryRow(index: number, field: keyof ItineraryRow, value: string) {
    setItinerary((prev) =>
      prev.map((row, i) => (i === index ? { ...row, [field]: value } : row))
    );
  }

  function addItineraryRow() {
    setItinerary((prev) => [...prev, { time: "", activity: "", notes: "" }]);
  }

  function removeItineraryRow(index: number) {
    if (itinerary.length <= 1) return;
    setItinerary((prev) => prev.filter((_, i) => i !== index));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !startsAt) return;
    setError("");
    setIsSubmitting(true);

    try {
      const supabase = createSupabaseBrowserClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("Session expired. Please sign in again.");
        return;
      }

      // Filter out empty itinerary rows
      const cleanItinerary = itinerary
        .filter((row) => row.time.trim() || row.activity.trim())
        .map((row) => ({
          time: row.time.trim(),
          activity: row.activity.trim(),
          ...(row.notes.trim() ? { notes: row.notes.trim() } : {}),
        }));

      if (mode === "create") {
        const shortId = generateShortId();
        const { error: insertError } = await supabase.from("events").insert({
          short_id: shortId,
          title: title.trim(),
          description: description.trim() || null,
          location: location.trim() || null,
          starts_at: new Date(startsAt).toISOString(),
          ends_at: endsAt ? new Date(endsAt).toISOString() : null,
          itinerary: cleanItinerary,
          status: "published",
          created_by: user.id,
          unit_id: profile?.unit_id ?? "troop-17",
        });

        if (insertError) {
          setError(insertError.message);
          return;
        }

        window.location.href = `/e/${shortId}`;
      } else {
        const { error: updateError } = await supabase
          .from("events")
          .update({
            title: title.trim(),
            description: description.trim() || null,
            location: location.trim() || null,
            starts_at: new Date(startsAt).toISOString(),
            ends_at: endsAt ? new Date(endsAt).toISOString() : null,
            itinerary: cleanItinerary,
            updated_at: new Date().toISOString(),
          })
          .eq("id", eventId!);

        if (updateError) {
          setError(updateError.message);
          return;
        }

        window.location.href = `/e/${initialData?.short_id}`;
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCancel() {
    if (!confirm("Are you sure you want to cancel this event?")) return;
    setIsSubmitting(true);
    try {
      const supabase = createSupabaseBrowserClient();
      const { error: cancelError } = await supabase
        .from("events")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", eventId!);

      if (cancelError) {
        setError(cancelError.message);
        return;
      }
      window.location.href = "/dashboard";
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div role="alert" className="rounded-md bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div>
        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
          Title <span className="text-red-500">*</span>
        </label>
        <input
          id="title"
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          disabled={isSubmitting}
          placeholder="Spring Campout"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]"
        />
      </div>

      <div>
        <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
          Description
        </label>
        <textarea
          id="description"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          disabled={isSubmitting}
          placeholder="Details about the event..."
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]"
        />
      </div>

      <div>
        <label htmlFor="location" className="block text-sm font-medium text-gray-700 mb-1">
          Location
        </label>
        <input
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          disabled={isSubmitting}
          placeholder="Bear Creek State Park"
          className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]"
        />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label htmlFor="starts-at" className="block text-sm font-medium text-gray-700 mb-1">
            Start date & time <span className="text-red-500">*</span>
          </label>
          <input
            id="starts-at"
            type="datetime-local"
            required
            value={startsAt}
            onChange={(e) => setStartsAt(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]"
          />
        </div>
        <div>
          <label htmlFor="ends-at" className="block text-sm font-medium text-gray-700 mb-1">
            End date & time
          </label>
          <input
            id="ends-at"
            type="datetime-local"
            value={endsAt}
            onChange={(e) => setEndsAt(e.target.value)}
            disabled={isSubmitting}
            className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]"
          />
        </div>
      </div>

      {/* Itinerary builder */}
      <fieldset>
        <legend className="text-sm font-medium text-gray-700 mb-2">Itinerary</legend>
        <div className="space-y-2">
          {itinerary.map((row, i) => (
            <div key={i} className="flex gap-2 items-start">
              <input
                type="text"
                placeholder="Time"
                aria-label={`Itinerary item ${i + 1} time`}
                value={row.time}
                onChange={(e) => updateItineraryRow(i, "time", e.target.value)}
                disabled={isSubmitting}
                className="w-24 shrink-0 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]"
              />
              <input
                type="text"
                placeholder="Activity"
                aria-label={`Itinerary item ${i + 1} activity`}
                value={row.activity}
                onChange={(e) => updateItineraryRow(i, "activity", e.target.value)}
                disabled={isSubmitting}
                className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744]"
              />
              <input
                type="text"
                placeholder="Notes"
                aria-label={`Itinerary item ${i + 1} notes`}
                value={row.notes}
                onChange={(e) => updateItineraryRow(i, "notes", e.target.value)}
                disabled={isSubmitting}
                className="flex-1 rounded-md border border-gray-300 px-2 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#1a2744] hidden sm:block"
              />
              {itinerary.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeItineraryRow(i)}
                  disabled={isSubmitting}
                  aria-label={`Remove itinerary item ${i + 1}`}
                  className="text-red-500 hover:text-red-700 px-1 py-1.5 text-sm"
                >
                  Remove
                </button>
              )}
            </div>
          ))}
        </div>
        <button
          type="button"
          onClick={addItineraryRow}
          disabled={isSubmitting}
          className="mt-2 text-sm text-blue-600 hover:underline"
        >
          + Add item
        </button>
      </fieldset>

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={isSubmitting || !title.trim() || !startsAt}
          className="rounded-md bg-[#1a2744] text-white py-2.5 px-5 text-sm font-medium hover:bg-[#2a3754] focus:outline-none focus:ring-2 focus:ring-[#1a2744] focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting
            ? mode === "create"
              ? "Creating..."
              : "Saving..."
            : mode === "create"
              ? "Create Event"
              : "Save Changes"}
        </button>

        {mode === "edit" && initialData?.short_id && (
          <a
            href={`/e/${initialData.short_id}`}
            className="inline-flex items-center rounded-md border border-gray-300 text-gray-700 py-2.5 px-5 text-sm font-medium hover:bg-gray-50"
          >
            Cancel
          </a>
        )}
      </div>

      {mode === "edit" && initialData?.status !== "cancelled" && (
        <div className="border-t border-gray-200 pt-4 mt-4">
          <button
            type="button"
            onClick={handleCancel}
            disabled={isSubmitting}
            className="text-sm text-red-600 hover:text-red-800 font-medium"
          >
            Cancel this event
          </button>
        </div>
      )}
    </form>
  );
}
