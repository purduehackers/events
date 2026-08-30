import { useEffect, useState } from "react";
import { StarIcon2 } from "./icons/Icons";

interface RsvpProps {
  eventId: string;
}

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function Rsvp({ eventId }: RsvpProps) {
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [count, setCount] = useState<number | null>(null);

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!EMAIL_PATTERN.test(email.trim())) {
      setMessage("Please input a valid email.");
      return;
    }

    setIsSubmitting(true);
    setMessage("");

    try {
      const response = await fetch("/api/rsvps", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          name: name.trim() || undefined,
          event: eventId,
        }),
      });

      if (response.ok) {
        setMessage(
          "RSVP submitted! You should receive a confirmation email soon :)",
        );
        setEmail("");
        setName("");
        setCount((prev) => (prev ?? 0) + 1);
      } else {
        // The CMS throws user-ready messages (e.g. the duplicate-RSVP error)
        let errorText = "";
        try {
          const errorData = await response.json();
          // Payload REST errors: { errors: [{ message }] }; proxies: { error }
          const message = errorData.error ?? errorData.errors?.[0]?.message;
          if (typeof message === "string") errorText = message;
        } catch {
          // non-JSON error body
        }
        setMessage(errorText || "An error occurred. Please try again.");
      }
    } catch (error) {
      setMessage("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full md:w-full m-auto bg-black dark:bg-purple-700 text-white dark:text-white border-1 border-white dark:border-black p-8 sm:p-10 sm:px-12 mx-4 mt-4 sm:mx-0 sm:mt-0 mb-4">
      <p className="hidden text-yellow dark:text-purple-700 font-display uppercase text-sm mb-4">
        --rsvp--
      </p>
      <div className="font-pixel flex items-center justify-center gap-4 text-white font-mono text-xl text-center mt-2 sm:mt-0 mb-4 sm:mb-6">
        <StarIcon2 className="w-4 h-4 animate-idle-icon text-purple-400" />
        <span className="text-balance">Want to come? RSVP below!</span>
        <StarIcon2 className="w-4 h-4 animate-idle-icon text-purple-400" />
      </div>
      {count !== null && (
        <p className="font-pixel uppercase text-sm text-center text-yellow mb-4 sm:mb-6">
          {count > 0
            ? `▸ ${count} going`
            : "▸ Be the first to RSVP"}
        </p>
      )}
      <form
        onSubmit={handleSubmit}
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
              className="w-full min-w-0 bg-zinc-900 dark:bg-transparent text-white dark:text-white border-1 border-zinc-700 dark:border-white dark:border-2 p-2"
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
              className="w-full min-w-0 bg-zinc-900 dark:bg-transparent text-white dark:text-white border-1 border-zinc-700 dark:border-white dark:border-2 p-2"
            />
          </div>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="cursor-pointer text-white bg-purple-700 dark:bg-black font-pixel font-bold mt-2 py-2 px-4 disabled:opacity-85"
        >
          {isSubmitting ? "Submitting..." : "RSVP"}
        </button>
        {message && (
          <p className="font-sans text-sm text-center mt-2">{message}</p>
        )}
      </form>
    </div>
  );
}
