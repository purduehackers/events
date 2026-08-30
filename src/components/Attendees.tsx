import { useEffect, useState } from "react";

interface AttendeesProps {
  eventId: string;
}

const CIRCLE_COLORS = [
  "var(--purple-500)",
  "var(--pink)",
  "var(--blue)",
  "var(--green)",
  "var(--amber)",
];

function circleColor(name: string) {
  let sum = 0;
  for (const ch of name) sum += ch.charCodeAt(0);
  return CIRCLE_COLORS[sum % CIRCLE_COLORS.length];
}

// Luma-style facepile for the event overview: initials of the latest guests
// in overlapping circles, plus the going count. The Rsvp island broadcasts
// its optimistic changes so the two stay in sync without sharing state.
export default function Attendees({ eventId }: AttendeesProps) {
  const [count, setCount] = useState<number | null>(null);
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/rsvps/count?event=${encodeURIComponent(eventId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (cancelled || !data || typeof data.count !== "number") return;
        setCount(data.count);
        if (Array.isArray(data.names)) {
          setNames(
            data.names.filter(
              (name: unknown): name is string =>
                typeof name === "string" && name.length > 0,
            ),
          );
        }
      })
      .catch(() => {});

    const onChange = (e: Event) => {
      const delta = (e as CustomEvent<{ delta?: number }>).detail?.delta ?? 0;
      setCount((prev) => (prev === null ? prev : Math.max(0, prev + delta)));
    };
    window.addEventListener("ph:rsvps-changed", onChange);
    return () => {
      cancelled = true;
      window.removeEventListener("ph:rsvps-changed", onChange);
    };
  }, [eventId]);

  return (
    <div className="min-h-7 flex items-center gap-3">
      {count !== null && (
        <>
          {count > 0 && names.length > 0 && (
            <div className="flex" aria-hidden="true">
              {names.slice(0, 3).map((name, i) => (
                <span
                  key={`${name}-${i}`}
                  className={`w-7 h-7 rounded-full flex items-center justify-center font-pixel uppercase text-xs text-black border-2 border-card-light dark:border-black ${i > 0 ? "-ml-2" : ""}`}
                  style={{ backgroundColor: circleColor(name) }}
                >
                  {name.trim()[0]}
                </span>
              ))}
            </div>
          )}
          <span className="text-[12px] 2xl:text-sm text-gray-500 dark:text-gray-400 font-subtext font-semibold">
            {count > 0 ? `${count} going` : "Be the first to RSVP"}
          </span>
        </>
      )}
    </div>
  );
}
