# SUR-5: Add appointment request form

**Linear:** https://linear.app/suresh-varma/issue/SUR-5/add-appointment-request-form · **Status:** Draft — awaiting Gate 1 approval

## Problem

Patients have to phone the clinic to ask for an appointment. They want to send the request online, at any time, and get a clear confirmation that it was received.

## Scope

- In:
  - A new page at `/appointments` with an appointment request form.
  - Fields: Full name (required), Email (required, valid format), Phone (optional), Preferred date (required, today or later), Reason for visit (required, max 500 characters).
  - A "Request appointment" submit button.
  - Client-side validation with an error message under each invalid field.
  - On a valid submit: show a confirmation message and clear the form. No network call.
  - Works on mobile (375px wide) and with the keyboard only.
- Out:
  - Saving requests to a database or calling any API.
  - Sending emails or SMS.
  - Login, patient accounts, or picking a time slot.

## Acceptance criteria

- **AC-1:** Given the form is empty, when the user presses "Request appointment", then an error appears under each required field (Full name, Email, Preferred date, Reason for visit), no error appears under Phone, and no confirmation is shown.
  - Messages: "Enter your full name", "Enter your email address", "Choose a preferred date", "Enter the reason for your visit".
- **AC-2:** Given the Email field contains text that is not a valid address (for example `jane@`), when the user submits, then "Enter a valid email address" appears under Email.
- **AC-3:** Given the Preferred date is before today (in the user's local time), when the user submits, then "Choose today or a future date" appears under Preferred date. Today's date is accepted.
- **AC-4:** Given all required fields are valid, when the user submits, then the message "Thanks, we'll contact you to confirm your appointment" is shown and every field is reset to empty.
- **AC-5:** The form is usable on mobile and with the keyboard only:
  - At 375px wide there is no horizontal scroll and every control is at least 44px tall.
  - Every control has a visible `<label>`; Tab moves through the fields in visual order; Enter in a text field submits; focus is always visible.
  - On a failed submit, focus moves to the first invalid field, and each error is linked to its field with `aria-describedby` and `aria-invalid="true"`.
  - On success, the confirmation is announced (`role="status"`) and receives focus.
- **AC-6 (supporting rule from the ticket):** Reason for visit accepts at most 500 characters. A live counter shows "N / 500". Over 500, "Keep the reason to 500 characters or fewer" is shown on submit.

## UI states

| State   | What the user sees                                                                                                                                                                                     |
| ------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| Empty   | Page heading "Request an appointment", short intro, empty form, enabled "Request appointment" button, counter "0 / 500".                                                                               |
| Loading | Not applicable: there is no backend, so submission is instant. The button is never shown in a busy state. (When a real API is added, a disabled "Sending…" button would be added in a later ticket.)   |
| Error   | A summary line at the top of the form ("Fix the highlighted fields to continue"), a red border and message under each invalid field, focus on the first invalid field. Values the user typed are kept. |
| Success | A green confirmation panel: "Thanks, we'll contact you to confirm your appointment". The form is cleared and ready for another request.                                                                |

## Design

Prototype: `/prototypes/sur-5.html` — a self-contained clickable page with a state switcher (Empty · Error · Success · Live). "Live" runs the real validation rules so reviewers can try the form.

- **Layout:** single centred column, max width 36rem, 16px side padding on mobile. Fields stack vertically, full width. The button is full width on mobile and auto width from 640px up.
- **Components:**
  - `AppointmentForm` (client component) — owns field state, validation and the success message.
  - `validateAppointment(values, today)` — a pure function that returns a map of field → error message. Kept separate so unit tests can cover the rules without rendering.
  - The page `src/app/appointments/page.tsx` is a Server Component that renders the heading and `<AppointmentForm />`.
- **Tokens:** uses `--background` and `--foreground` from `globals.css`, plus Tailwind's red-700 for errors and green-700/green-50 for success (both meet WCAG AA on white and on the dark background).
- **Test ids (keep in the real implementation):** `appointment-form`, `field-name`, `field-email`, `field-phone`, `field-date`, `field-reason`, `error-name`, `error-email`, `error-date`, `error-reason`, `reason-counter`, `submit-appointment`, `form-error-summary`, `appointment-success`.
- **Open design questions:**
  1. Should Phone have a format check when it is filled in? This spec does not validate it (the ticket only says optional).
  2. Should the success panel hide the form or stay above an empty form? This spec keeps the empty form visible below the message.

## Data and API

No API. Validation rules (client side only):

| Field            | Required | Rule                                                              | Error message                                                                |
| ---------------- | -------- | ----------------------------------------------------------------- | ---------------------------------------------------------------------------- |
| Full name        | Yes      | Not blank after trimming                                          | Enter your full name                                                         |
| Email            | Yes      | Not blank; matches `^[^\s@]+@[^\s@]+\.[^\s@]+$`                   | Enter your email address / Enter a valid email address                       |
| Phone            | No       | None                                                              | —                                                                            |
| Preferred date   | Yes      | Not blank; `>=` today in local time (`YYYY-MM-DD` string compare) | Choose a preferred date / Choose today or a future date                      |
| Reason for visit | Yes      | Not blank after trimming; at most 500 characters                  | Enter the reason for your visit / Keep the reason to 500 characters or fewer |

The date input also sets `min` to today, but validation does not rely on it (some browsers and keyboard entry allow typing past dates).

Submitted values are not stored, sent or logged anywhere. Tests use obviously fake fixtures (for example "Test Patient", `test.patient@example.com`).

## Risks and open questions

- **Time zones:** "today" uses the browser's local date. Tests must inject a fixed "today" into `validateAppointment` and use a fixed clock in Playwright, so they do not fail around midnight.
- **Patient data:** the reason for visit may contain health information. Nothing is persisted or logged in this ticket; a later backend ticket must handle storage and consent.
- **Native validation:** the form uses `noValidate` so the browser's own bubbles do not replace our messages.

## Test plan

| AC   | Test type                                                                                                              | File                                                                             |
| ---- | ---------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------- |
| AC-1 | unit + e2e                                                                                                             | `src/lib/validateAppointment.test.ts`, `e2e/sur-5.spec.ts`                       |
| AC-2 | unit + e2e                                                                                                             | `src/lib/validateAppointment.test.ts`, `e2e/sur-5.spec.ts`                       |
| AC-3 | unit (past, today, future with fixed today) + e2e                                                                      | `src/lib/validateAppointment.test.ts`, `e2e/sur-5.spec.ts`                       |
| AC-4 | component + e2e                                                                                                        | `src/components/AppointmentForm.test.tsx`, `e2e/sur-5.spec.ts`                   |
| AC-5 | component (labels, aria-invalid, focus on first error) + e2e (keyboard-only run, 375px viewport, no horizontal scroll) | `src/components/AppointmentForm.test.tsx`, `e2e/sur-5.spec.ts`                   |
| AC-6 | unit (500 vs 501 chars) + component (counter)                                                                          | `src/lib/validateAppointment.test.ts`, `src/components/AppointmentForm.test.tsx` |
