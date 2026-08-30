import { useEffect, useState } from "react";
import { StarIcon2 } from "./icons/Icons";

interface RsvpProps {
  eventId: string;
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

export default function Rsvp({ eventId }: RsvpProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [profile, setProfile] = useState<Profile | null>(null);
  const [going, setGoing] = useState<StoredRsvp | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [isBusy, setIsBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [count, setCount] = useState<number | null>(null);

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
    } catch {
      setMessage("Couldn't cancel — try again in a minute.");
    } finally {
      setIsBusy(false);
    }
  };

  const countLine =
    count !== null ? (
      <p className="font-pixel uppercase text-sm text-center text-yellow mb-4 sm:mb-6">
        {count > 0 ? `▸ ${count} going` : "▸ Be the first to RSVP"}
      </p>
    ) : null;

  const statusMessage = message && (
    <p key={message} className="fade-in-up font-sans text-sm text-center mt-2">
      {message}
    </p>
  );

  // Already going (this browser RSVP'd, or the server recognized the email)
  if (going) {
    return (
      <div className="w-full bg-black dark:bg-purple-700 text-white border-1 border-white dark:border-black p-6 sm:p-10 sm:px-12">
        <div className="font-pixel flex items-center justify-center gap-4 text-white text-xl text-center mt-2 sm:mt-0 mb-4 sm:mb-6">
          <StarIcon2 className="w-4 h-4 animate-idle-icon text-yellow" />
          <span className="text-balance">You&apos;re going!</span>
          <StarIcon2 className="w-4 h-4 animate-idle-icon text-yellow" />
        </div>
        {countLine}
        <p className="font-subtext text-sm text-center text-purple-400 dark:text-purple-200 mb-4">
          {profile?.email ? `RSVP'd as ${profile.email}` : "See your confirmation email for the details."}
        </p>
        <div className="flex flex-col items-center gap-2">
          {going.cancelToken ? (
            <button
              type="button"
              onClick={cancelRsvp}
              disabled={isBusy}
              className="cursor-pointer font-pixel uppercase text-sm text-white/80 hover:text-white underline underline-offset-4 disabled:opacity-60"
            >
              {isBusy ? "Cancelling..." : "Can't make it? Cancel RSVP"}
            </button>
          ) : (
            <p className="font-subtext text-xs text-center text-white/70">
              Can&apos;t make it? Use the cancel link in your confirmation email.
            </p>
          )}
        </div>
        {statusMessage}
      </div>
    );
  }

  // Returning guest, not yet going: one click does it
  if (profile && !showForm) {
    return (
      <div className="w-full bg-black dark:bg-purple-700 text-white border-1 border-white dark:border-black p-6 sm:p-10 sm:px-12">
        <div className="font-pixel flex items-center justify-center gap-4 text-white text-xl text-center mt-2 sm:mt-0 mb-4 sm:mb-6">
          <StarIcon2 className="w-4 h-4 animate-idle-icon text-purple-400" />
          <span className="text-balance">Want to come? RSVP below!</span>
          <StarIcon2 className="w-4 h-4 animate-idle-icon text-purple-400" />
        </div>
        {countLine}
        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={() => submitRsvp(profile.email, profile.name ?? "")}
            disabled={isBusy}
            className="cursor-pointer w-full text-white bg-purple-700 dark:bg-black font-pixel font-bold py-2 px-4 disabled:opacity-85"
          >
            {isBusy ? "Submitting..." : `RSVP as ${profile.email}`}
          </button>
          <button
            type="button"
            onClick={() => setShowForm(true)}
            className="cursor-pointer font-subtext text-xs text-white/70 hover:text-white text-center"
          >
            not you? use a different email →
          </button>
        </div>
        {statusMessage}
      </div>
    );
  }

  return (
    <div className="w-full bg-black dark:bg-purple-700 text-white border-1 border-white dark:border-black p-6 sm:p-10 sm:px-12">
      <div className="font-pixel flex items-center justify-center gap-4 text-white text-xl text-center mt-2 sm:mt-0 mb-4 sm:mb-6">
        <StarIcon2 className="w-4 h-4 animate-idle-icon text-purple-400" />
        <span className="text-balance">Want to come? RSVP below!</span>
        <StarIcon2 className="w-4 h-4 animate-idle-icon text-purple-400" />
      </div>
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
              className="w-full min-w-0 bg-zinc-900 dark:bg-transparent text-white border-1 border-zinc-700 dark:border-white dark:border-2 p-2"
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
              className="w-full min-w-0 bg-zinc-900 dark:bg-transparent text-white border-1 border-zinc-700 dark:border-white dark:border-2 p-2"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isBusy}
          className="cursor-pointer text-white bg-purple-700 dark:bg-black font-pixel font-bold mt-2 py-2 px-4 disabled:opacity-85"
        >
          {isBusy ? "Submitting..." : "RSVP"}
        </button>
        {statusMessage}
      </form>
    </div>
  );
}
