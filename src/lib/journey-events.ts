import type { SiteContent } from "./site-content";

export function journeyEvents(events: SiteContent["events"], year: string, today: string) {
  return events
    .filter((event) => {
      if (!/^\d{4}-\d{2}-\d{2}$/.test(event.dateLabel)) return false;
      const date = new Date(event.dateLabel);
      return (
        Number.isFinite(date.getTime()) &&
        date.toISOString().slice(0, 10) === event.dateLabel &&
        event.dateLabel.startsWith(`${year}-`) &&
        event.dateLabel < today
      );
    })
    .sort((a, b) => b.dateLabel.localeCompare(a.dateLabel));
}

export function journeyWindow<T>(events: T[], active: number) {
  if (events.length < 3) return events.map((event, index) => ({ event, index }));
  return [-1, 0, 1].map((offset) => {
    const index = (active + offset + events.length) % events.length;
    return { event: events[index]!, index };
  });
}
