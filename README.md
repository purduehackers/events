# 🗓 Purdue Hackers Events

A website where you can check out all Purdue Hackers events & RSVP for upcoming events.

🛠 Built with Next.js, Tailwind, & TypeScript.

## How it works
Organizers add event details to an Airtable base. All upcoming events are displayed on the homepage.

Every time a new event is added to Airtable, a page is automatically generated for that event with all the data filled in, in addition to an email form that you can fill out to RSVP for the event. At 12pm the day before each event, an email is automatically sent to everyone who RSVPed reminding them of the event.

## Run locally
`git clone https://github.com/purduehackers/events.git`

Create a `.env` file and add the following values:

```
AIRTABLE_API_KEY
RESEND_API_KEY
EASYCRON_API_KEY
```

Ping `@matthew!!!` in the Purdue Hackers Discord if you need these values. If you're on the Vercel team, you can get them from the "Environment Variables" settings on the dashboard.

### Run locally bare-bones/without credentials

If you just want to run a version of the site where the events load, all you need is an `AIRTABLE_API_KEY`.

- `git clone https://github.com/purduehackers/events.git`
- Copy the [Airtable base](https://airtable.com/shrYbDwXQDyn1uIts) to your account
- Get your API key from `https://airtable.com/account`
- Create a `.env` file and add your API key as `AIRTABLE_API_KEY`

---

[![Powered by Vercel](public/powered-by-vercel.svg)](https://vercel.com?utm_source=purdue-hackers&utm_campaign=oss)
