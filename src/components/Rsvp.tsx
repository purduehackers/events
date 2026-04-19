import { useState } from "react";

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
                setMessage("RSVP submitted!");
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
        <div className="bg-zinc-900 dark:bg-gray-300 rounded-sm text-white dark:text-black border-2 p-4 sm:p-6 mx-4 mt-4 sm:mx-0 sm:mt-0 mb-4">
            <p className="text-yellow dark:text-purple-700 font-display uppercase text-sm mb-4">--rsvp--</p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                <input
                    type="email"
                    placeholder="wack@hacker.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-amber-400 p-2 rounded-sm"
                />
                <input
                    type="text"
                    placeholder="Lord Wamuu"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="bg-white dark:bg-black text-black dark:text-white border-2 border-black dark:border-amber-400 p-2 rounded-sm"
                />
                <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-yellow text-black font-bold py-2 px-4 rounded-sm disabled:opacity-50"
                >
                    {isSubmitting ? "Submitting..." : "RSVP"}
                </button>
                {message && (
                    <p className="text-sm text-center">{message}</p>
                )}
            </form>
        </div>
    );
}