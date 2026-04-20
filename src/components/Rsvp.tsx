import { useState } from "react";
import { StarIcon2 } from "./icons/Icons";

interface RsvpProps {
  eventId: string;
}

export default function Rsvp({ eventId }: RsvpProps) {
    const [email, setEmail] = useState("");
    const [name, setName] = useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [message, setMessage] = useState("");

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email.trim()) {
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
                setMessage("RSVP submitted! You should receive a confirmation email soon :)");
                setEmail("");
                setName("");
            } else {
                const errorData = await response.json();
                setMessage(errorData.error || "An error occurred. Please try again.");
                console.log(response)
                console.log(errorData)
            }
        } catch (error) {
            setMessage("An error occurred. Please try again.");
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="m-auto bg-black dark:bg-black rounded-sm text-white dark:text-white border-2 border-white dark:border-purple-400 p-4 sm:p-10 sm:px-12 mx-4 mt-4 sm:mx-0 sm:mt-0 mb-4">
            <p className="hidden text-yellow dark:text-purple-700 font-display uppercase text-sm mb-4">--rsvp--</p>
            <div className="flex items-center justify-center gap-4 text-white font-mono text-xl text-center mb-4">
                <StarIcon2 className="w-4 h-4 animate-idle-icon text-purple-400" />
                Want to come? RSVP below!
                <StarIcon2 className="w-4 h-4 animate-idle-icon text-purple-400" />
            </div>
            <form onSubmit={handleSubmit} className="flex flex-col gap-1">
                <label className="text-sm">Email *</label>
                <input
                    type="email"
                    placeholder="wack@hacker.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-zinc-900 dark:bg-zinc-900 text-white dark:text-white border-2 border-zinc-700 dark:border-zinc-700 p-2 rounded-xs"
                />
                <label className="text-sm">Name</label>
                <input
                    type="text"
                    placeholder="Lord Wamuu"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-zinc-900 dark:bg-zinc-900 text-white dark:text-white border-2 border-zinc-700 dark:border-zinc-700 p-2 rounded-xs"
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="cursor-pointer bg-yellow text-black font-bold mt-2 py-2 px-4 rounded-none disabled:opacity-85"
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