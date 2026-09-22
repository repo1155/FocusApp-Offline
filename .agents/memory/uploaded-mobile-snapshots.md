---
name: Uploaded mobile snapshots
description: What to check when a React Native app arrives as timestamped attached files
---

Treat timestamped attached React Native files as a partial snapshot, not a complete project. The entry file may be renamed while the original imports still point to `./App`, and screen, service, or native bridge modules may be absent. Confirm the actual project tree and Metro error before trying to repair imports.

**Why:** Metro can report a missing entry point even when the uploaded code itself looks valid; rebuilding against an incomplete attachment produces more missing-module failures.

**How to apply:** Inventory the project files first, then choose between restoring the missing source tree and creating a self-contained local-first app.