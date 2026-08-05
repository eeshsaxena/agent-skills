---
name: test-first
description: Drive changes with a failing test before writing implementation. Use when adding a feature or fixing a bug in a codebase that has tests.
---

# Test First

Write the test before the code. Not for dogma, but because a failing test proves
you understand the requirement and gives you a definition of done you cannot fool.

## The rhythm

1. **Red.** Write the smallest test that captures the desired behavior and watch
   it fail for the right reason. A test that passes before you write code is
   testing nothing.
2. **Green.** Write the least code that makes the test pass. Resist gold-plating.
3. **Refactor.** Clean up now that the test protects you. Run the suite again.

## What makes a good test

- **Tests behavior, not implementation.** Assert on outputs and observable
  effects, not private internals, so refactors do not break it needlessly.
- **One reason to fail.** Each test pins one behavior. When it breaks, the name
  alone tells you what regressed.
- **Descriptive names.** `returns_401_when_token_expired` beats `test_auth_2`.
- **Arrange, act, assert,** with the interesting value obvious at a glance.
- **Deterministic.** No real network, no wall-clock sleeps, no shared mutable
  state between tests. Fake the clock and the network.

## For bug fixes specifically

Reproduce the bug as a failing test first. When it goes green, you have both the
fix and a permanent guard against the bug returning. A bug fix without a
regression test is half a fix.

## Before finishing

- Run the full suite, not just your new test.
- Confirm your new test actually fails when you break the code (sabotage it once
  to be sure it has teeth, then restore).
- Match the project's existing test framework, folder layout, and naming.
