---
name: /proposal
id: proposal
category: Task Magic
description: Scaffold a new change proposal and validate strictly.
---
**Guardrails**
- Favor straightforward, minimal implementations first and add complexity only when requested.
- Keep changes tightly scoped to the requested outcome.
- Refer to `.ai/AGENTS.md` for conventions and clarifications.
- Identify vague or ambiguous details and ask follow-up questions before editing files.
- Do not write any code during the proposal stage. Only create design documents.

**Steps**
1. Review `.ai/project.md`, run `task-magic list` and `task-magic list --specs` to understand context.
2. Choose a unique verb-led `change-id` and scaffold `proposal.md`, `tasks.md`, and `design.md` (when needed) under `.ai/changes/<id>/`.
3. Map the change into concrete requirements, breaking multi-scope efforts into distinct spec deltas.
4. Capture architectural reasoning in `design.md` when the solution spans multiple systems.
5. Draft spec deltas in `.ai/changes/<id>/specs/<capability>/spec.md` using `## ADDED|MODIFIED|REMOVED Requirements` with at least one `#### Scenario:` per requirement.
6. Draft `tasks.md` as an ordered list of small, verifiable work items.
7. Validate with `task-magic validate <id> --strict` and resolve every issue before sharing.

**Reference**
- Use `task-magic show <id> --json --deltas-only` to inspect details when validation fails.
- Search existing requirements with `rg -n "Requirement:|Scenario:" .ai/specs` before writing new ones.
