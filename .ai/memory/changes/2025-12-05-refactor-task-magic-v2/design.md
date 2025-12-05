# Design: Task Magic v2 Architecture

## Context

We're merging two systems (OpenSpec + Task Magic) into a unified `.ai/` based workflow. The key insight is that OpenSpec's change-centric model is superior to Task Magic's standalone task model.

### Stakeholders
- AI coding assistants (Cursor, Claude, etc.)
- Developers using the system

### Constraints
- Must be npm-publishable CLI tool
- Must work with Cursor's slash commands
- Must maintain historical context for AI agents

## Goals / Non-Goals

### Goals
- Single source of truth in `.ai/`
- CLI tool with OpenSpec-style commands
- Clean, consolidated AI instructions
- Change-centric workflow (each change has its own tasks)

### Non-Goals
- Backward compatibility with old `.ai/tasks/` structure
- Supporting standalone tasks outside of changes
- Complex task dependency graphs (keep it simple)

## Decisions

### Decision 1: All content in `.ai/`
**Why:** Single location reduces confusion. `.ai/` is already established.
**Alternatives considered:**
- Keep `openspec/` separate → Rejected: Creates two systems
- Use `.taskmagic/` → Rejected: `.ai/` already exists

### Decision 2: Tasks embedded in changes
**Why:** Tasks are always in context of what they're implementing.
**Format:**
```markdown
# tasks.md (in each change folder)

## 1. Setup
- [ ] 1.1 Create directory structure
- [ ] 1.2 Initialize package.json

## 2. Implementation
- [ ] 2.1 Implement CLI commands
- [ ] 2.2 Add validation logic
```
**Alternatives considered:**
- Keep standalone `.ai/tasks/` → Rejected: Loses context
- Use YAML for tasks → Rejected: Markdown is simpler

### Decision 3: Memory structure
**Why:** Archive completed changes with full context.
```
.ai/memory/
├── changes/                      # Archived change folders
│   └── 2025-01-15-add-feature/   # Date-prefixed for sorting
│       ├── proposal.md
│       ├── tasks.md
│       └── specs/
└── CHANGES_LOG.md                # Quick reference log
```
**Alternatives considered:**
- Flatten archived changes → Rejected: Loses structure
- Keep tasks separate → Rejected: Loses context

### Decision 4: CLI tool scope
**Why:** Focus on project management, not task execution (AI does that).
```bash
# Included
task-magic list [--specs]
task-magic show <item>
task-magic validate <change> [--strict]
task-magic archive <change-id> [--yes]
task-magic init
task-magic sync

# NOT included (AI does these via Cursor)
task-magic start <task>
task-magic complete <task>
```

### Decision 5: Single AGENTS.md
**Why:** One comprehensive file is easier to maintain than multiple .mdc files.
**Location:** `.ai/AGENTS.md`
**Content:** Merged from:
- `openspec/AGENTS.md` (spec methodology)
- `.cursor/rules/.task-magic/tasks.mdc` (task format)
- `.cursor/rules/.task-magic/memory.mdc` (archive process)

## Risks / Trade-offs

### Risk: Breaking existing workflows
**Mitigation:** 
- Create migration guide in tasks
- Keep README updated
- Provide `task-magic init` for fresh starts

### Risk: Loss of task flexibility
**Trade-off:** Tasks must belong to a change. For quick fixes, create a small change.
**Mitigation:** Support "quick-fix" change template for simple tasks.

## Migration Plan

1. Create new `.ai/` structure
2. Migrate `openspec/specs/` → `.ai/specs/`
3. Migrate `openspec/changes/` → `.ai/changes/`
4. Create `.ai/AGENTS.md` from merged rules
5. Update Cursor commands
6. Delete old directories (`openspec/`, `.ai/plans/`, `.ai/tasks/`)
7. Create and publish `task-magic` npm package

### Rollback
- Git revert if issues arise
- Old structure preserved in git history

## Open Questions

- [ ] Should we support "quick task" without full change proposal?
- [ ] How to handle in-progress tasks during migration?

