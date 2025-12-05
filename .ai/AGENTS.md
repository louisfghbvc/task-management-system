# Task Magic Instructions

Instructions for AI coding assistants using Task Magic for spec-driven development.

## TL;DR Quick Checklist

- Search existing work: `task-magic list --specs`, `task-magic list`
- Decide scope: new capability vs modify existing capability
- Pick a unique `change-id`: kebab-case, verb-led (`add-`, `update-`, `remove-`, `refactor-`)
- Scaffold: `proposal.md`, `tasks.md`, `design.md` (only if needed), and delta specs per affected capability
- Write deltas: use `## ADDED|MODIFIED|REMOVED|RENAMED Requirements`; include at least one `#### Scenario:` per requirement
- Validate: `task-magic validate [change-id] --strict` and fix issues
- Request approval: Do not start implementation until proposal is approved

## Three-Stage Workflow

### Stage 1: Creating Changes

Create proposal when you need to:
- Add features or functionality
- Make breaking changes (API, schema)
- Change architecture or patterns
- Optimize performance (changes behavior)
- Update security patterns

Triggers (examples):
- "Help me create a change proposal"
- "Help me plan a change"
- "I want to create a spec proposal"

Skip proposal for:
- Bug fixes (restore intended behavior)
- Typos, formatting, comments
- Dependency updates (non-breaking)
- Configuration changes
- Tests for existing behavior

**Workflow**
1. Review `.ai/project.md`, run `task-magic list` and `task-magic list --specs` to understand current context.
2. Choose a unique verb-led `change-id` and scaffold `proposal.md`, `tasks.md`, optional `design.md`, and spec deltas under `.ai/changes/<id>/`.
3. Draft spec deltas using `## ADDED|MODIFIED|REMOVED Requirements` with at least one `#### Scenario:` per requirement.
4. Run `task-magic validate <id> --strict` and resolve any issues before sharing the proposal.

### Stage 2: Implementing Changes

Track these steps as TODOs and complete them one by one.
1. **Read proposal.md** - Understand what's being built
2. **Read design.md** (if exists) - Review technical decisions
3. **Read tasks.md** - Get implementation checklist
4. **Implement tasks sequentially** - Complete in order
5. **Confirm completion** - Ensure every item in `tasks.md` is finished before updating statuses
6. **Update checklist** - After all work is done, set every task to `- [x]` so the list reflects reality
7. **Approval gate** - Do not start implementation until the proposal is reviewed and approved

### Stage 3: Archiving Changes

After deployment, archive the change:
- Run `task-magic archive <change-id> --yes`
- This moves `changes/[name]/` → `memory/changes/YYYY-MM-DD-[name]/`
- Updates `specs/` with the spec deltas
- Appends entry to `memory/CHANGES_LOG.md`

Use `--skip-specs` for tooling-only changes that don't modify specs.

## Before Any Task

**Context Checklist:**
- [ ] Read relevant specs in `specs/[capability]/spec.md`
- [ ] Check pending changes in `changes/` for conflicts
- [ ] Read `.ai/project.md` for conventions
- [ ] Run `task-magic list` to see active changes
- [ ] Run `task-magic list --specs` to see existing capabilities

**Before Creating Specs:**
- Always check if capability already exists
- Prefer modifying existing specs over creating duplicates
- Use `task-magic show [spec]` to review current state
- If request is ambiguous, ask 1–2 clarifying questions before scaffolding

## CLI Commands

```bash
# Essential commands
task-magic list                  # List active changes
task-magic list --specs          # List specifications
task-magic show [item]           # Display change or spec
task-magic validate [item]       # Validate changes or specs
task-magic archive <change-id> [--yes]   # Archive after deployment

# Task commands
task-magic task list             # List tasks in a change
task-magic task show <id>        # Show task with details
task-magic task detail <id>      # Create task detail file

# Project management
task-magic init                  # Initialize .ai/ structure
task-magic sync                  # Sync CHANGES.md with changes/

# Output options
task-magic show [change] --json --deltas-only
task-magic validate [change] --strict
```

### Command Flags

- `--json` - Machine-readable output
- `--type change|spec` - Disambiguate items
- `--strict` - Comprehensive validation
- `--skip-specs` - Archive without spec updates
- `--yes`/`-y` - Skip confirmation prompts

## Directory Structure

```
.ai/
├── project.md              # Project conventions
├── AGENTS.md               # This file - AI instructions
├── CHANGES.md              # Master view of active changes
├── specs/                  # Current truth - what IS built
│   └── [capability]/
│       ├── spec.md         # Requirements and scenarios
│       └── design.md       # Technical patterns (optional)
├── changes/                # Proposals - what SHOULD change
│   └── [change-name]/
│       ├── proposal.md     # Why, what, impact
│       ├── tasks.md        # Implementation checklist
│       ├── tasks/          # Detailed task files (optional)
│       │   └── 1.1-task-name.md
│       ├── design.md       # Technical decisions (optional)
│       └── specs/          # Delta changes
│           └── [capability]/
│               └── spec.md # ADDED/MODIFIED/REMOVED
└── memory/                 # Historical archive
    ├── changes/            # Completed changes
    │   └── YYYY-MM-DD-[name]/
    └── CHANGES_LOG.md      # Chronological log
```

## Creating Change Proposals

### Decision Tree

```
New request?
├─ Bug fix restoring spec behavior? → Fix directly
├─ Typo/format/comment? → Fix directly
├─ New feature/capability? → Create proposal
├─ Breaking change? → Create proposal
├─ Architecture change? → Create proposal
└─ Unclear? → Create proposal (safer)
```

### Proposal Structure

1. **Create directory:** `changes/[change-id]/` (kebab-case, verb-led, unique)

2. **Write proposal.md:**
```markdown
# Change: [Brief description of change]

## Why
[1-2 sentences on problem/opportunity]

## What Changes
- [Bullet list of changes]
- [Mark breaking changes with **BREAKING**]

## Impact
- Affected specs: [list capabilities]
- Affected code: [key files/systems]
```

3. **Create spec deltas:** `specs/[capability]/spec.md`
```markdown
## ADDED Requirements
### Requirement: New Feature
The system SHALL provide...

#### Scenario: Success case
- **WHEN** user performs action
- **THEN** expected result

## MODIFIED Requirements
### Requirement: Existing Feature
[Complete modified requirement]

## REMOVED Requirements
### Requirement: Old Feature
**Reason**: [Why removing]
**Migration**: [How to handle]
```

4. **Create tasks.md:**
```markdown
## 1. Category Name
- [ ] 1.1 First task
- [ ] 1.2 Second task

## 2. Another Category
- [ ] 2.1 Task description
- [ ] 2.2 Another task
```

5. **Create design.md when needed:**
Create `design.md` if any of the following apply:
- Cross-cutting change (multiple services/modules) or new architectural pattern
- New external dependency or significant data model changes
- Security, performance, or migration complexity
- Ambiguity that benefits from technical decisions before coding

## Spec File Format

### Critical: Scenario Formatting

**CORRECT** (use #### headers):
```markdown
#### Scenario: User login success
- **WHEN** valid credentials provided
- **THEN** return JWT token
```

**WRONG** (don't use bullets or bold):
```markdown
- **Scenario: User login**  ❌
**Scenario**: User login     ❌
### Scenario: User login      ❌
```

Every requirement MUST have at least one scenario.

### Requirement Wording

- Use SHALL/MUST for normative requirements
- Avoid should/may unless intentionally non-normative

### Delta Operations

- `## ADDED Requirements` - New capabilities
- `## MODIFIED Requirements` - Changed behavior
- `## REMOVED Requirements` - Deprecated features
- `## RENAMED Requirements` - Name changes

### When to use ADDED vs MODIFIED

- **ADDED**: Introduces a new capability that can stand alone
- **MODIFIED**: Changes behavior of an existing requirement. Always paste the full, updated requirement content (header + all scenarios)
- **RENAMED**: Use when only the name changes

Common pitfall: Using MODIFIED to add a new concern without including the previous text. This causes loss of detail at archive time.

## Task Format

Tasks live in `tasks.md` within each change folder.

### Format
```markdown
## 1. Category Name
- [ ] 1.1 Task description
- [ ] 1.2 Another task
- [x] 1.3 Completed task

## 2. Implementation
- [ ] 2.1 Create component
- [ ] 2.2 Add tests
```

### Status Icons
- `[ ]` - Pending
- `[-]` - In progress (optional, for tracking)
- `[x]` - Completed

### Best Practices

- Group related tasks under numbered categories
- Use decimal numbering (1.1, 1.2, 2.1, etc.)
- Keep tasks small and verifiable
- Include testing tasks explicitly

### Enhanced Task Format

Add priority tags and detail links:

```markdown
## 1. Setup [HIGH]
- [ ] 1.1 Create database schema → [📝 details](tasks/1.1-create-database-schema.md)
- [ ] 1.2 Implement API endpoint

## 2. Frontend [MEDIUM]
- [ ] 2.1 Create form component
  - depends: 1.2
```

Priority levels: `[CRITICAL]`, `[HIGH]`, `[MEDIUM]`, `[LOW]`

### Task Detail Files

For complex tasks, create detailed implementation files in `tasks/`:

```markdown
---
id: "1.1"
title: "Create database schema"
priority: high
depends: []
status: pending
created_at: "2025-12-05T00:00:00Z"
---

## Description
Create the user table with required fields.

## Implementation Details

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  email VARCHAR(255) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

## Files to Modify
1. `migrations/001_users.sql` - Add migration file
2. `src/models/user.ts` - Add type definition

## Test Strategy
- [ ] Run migration on test database
- [ ] Verify table schema matches spec
```

Create detail files with: `task-magic task detail <id>`

## Memory Archive

### CHANGES_LOG.md Format

When archiving, append an entry:

```markdown
- **2025-01-15 change-id**: Brief description (Status: Completed)
  > Tasks: 5/5 complete
  > Specs updated: capability-name
```

### Archive Structure

```
memory/
├── changes/
│   └── 2025-01-15-change-id/
│       ├── proposal.md
│       ├── tasks.md
│       ├── design.md (if existed)
│       └── specs/
└── CHANGES_LOG.md
```

## Troubleshooting

### Common Errors

**"Change must have at least one delta"**
- Check `changes/[name]/specs/` exists with .md files
- Verify files have operation prefixes (## ADDED Requirements)

**"Requirement must have at least one scenario"**
- Check scenarios use `#### Scenario:` format (4 hashtags)
- Don't use bullet points or bold for scenario headers

### Validation Tips

```bash
# Always use strict mode for comprehensive checks
task-magic validate [change] --strict

# Debug delta parsing
task-magic show [change] --json --deltas-only
```

## Best Practices

### Simplicity First
- Default to <100 lines of new code
- Single-file implementations until proven insufficient
- Avoid frameworks without clear justification
- Choose boring, proven patterns

### Complexity Triggers
Only add complexity with:
- Performance data showing current solution too slow
- Concrete scale requirements
- Multiple proven use cases requiring abstraction

### Change ID Naming
- Use kebab-case, short and descriptive: `add-two-factor-auth`
- Prefer verb-led prefixes: `add-`, `update-`, `remove-`, `refactor-`
- Ensure uniqueness

### Capability Naming
- Use verb-noun: `user-auth`, `payment-capture`
- Single purpose per capability
- 10-minute understandability rule

## Quick Reference

### Stage Indicators
- `changes/` - Proposed, not yet built
- `specs/` - Built and deployed
- `memory/` - Completed changes

### File Purposes
- `proposal.md` - Why and what
- `tasks.md` - Implementation steps
- `design.md` - Technical decisions
- `spec.md` - Requirements and behavior

### CLI Essentials
```bash
task-magic list              # What's in progress?
task-magic show [item]       # View details
task-magic validate --strict # Is it correct?
task-magic archive <id> --yes  # Mark complete
```

Remember: Specs are truth. Changes are proposals. Keep them in sync.

## 🚨 CRITICAL: Real Timestamps Only

**Before ANY change update:**
```bash
# ALWAYS run this command before updating timestamps:
date -u +"%Y-%m-%dT%H:%M:%SZ"
```

