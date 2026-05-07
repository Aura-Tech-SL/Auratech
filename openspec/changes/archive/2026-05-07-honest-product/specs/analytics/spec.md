## ADDED Requirements

### Requirement: Conversion event tracking

The website SHALL emit Google Analytics 4 events for the three primary
conversion signals:

| Event name | Trigger | Custom params |
|---|---|---|
| `contact_form_submit` | `POST /api/contacte` returns 201 | _(none)_ |
| `cta_click` | User clicks any tracked CTA button | `cta_id` (string), `location` (string, optional) |
| `whatsapp_click` | User clicks any WhatsApp link | `location` (string, optional) |

The events SHALL be emitted only when the user has accepted analytics
cookies (i.e. when `window.gtag` is defined). When consent is denied or
the analytics script hasn't loaded, the helper SHALL silently no-op and
NOT throw or log to the console.

The helpers SHALL live in `src/lib/analytics/track.ts` and be imported
by the components that fire them, so the gtag detail is centralised.

#### Scenario: Form submit emits event

- **WHEN** a visitor with analytics consent submits the contact form
- **AND** the API returns 201
- **THEN** `gtag("event", "contact_form_submit", {})` SHALL be called

#### Scenario: WhatsApp click emits event

- **WHEN** a visitor with analytics consent clicks the WhatsApp button in
  the header
- **THEN** `gtag("event", "whatsapp_click", { location: "header" })` SHALL
  be called

#### Scenario: Without consent, helpers are silent

- **WHEN** a visitor has rejected analytics consent and clicks a CTA
- **THEN** the helper SHALL detect that `window.gtag` is undefined and
  return without action
- **AND** no error SHALL appear in the browser console
