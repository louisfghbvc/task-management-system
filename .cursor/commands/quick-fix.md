---
name: /quick-fix
id: quick-fix
category: Task Magic
description: Create a minimal change for simple fixes.
---
**Guardrails**
- Use this for simple, focused changes that don't need extensive planning.
- Keep the proposal brief (1-2 sentences for "Why").
- Still create proper spec deltas if behavior changes.

**Steps**
1. Review `.ai/project.md` briefly for context.
2. Create a minimal change folder: `.ai/changes/<id>/`
   - `proposal.md` with brief Why/What/Impact
   - `tasks.md` with 1-3 tasks maximum
   - Skip `design.md` unless truly needed
3. If behavior changes, add spec deltas in `.ai/changes/<id>/specs/`
4. Validate with `task-magic validate <id>` (strict not required for quick fixes).
5. Implement immediately after validation passes.

**Example Quick Proposal**
```markdown
# Change: Fix login timeout

## Why
Users are getting logged out too quickly (5 min → 30 min).

## What Changes
- Update session timeout from 5 to 30 minutes

## Impact
- Affected specs: user-auth
- Affected code: config/session.ts
```

**Example Quick Tasks**
```markdown
## 1. Fix
- [ ] 1.1 Update session timeout value in config
- [ ] 1.2 Verify with manual test
```
