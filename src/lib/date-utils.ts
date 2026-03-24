export function formatEventDate(
  startsAt: string,
  endsAt: string | null
): string {
  const start = new Date(startsAt);

  const dateOpts: Intl.DateTimeFormatOptions = {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  };
  const timeOpts: Intl.DateTimeFormatOptions = {
    hour: "numeric",
    minute: "2-digit",
  };

  const datePart = start.toLocaleDateString("en-US", dateOpts);
  const startTime = start.toLocaleTimeString("en-US", timeOpts);

  if (endsAt) {
    const end = new Date(endsAt);
    const endTime = end.toLocaleTimeString("en-US", timeOpts);

    // Same day
    if (start.toDateString() === end.toDateString()) {
      return `${datePart} · ${startTime} — ${endTime}`;
    }

    // Multi-day
    const endDate = end.toLocaleDateString("en-US", dateOpts);
    return `${datePart} ${startTime} — ${endDate} ${endTime}`;
  }

  return `${datePart} · ${startTime}`;
}

export function formatShortDate(dateStr: string): string {
  const date = new Date(dateStr);
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}
