---
name: /execute
id: execute
category: Task Magic
description: Implement an approved change and keep tasks in sync.
---
**Guardrails**
- Favor straightforward, minimal implementations first and add complexity only when requested.
- Keep changes tightly scoped to the requested outcome.
- Refer to `.ai/AGENTS.md` for conventions and clarifications.

**Steps**
Track these steps as TODOs and complete them one by one.
1. Read `.ai/changes/<id>/proposal.md`, `design.md` (if present), and `tasks.md` to confirm scope.
2. Work through tasks sequentially, keeping edits minimal and focused.
3. Confirm completion before updating statuses—make sure every item in `tasks.md` is finished.
4. Update the checklist after all work is done so each task is marked `- [x]`.
5. Reference `task-magic list` or `task-magic show <item>` when additional context is required.
6. Run `task-magic sync` to update CHANGES.md with current progress.

**Reference**
- Use `task-magic show <id> --json --deltas-only` for additional context while implementing.
