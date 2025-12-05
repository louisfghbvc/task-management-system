---
name: /archive
id: archive
category: Task Magic
description: Archive a deployed change and update specs.
---
**Guardrails**
- Favor straightforward, minimal implementations first and add complexity only when requested.
- Keep changes tightly scoped to the requested outcome.
- Refer to `.ai/AGENTS.md` for conventions and clarifications.

**Steps**
1. Determine the change ID to archive:
   - If this prompt includes a specific change ID, use that value.
   - Otherwise, run `task-magic list` to see active changes and confirm with user.
2. Validate the change ID by running `task-magic list` and stop if missing or not ready.
3. Run `task-magic archive <id> --yes` to move the change and apply spec updates.
4. Review the command output to confirm specs were updated and change archived.
5. Validate with `task-magic validate --strict` if anything looks off.

**Reference**
- Use `task-magic list` to confirm change IDs before archiving.
- Inspect refreshed specs with `task-magic list --specs`.
