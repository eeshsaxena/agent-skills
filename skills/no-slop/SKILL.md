---
name: no-slop
description: Write code comments, docs, PRs, and commit messages that sound like a sharp engineer, not an AI. Use whenever generating prose or comments.
---

# No Slop

AI writing has tells. They make output feel generic, padded, and untrustworthy.
Strip them. Write the way a senior engineer writes when they respect the reader's
time.

## Banned patterns

- **No filler openers.** Delete "In today's fast-paced world", "It is important
  to note that", "Let's dive in", "At the end of the day".
- **No hype adjectives.** Cut "powerful", "seamless", "robust", "cutting-edge",
  "game-changing", "elegant" unless you can prove it in the next clause.
- **No throat-clearing.** Say the thing. "This function retries failed uploads"
  beats "This function is designed to handle the retrying of uploads that fail".
- **No summary that repeats the body.** If the conclusion adds nothing, delete it.
- **No emoji-bulleted marketing** in code comments or technical docs.
- **No em dashes as a crutch.** Use a comma, a colon, or two sentences.

## Do instead

- **Lead with the point.** First sentence carries the main idea.
- **Prefer concrete over abstract.** Name the actual file, value, or failure
  mode instead of gesturing at "various scenarios".
- **Comment the why, not the what.** Good: "Retry twice because the S3 client
  throws on cold connections." Bad: "This retries the request."
- **Cut every word that can go.** Read the draft once and delete a third of it.
- **Match the surrounding voice.** New comments should read like the file's
  existing comments, not like a blog post dropped into source.

## Test before shipping prose

Read it aloud. If it sounds like a press release or a textbook intro, rewrite it.
If a busy reviewer would skim past it, it is not earning its place.
