import { useState, useEffect } from 'react';

const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone: "America/Indianapolis",
    month: 'short',
    day: 'numeric',
    hour: "2-digit",
    minute: "2-digit",
    timeZoneName: "short"
});

export default function Clock() {
    const [time, setTime] = useState(formatter.format(new Date()));

    useEffect(() => {
        const timer = setInterval(() => {
            setTime(formatter.format(new Date()));
        }, 1000);

        return () => clearInterval(timer); 
    }, []);

    return <span>{time}</span>;
}