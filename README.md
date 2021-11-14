# Purdue Hackers RSVP Service

A simple service for RSVPing to Purdue Hackers events.

## How it works
Organizers add event details to an Airtable base. All upcoming events are displayed on the homepage.

Every time a new event is added to Airtable, a page is automatically generated for that event, filling in the name, date/time, and description, along with a link to add it to your calendar and an email form. An email is automatically sent to everyone who RSVPed a day before the event.

This is still a work-in-progress! I'm using it as an opportunity to learn how to use Tailwind & familiarize myself a little bit with TypeScript.