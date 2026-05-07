# DMARC Rollout Runbook

Email auth posture for `auratech.cat`. Goal: end at `p=quarantine pct=100`
once we have 2–3 weeks of clean aggregate reports.

## Current state (Setmana 4)

DKIM and SPF are configured and aligned (Resend signs `auratech.cat` mail).
DMARC was previously published as `p=none` with no `rua=`, so legitimate
delivery failures were invisible. This change adds `rua=` so we collect
aggregate reports during the soft-rollout period.

## Step 1 — Mailbox (Microsoft 365)

Create a shared mailbox (or alias to Oscar's inbox):

```
dmarc@auratech.cat
```

Reports are XML, ~5–50KB each, one per reporting domain per day. A shared
mailbox keeps the noise out of operational inboxes; an alias is fine if we
prefer everything in one place.

## Step 2 — Update TXT record at OVH

Edit the existing TXT for `_dmarc.auratech.cat`:

```
Before: v=DMARC1; p=none; sp=none; adkim=s; aspf=s
After:  v=DMARC1; p=none; sp=none; adkim=s; aspf=s; rua=mailto:dmarc@auratech.cat; ruf=mailto:dmarc@auratech.cat; fo=1
```

Tags:
- `rua` — aggregate reports (the useful ones).
- `ruf` — forensic reports per failure. Many providers won't send these
  for privacy reasons, but harmless to request.
- `fo=1` — generate a report on any auth failure (DKIM *or* SPF), not
  only when both fail.

TTL: 3600 is fine. DNS propagation is irrelevant for receivers — they cache
the DMARC record per their own policy.

## Step 3 — Watch for 2–3 weeks

Reports arrive daily from Google, Microsoft, Yahoo, etc. We're looking for:

- **All passing aligned**: SPF or DKIM aligned for every legitimate sender.
- **Forwarders failing SPF**: expected; DKIM should still align.
- **Unknown sources sending as us**: spoofing — investigate before raising
  the policy bar.

If the reports look clean for 2–3 weeks, proceed to Step 4. Otherwise fix
the misalignment first (usually a forgotten subdomain or a marketing tool
sending without DKIM).

## Step 4 — Raise policy

Phased ramp:

```
v=DMARC1; p=quarantine; pct=25; sp=quarantine; ...   (week +0)
v=DMARC1; p=quarantine; pct=100; sp=quarantine; ...  (week +2 if clean)
v=DMARC1; p=reject; pct=100; sp=reject; ...           (week +6 if clean)
```

Don't skip stages. `p=reject` straight from `p=none` is how legitimate
mail gets bounced silently.

## What we DON'T do

- No third-party DMARC processor (Postmark, dmarcian, EasyDMARC). Volume
  is low enough that a human can skim XML weekly. Revisit if we ever send
  >10k mail/month.
- No SPF flattening. `auratech.cat` SPF is short and stable.
