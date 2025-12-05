# Change: Refactor Task Magic v2 - Deep OpenSpec Integration

## Why

The current Task Magic system has two parallel structures:
- **OpenSpec** (`openspec/`) - spec-driven proposals with changes/specs
- **Task Magic** (`.ai/`) - plans/tasks/memory system

This creates confusion and redundancy. The `plans/` system is unused, and having two different approaches to project management is inefficient.

**Goals:**
1. Unify both systems into a single `.ai/` directory using OpenSpec's proven methodology
2. Create a `task-magic` CLI tool (npm) for terminal-based project management
3. Simplify Cursor rules by consolidating into a clean AGENTS.md style
4. Remove unused `plans/` system entirely

## What Changes

### **BREAKING** - Directory Structure Overhaul
- Move all OpenSpec content from `openspec/` to `.ai/`
- Remove `.ai/plans/` entirely (replaced by `changes/`)
- Each `change` now contains its own `tasks.md` (no standalone `.ai/tasks/`)
- Restructure `memory/` to archive completed changes

### New Structure
```
.ai/
├── project.md                    # Project context & conventions
├── AGENTS.md                     # AI instructions (replaces all .mdc rules)
├── specs/                        # Current truth - what IS built
│   └── [capability]/
│       └── spec.md
├── changes/                      # Active proposals
│   └── [change-name]/
│       ├── proposal.md           # Why and what
│       ├── tasks.md              # Implementation checklist
│       ├── design.md             # Technical decisions (optional)
│       └── specs/                # Delta specs
│           └── [capability]/
│               └── spec.md
├── memory/                       # Historical archive
│   ├── changes/                  # Completed/failed changes
│   │   └── YYYY-MM-DD-[name]/
│   └── CHANGES_LOG.md            # Chronological log
└── CHANGES.md                    # Master view of active changes
```

### CLI Tool (`task-magic`)
- `task-magic list` - List active changes
- `task-magic list --specs` - List specifications
- `task-magic show <item>` - Display change or spec details
- `task-magic validate <change> [--strict]` - Validate change
- `task-magic archive <change-id> [--yes]` - Archive completed change
- `task-magic init` - Initialize .ai/ structure
- `task-magic sync` - Sync CHANGES.md with changes/ folder

### Cursor Rules Refactor
- Remove all `.cursor/rules/.task-magic/*.mdc` files
- Create single `.ai/AGENTS.md` with comprehensive instructions
- Update `.cursor/commands/` to use new structure
- Remove `openspec/` directory references

## Impact

- **Affected specs**: New `task-system` capability to be created
- **Affected code**: 
  - `.cursor/rules/.task-magic/` (remove entirely)
  - `.cursor/commands/` (update all commands)
  - `openspec/` (migrate then remove)
  - `.ai/plans/` (remove entirely)
  - `.ai/tasks/` (remove - tasks now in changes/)
  - Root `AGENTS.md` (update to point to `.ai/AGENTS.md`)
- **Affected workflows**: All task management workflows change to change-centric model

