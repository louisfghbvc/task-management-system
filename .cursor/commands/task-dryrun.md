---
name: /task-dryrun
id: task-dryrun
category: Task Magic
description: Generate a dry-run preview for a group of tasks without creating individual detail files.
---
**Guardrails**
- Use this when you want to preview how tasks will be executed without creating separate files.
- Ideal for small, repetitive tasks (like test cases) or implementation previews.
- Generates inline expansion in `tasks.md` OR a single `dryrun.md` file.
- Refer to `.ai/AGENTS.md` for task format conventions.

**Steps**
1. Identify the change directory from user request or by running `task-magic list`.
2. Read `proposal.md`, `design.md` (if exists), and `tasks.md` to understand context.
3. Ask user which task group to dry-run (e.g., "Section 4" or "tasks 4.1-4.8") if not specified.
4. Choose output mode based on task complexity:
   - **Inline mode** (default): Expand tasks directly in `tasks.md` with indented details
   - **File mode**: Create a single `dryrun.md` with structured format
5. Generate dry-run content following the structured format below.

**Inline Mode Format** (directly in tasks.md)
```markdown
## 4. Testing [MEDIUM]
- [ ] 4.1 TC-1: Single register (guaranteed broadcast)
  - **Action**: Run `./run_test single_reg`
  - **Expected**: Uses broadcast directly (size=1 optimization)
  - **Verify**: Output shows "5c: single register"

- [ ] 4.2 TC-2: Same instruction, suffix compatible
  - **Action**: Run `./run_test suffix_compat`
  - **Expected**: Both in same 5c group, saveCount > 0
  - **Verify**: ShiftData shows clusterBroadcast=true
```

**File Mode Format** (creates dryrun.md in change folder)
```markdown
# Dry Run: [Description]

## Context
[Purpose of this dry run - testing/implementation/deployment/other]

## Prerequisites
[Pre-conditions - environment, dependencies, setup commands]

## Steps

### [Task ID]: [Task Title]
- **Action**: [What to do]
- **Expected**: [What success looks like]
- **Verify**: [How to confirm the result] (optional)

### [Task ID]: [Task Title]
- **Action**: ...
- **Expected**: ...
```

**When to Use Each Mode**
- **Inline mode**: Quick reference, few tasks, tasks won't change much
- **File mode**: Complex setup, shared prerequisites, detailed steps, reusable reference

**Example: Testing Dry Run**
```markdown
# Dry Run: Testing Case 5c Broadcast

## Context
Verify Case 5c suffix-compatible broadcast test cases.

## Prerequisites
- `cd build && source setup.sh`
- `export JET_DEBUG=1`

## Steps

### 4.1: TC-1 Single Register
- **Action**: Run `./run_test single_reg`
- **Expected**: Uses broadcast (size=1 optimization)
- **Verify**: Output contains "5c: single register"

### 4.2: TC-2 Same Instruction
- **Action**: Run `./run_test suffix_compat`
- **Expected**: Both registers in same 5c group
```

**Example: Implementation Dry Run**
```markdown
# Dry Run: Implement calcNextStepCase5c

## Context
Preview implementation steps for calcNextStepCase5c() function.

## Prerequisites
- Familiar with Prgm1687BroadcastAlgorithm class
- Understand isProgramValueCompatible() function

## Steps

### 2.1: Add Header Declaration
- **Action**: Add `calcNextStepCase5c()` declaration in .h file
- **Expected**: Compiles without errors
- **Verify**: `make -j8` succeeds

### 2.2: Implement Function Body
- **Action**: Implement ~130 lines following design.md
- **Expected**: Logic matches design specification
```

**Required Sections for File Mode (validated in --strict)**
- `# Dry Run:` - Title
- `## Context` - Purpose description
- `## Steps` - At least one `###` task step

**Reference**
- This is lighter than `/task-detail` which creates one file per task
- Use when you have many small tasks that don't warrant individual files
- Combine with `design.md` for implementation context
