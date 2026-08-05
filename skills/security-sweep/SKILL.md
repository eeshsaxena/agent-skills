---
name: security-sweep
description: Catch the common, high-impact security mistakes before they ship. Use when reviewing code that handles input, auth, secrets, queries, or file paths.
---

# Security Sweep

Most breaches come from a short list of boring mistakes, not exotic exploits.
Sweep for these every time code touches untrusted input or sensitive data.

## The checklist

1. **Injection.** Are queries parameterized? No string-built SQL, shell, or
   template. Never pass user input into `eval`, `exec`, `child_process`, or a
   raw query. Use prepared statements and safe APIs.
2. **Secrets.** No API keys, tokens, or passwords in source, logs, or error
   messages. They belong in environment variables or a secrets manager. Grep the
   diff for likely secrets before committing.
3. **AuthZ, not just authN.** Logging in is not enough. Every sensitive action
   must check that *this* user may act on *this* resource. Watch for IDs taken
   straight from the request and trusted without an ownership check.
4. **Input validation at the boundary.** Validate type, length, range, and
   format on all external input. Allowlist over denylist. Treat everything from
   the client as hostile, including headers and cookies.
5. **Output encoding.** Escape data for the context it lands in: HTML, attribute,
   URL, JS. This is what stops XSS. Prefer framework auto-escaping and never
   dangerouslySetInnerHTML with user data.
6. **Path and file handling.** Reject `..` and absolute paths in user-supplied
   filenames. Resolve and confirm the final path stays inside the intended
   directory before reading or writing.
7. **Dependencies and crypto.** Do not roll your own crypto. Use vetted
   libraries and standard algorithms. Flag obviously outdated or unmaintained
   dependencies in the changed area.

## How to report findings

For each issue: name the file and line, state the concrete attack ("a user could
pass `../../etc/passwd` here"), and give the minimal fix. Rank by real impact.
Do not bury a critical auth bypass under style nits.

## Scope

This is a fast sweep for common classes, not a full audit. If the change is
security-critical (payments, auth core, crypto), say so and recommend a deeper
review.
