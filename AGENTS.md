<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

This is a front-end challenge called “Conflict-Aware Scheduler.” You will build a small single-page app that lets a user schedule sessions (such as interviews, appointments, or room bookings) into a day view, with conflict detection as the core feature. There are two deliverables:

    A working app, which should:

        Display a day’s schedule as a timeline or list

        Let the user add, edit, and delete sessions (title, start time, duration)

        Detect and clearly communicate overlapping sessions, and make them easy to resolve

        Handle the awkward cases gracefully: invalid input, back-to-back sessions, sessions crossing midnight, an empty schedule, and a very crowded one

        Include ONE extension of your choice: timezone support, drag-and-drop, persistence with undo/redo, an accessibility deep-dive, or something else that shows your strengths (tell us why you chose it)

    A short README.md covering the product and technical decisions you made and why, what you deliberately left out to fit the time box, one thing you are proud of and one thing you would redo, and where and how you used AI assistance.

 

There is deliberately no provided design or detailed spec. Make the product decisions you think are right, and be prepared to defend them.

Adding a session should be done via a dedicated button and modal.
The session timeline should include all 5 days of the week, with a toggle to display the weekend, and the current day highlighted.
The "weekend" toggle should be highlighted if there is an existing session for the upcoming weekend.
Previous and Next buttons, as well as a mini calendar, should be included as well, in order to jump to a specific date. The mini calendar should also highlight days with existing sessions.
The timeline should display sessions in a clear, visual manner, indicating their start time and duration.
Overlapping sessions should be visually distinct and clearly indicate the conflict. The user should be able to resolve conflicts by editing or deleting sessions.

The timeline should also include a visual indicator for the current time.
The timeline should be scrollable, allowing the user to view sessions outside the current visible range.
The timeline should allow for drag-and-drop rescheduling of sessions.
The timeline should allow for resizing of sessions to change their duration.
