import { useEffect, useState } from "react";
import { StarIcon2 } from "./icons/Icons";

interface RsvpProps {
  eventId: string;
  eventName: string;
  start: string;
  gcalUrl: string;
  icsUrl: string;
  icsName: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// No accounts by design — the browser remembers instead (Luma-style returning
// guest, minus the login). Profile prefills future forms; per-event records
// keep the "you're going" state and the cancel credential.
const PROFILE_KEY = "ph-rsvp-profile";
const RSVPS_KEY = "ph-rsvps";

interface Profile {
  email: string;
  name?: string;
}
interface StoredRsvp {
  at: string;
  cancelToken?: string;
}

function readJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

function writeJson(key: string, value: unknown) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // storage unavailable — the site still works, it just won't remember
  }
}

function readStoredRsvp(eventId: string): StoredRsvp | null {
  return readJson<Record<string, StoredRsvp>>(RSVPS_KEY)?.[eventId] ?? null;
}

function writeStoredRsvp(eventId: string, value: StoredRsvp | null) {
  const all = readJson<Record<string, StoredRsvp>>(RSVPS_KEY) ?? {};
  if (value) {
    all[eventId] = value;
  } else {
    delete all[eventId];
  }
  writeJson(RSVPS_KEY, all);
}

function startsInLabel(startIso: string): string | null {
  const ms = new Date(startIso).getTime() - Date.now();
  if (Number.isNaN(ms)) return null;
  if (ms <= 0) return "happening now";
  const totalMinutes = Math.floor(ms / 60000);
  const days = Math.floor(totalMinutes / 1440);
  const hours = Math.floor((totalMinutes % 1440) / 60);
  const minutes = totalMinutes % 60;
  if (days > 0) return `starts in ${days}d ${hours}h`;
  if (hours > 0) return `starts in ${hours}h ${minutes}m`;
  return `starts in ${minutes}m`;
}

const GHOST_BUTTON =
  "inline-flex items-center gap-1.5 font-pixel uppercase text-sm border-1 border-white/30 hover:border-white px-3 py-2 transition-[border-color,transform] duration-150 ease-snappy active:scale-[0.97] focus-visible:outline-yellow";

export default function Rsvp({ eventId, eventName, start, gcalUrl, icsUrl, icsName }: RsvpProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [going, setGoing] = useState<StoredRsvp | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [count, setCount] = useState<number | null>(null);
  // Branch swaps animate only when the user caused them. The hydration swap
  // (SSR form → remembered state) happens on every visit and stays instant.
  const [animateSwap, setAnimateSwap] = useState(false);

  useEffect(() => {
    const savedProfile = readJson<Profile>(PROFILE_KEY);
    if (savedProfile?.email) {
      setProfile(savedProfile);
      setEmail(savedProfile.email);
      setName(savedProfile.name ?? "");
    }
    setGoing(readStoredRsvp(eventId));
  }, [eventId]);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/rsvps/count?event=${encodeURIComponent(eventId)}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((data) => {
        if (!cancelled && data && typeof data.count === "number") {
          setCount(data.count);
        }
      })
      .catch(() => {});
    return () => {
      cancelled = true;
    };
  }, [eventId]);

  const submitRsvp = async (submitEmail: string, submitName: string) => {
    if (!EMAIL_PATTERN.test(submitEmail.trim())) {
      setMessage("Please input a valid email.");
      return;
    }

    setIsBusy(true);
    setMessage("");

    try {
      const response = await fetch("/api/rsvps", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: submitEmail.trim(),
          name: submitName.trim() || undefined,
          event: eventId,
        }),
      });

      const savedProfile: Profile = { email: submitEmail.trim(), name: submitName.trim() || undefined };

      if (response.ok) {
        let cancelToken: string | undefined;
        try {
          const data = await response.json();
          if (typeof data?.doc?.cancelToken === "string") cancelToken = data.doc.cancelToken;
        } catch {
          // body shape is best-effort; the RSVP itself succeeded
        }
        const record: StoredRsvp = { at: new Date().toISOString(), cancelToken };
        writeJson(PROFILE_KEY, savedProfile);
        writeStoredRsvp(eventId, record);
        setProfile(savedProfile);
        setGoing(record);
        setShowForm(false);
        setMessage("");
        setCount((prev) => (prev ?? 0) + 1);
        setAnimateSwap(true);
      } else {
        // The CMS throws user-ready messages (e.g. the duplicate-RSVP error)
        let errorText = "";
        try {
          const errorData = await response.json();
          // Payload REST errors: { errors: [{ message }] }; proxies: { error }
          const errMessage = errorData.error ?? errorData.errors?.[0]?.message;
          if (typeof errMessage === "string") errorText = errMessage;
        } catch {
          // non-JSON error body
        }
        if (/already on the list/i.test(errorText)) {
          // The server knows them even though this browser didn't — remember it
          const record: StoredRsvp = { at: new Date().toISOString() };
          writeJson(PROFILE_KEY, savedProfile);
          writeStoredRsvp(eventId, record);
          setProfile(savedProfile);
          setGoing(record);
          setShowForm(false);
          setMessage("");
          setAnimateSwap(true);
        } else {
          setMessage(errorText || "An error occurred. Please try again.");
        }
      }
    } catch {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsBusy(false);
    }
  };

  const cancelRsvp = async () => {
    if (!going?.cancelToken) return;
    setIsBusy(true);
    setMessage("");
    try {
      const res = await fetch("/api/rsvps/cancel", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token: going.cancelToken }),
      });
      if (!res.ok) throw new Error();
      writeStoredRsvp(eventId, null);
      setGoing(null);
      setCount((prev) => (prev !== null && prev > 0 ? prev - 1 : prev));
      setMessage("You're off the list. Change of plans again? RSVP below.");
      setAnimateSwap(true);
    } catch {
      setMessage("Couldn't cancel — try again in a minute.");
    } finally {
      setIsBusy(false);
    }
  };

  const inviteFriend = async () => {
    const url = window.location.origin + window.location.pathname;
    try {
      if (navigator.share) {
        await navigator.share({ title: eventName, url });
      } else {
        await navigator.clipboard.writeText(url);
        setMessage("Event link copied — send it to a friend!");
      }
    } catch {
      // share sheet dismissed
    }
  };

  const swapClass = animateSwap ? "fade-in-up" : "";
  const reveal = (step: number) =>
    animateSwap ? { animationDelay: `${step * 40}ms` } : undefined;

  const statusMessage = (align: string) =>
    message ? (
      <p key={message} role="status" className={`fade-in-up font-sans text-sm mt-3 ${align}`}>
        {message}
      </p>
    ) : null;

  // Height is reserved before the count arrives so nothing below jumps
  const countLine = (
    <p className="font-pixel uppercase text-sm text-center text-yellow mb-4 sm:mb-6 min-h-5">
      {count === null ? " " : count > 0 ? `▸ ${count} going` : "▸ Be the first to RSVP"}
    </p>
  );

  const askHeading = (
    <div className="font-pixel flex items-center justify-center gap-4 text-white text-xl text-center mt-2 sm:mt-0 mb-4 sm:mb-6">
      <StarIcon2 className="w-4 h-4 animate-idle-icon text-purple-400" />
      <span className="text-balance">Want to come? RSVP below!</span>
      <StarIcon2 className="w-4 h-4 animate-idle-icon text-purple-400" />
    </div>
  );

  let content;
  if (going) {
    // After the yes, the panel's job flips from asking to anticipation:
    // countdown, next actions, and cancelling demoted to quiet prose.
    const countdown = startsInLabel(start);
    content = (
      <div>
        <div
          className={`flex flex-wrap items-center justify-between gap-3 ${swapClass}`}
          style={reveal(0)}
        >
          <div className="font-pixel flex items-center gap-3 text-2xl">
            <StarIcon2 className="w-4 h-4 animate-idle-icon text-yellow" />
            <span>You&apos;re in</span>
          </div>
          {countdown && (
            <span className="font-pixel uppercase text-xs text-yellow border-1 border-yellow/40 px-2 py-1 whitespace-nowrap">
              ▸ {countdown}
            </span>
          )}
        </div>
        <p
          className={`mt-2 font-subtext text-sm text-white/70 [overflow-wrap:anywhere] ${swapClass}`}
          style={reveal(1)}
        >
          {profile?.email ? `RSVP'd as ${profile.email}` : "You're on the list"}
          {count !== null ? ` · ${count} going` : ""}
        </p>
        <div className={`mt-5 flex flex-wrap gap-2 ${swapClass}`} style={reveal(2)}>
          <a href={gcalUrl} target="_blank" rel="noreferrer" className={GHOST_BUTTON}>
            + Google Calendar
          </a>
          <a href={icsUrl} download={icsName} className={GHOST_BUTTON}>
            ↓ .ics
          </a>
          <button type="button" onClick={inviteFriend} className={GHOST_BUTTON}>
            ↗ Invite a friend
          </button>
        </div>
        <p
          className={`mt-5 font-subtext text-sm text-white/60 ${swapClass}`}
          style={reveal(3)}
        >
          Can&apos;t make it anymore?{" "}
          {going.cancelToken ? (
            <>
              <button
                type="button"
                onClick={cancelRsvp}
                disabled={isBusy}
                className="cursor-pointer underline underline-offset-4 hover:text-white transition-colors duration-150 disabled:opacity-60 focus-visible:outline-yellow"
              >
                {isBusy ? "Cancelling..." : "Cancel your RSVP"}
              </button>
              .
            </>
          ) : (
            <>Use the cancel link in your confirmation email.</>
          )}
        </p>
        {statusMessage("text-left")}
      </div>
    );
  } else if (profile && !showForm) {
    // Returning guest, not yet going: one click does it
    content = (
      <div className={swapClass}>
        {askHeading}
        {countLine}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => submitRsvp(profile.email, profile.name ?? "")}
            disabled={isBusy}
            className="cursor-pointer w-full text-white bg-purple-700 dark:bg-black font-pixel font-bold py-2 px-4 [overflow-wrap:anywhere] disabled:opacity-85 focus-visible:outline-yellow"
          >
            {isBusy ? "Submitting..." : `RSVP as ${profile.email}`}
          </button>
          <button
            type="button"
            onClick={() => {
              setShowForm(true);
              setAnimateSwap(true);
            }}
            className="cursor-pointer font-subtext text-xs text-white/70 hover:text-white transition-colors duration-150 text-center focus-visible:outline-yellow"
          >
            not you? use a different email →
          </button>
        </div>
        {statusMessage("text-center")}
      </div>
    );
  } else {
    content = (
      <div className={swapClass}>
        {askHeading}
        {countLine}
        <form
          onSubmit={(e) => {
            e.preventDefault();
            void submitRsvp(email, name);
          }}
          className="w-full max-w-full flex flex-col gap-3"
        >
          <div className="w-full max-w-full flex flex-col gap-2 md:flex-row md:gap-4">
            <div className="w-full min-w-0 flex flex-col gap-1 md:flex-1">
              <label className="font-subtext text-sm uppercase tracking-widest">
                Email *
              </label>
              <input
                type="email"
                placeholder="wack@hacker.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full min-w-0 bg-zinc-900 dark:bg-transparent text-white border-1 border-zinc-700 dark:border-white dark:border-2 p-2 focus-visible:outline-yellow"
              />
            </div>
            <div className="w-full min-w-0 flex flex-col gap-1 md:flex-1">
              <label className="font-subtext text-sm uppercase tracking-widest">
                Name / Title
              </label>
              <input
                type="text"
                placeholder="Lord Wamuu"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full min-w-0 bg-zinc-900 dark:bg-transparent text-white border-1 border-zinc-700 dark:border-white dark:border-2 p-2 focus-visible:outline-yellow"
              />
            </div>
          </div>
          <button
            type="submit"
            disabled={isBusy}
            className="cursor-pointer text-white bg-purple-700 dark:bg-black font-pixel font-bold mt-2 py-2 px-4 disabled:opacity-85 focus-visible:outline-yellow"
          >
            {isBusy ? "Submitting..." : "RSVP"}
          </button>
          {statusMessage("text-center")}
        </form>
      </div>
    );
  }

  return (
    <div className="w-full bg-black dark:bg-purple-700 text-white border-1 border-white dark:border-black p-6 sm:p-10 sm:px-12">
      {content}
    </div>
  );
}
