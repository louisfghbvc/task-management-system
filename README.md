# Task Magic

Spec-driven development framework for AI coding assistants. Organize your work as **changes** with proposals, tasks, and specifications.

## 🚀 Quick Install

```bash
# Clone and setup
git clone <repo-url> task-magic
cd task-magic
./install.sh
```

Or manually:

```bash
cd cli && npm install && npm run build && npm link
```

## 📁 Project Structure

```
.ai/
├── project.md              # Project context & conventions
├── AGENTS.md               # AI instructions (read this!)
├── CHANGES.md              # Active changes overview
├── specs/                  # Built specifications
│   └── [capability]/
│       └── spec.md
├── changes/                # Active change proposals
│   └── [change-name]/
│       ├── proposal.md     # Why and what
│       ├── tasks.md        # Implementation checklist
│       ├── tasks/          # Task & section detail files (optional)
│       ├── design.md       # Technical decisions (optional)
│       └── specs/          # Spec deltas
└── memory/                 # Archive
    ├── changes/            # Completed changes
    └── CHANGES_LOG.md      # History log
```

## 🔄 Workflow

```
┌─────────────────────────────────────────────────────────────────┐
│                    1. PROPOSE PHASE                             │
├─────────────────────────────────────────────────────────────────┤
│ 👤 User:                                                        │
│    → Type /proposal command with your idea/request              │
│    → Example: "/proposal add user authentication feature"       │
│                                                                 │
│ 🤖 AI:                                                          │
│    → Analyze user's request                                     │
│    → Generate under .ai/changes/<change-id>/:                   │
│        • proposal.md   - Why & what changes                     │
│        • tasks.md      - Implementation checklist               │
│        • specs/        - Specification deltas (if needed)       │
│    → Run: task-magic validate <change-id> --strict              │
│    → Fix any validation errors before presenting                │
│                                                                 │
│ 👤 User:                                                        │
│    → Review generated proposal                                  │
│    → Type /task-detail <id> for complex tasks or sections       │
│    → Approve, request modifications, or reject                  │
├─────────────────────────────────────────────────────────────────┤
│                    2. IMPLEMENT PHASE                           │
├─────────────────────────────────────────────────────────────────┤
│ 👤 User:                                                        │
│    → Type /execute command to start implementation              │
│                                                                 │
│ 🤖 AI:                                                          │
│    → Read tasks.md and task detail files                        │
│    → Implement each task one by one                             │
│    → Update task status [x] when complete                       │
│                                                                 │
│ 👤 User:                                                        │
│    → Review code changes                                        │
│    → Test functionality                                         │
│    → Provide feedback or approve                                │
│                                                                 │
│ 🤖 AI:                                                          │
│    → Address feedback if any                                    │
│    → Run: task-magic sync (update CHANGES.md)                   │
├─────────────────────────────────────────────────────────────────┤
│                    3. ARCHIVE PHASE                             │
├─────────────────────────────────────────────────────────────────┤
│ 👤 User:                                                        │
│    → Confirm all tasks complete                                 │
│    → Type /archive command                                      │
│                                                                 │
│ 🤖 AI:                                                          │
│    → Run: task-magic archive <change-id> --yes                  │
│    → Move change to .ai/memory/changes/                         │
│    → Update CHANGES_LOG.md                                      │
└─────────────────────────────────────────────────────────────────┘
```

### 1. Create a Change Proposal

```bash
# Use Cursor command
/proposal

# Or manually create .ai/changes/<change-id>/
```

### 2. Implement Tasks

```bash
# Use Cursor command
/execute

# Track progress
task-magic task list
task-magic sync
```

### 3. Archive When Complete

```bash
task-magic archive <change-id> --yes
```

## 🛠 CLI Commands

```bash
# Changes & Specs
task-magic list                  # List active changes
task-magic list --specs          # List specifications
task-magic show <item>           # Display details
task-magic validate <change>     # Validate change (checks detail links)
task-magic validate <change> --strict  # + check detail/section structure
task-magic archive <id> --yes    # Archive completed change

# Tasks
task-magic task list             # List tasks in a change
task-magic task show <id>        # Show task details
task-magic task detail <id>      # Create task detail file

# Project
task-magic init                  # Initialize new project
task-magic sync                  # Sync CHANGES.md
```

## ⌨️ Cursor Commands

| Command | Description |
|---------|-------------|
| `/proposal` | Create a new change proposal |
| `/execute` | Implement an approved change |
| `/archive` | Archive a completed change |
| `/quick-fix` | Create minimal change for simple fixes |
| `/task-detail` | Add implementation details to a task or section |

## 📝 File Formats

### tasks.md

```markdown
## 1. Setup [HIGH]
- [ ] 1.1 Create database → [📝 details](tasks/1.1-create-db.md)
- [ ] 1.2 Implement API
  - depends: 1.1

## 2. Frontend [MEDIUM]
- [x] 2.1 Create form component
```

### Task Detail File

```markdown
## Description
What this task accomplishes.

## Implementation Details
```typescript
// Copy-paste ready code
```

## Files to Modify
1. `path/to/file.ts` - Add function X

## Test Strategy
- [ ] Test case 1
```

### Section Detail File (`/task-detail 4`)

Creates `tasks/section-4-testing.md`:

```markdown
# Detail: Testing (Section 4)

## Context
Purpose of this section - testing/implementation/deployment.

## Prerequisites
- `cd build && source setup.sh`
- Required dependencies installed

## Steps

### 4.1: TC-1 Single Register
- **Action**: Run `./run_test single_reg`
- **Expected**: Uses broadcast (size=1 optimization)
- **Verify**: Output contains "5c: single register"

### 4.2: TC-2 Same Instruction
- **Action**: Run `./run_test suffix_compat`
- **Expected**: Both registers in same group
```

### proposal.md

```markdown
# Change: Brief description

## Why
Problem or opportunity being addressed.

## What Changes
- List of changes
- Mark **BREAKING** if applicable

## Impact
- Affected specs: capability-name
- Affected code: file paths
```

### spec.md (Delta Format)

```markdown
## ADDED Requirements

### Requirement: Feature Name
The system SHALL provide...

#### Scenario: Success case
- **WHEN** user performs action
- **THEN** expected result
```

## 🎯 Best Practices

1. **Keep changes focused** - One logical change per proposal
2. **Write specs first** - Define behavior before implementing
3. **Small tasks** - Verifiable in <30 minutes
4. **Always validate** - `task-magic validate <id> --strict`
5. **Archive promptly** - Keep active changes list clean

## 📚 Documentation

- `.ai/AGENTS.md` - Complete AI instructions
- `.ai/project.md` - Project conventions

## 🔧 Development

```bash
# Build CLI
cd cli && npm run build

# Watch mode
cd cli && npm run dev

# Link globally
cd cli && npm link
```

## License

MIT
