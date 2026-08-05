---
name: debug-scientifically
description: Fix bugs by forming and testing hypotheses instead of guessing. Use when a test fails, a stack trace appears, or behavior is wrong and the cause is unknown.
---

# Debug Scientifically

Random edits until the error disappears is not debugging, it is gambling. Treat
every bug as a hypothesis to be confirmed or killed with evidence.

## The loop

1. **Reproduce first.** Find the smallest, most reliable way to trigger the bug.
   If you cannot reproduce it on demand, you cannot know when it is fixed. Write
   a failing test or a one-line repro command before touching anything.
2. **Read the actual error.** The full stack trace, the exact message, the line
   number. Do not skim. The answer is often literally printed.
3. **State one hypothesis.** "The value is null because the API returns 204 with
   no body." Make it specific and falsifiable.
4. **Test that hypothesis cheaply.** Add a log, a breakpoint, or an assertion
   that would prove it true or false. Change one variable at a time.
5. **Confirm or discard, then repeat.** If the evidence kills your hypothesis,
   form a new one. Do not keep a theory the data contradicts.
6. **Fix the cause, not the symptom.** A null check that hides a bad upstream
   value is a symptom patch. Trace to the origin.

## Guardrails

- **Change one thing at a time.** If you edit five things and it works, you have
  learned nothing and probably introduced two new bugs.
- **Question your assumptions.** The bug is usually in the code you are sure is
  correct. Verify inputs, versions, config, and environment, not just logic.
- **Bisect when lost.** Comment out half the suspect code, or use `git bisect`,
  to cut the search space in half each step.
- **Keep a scratch trail.** Note what you tried and what it proved, so you do
  not test the same dead hypothesis twice.

## Before declaring victory

- Reproduce the original failure one more time to confirm it is gone.
- Remove debug logs and temporary code.
- Add a regression test so this exact bug cannot return silently.
