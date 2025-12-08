---
name: /task-detail
id: task-detail
category: Task Magic
description: Create detailed implementation for a task or entire section.
---
**Guardrails**
- Use this to add implementation code, file paths, and test strategies.
- Creates detail files in `tasks/` folder.
- Supports two modes: **single task** or **entire section**.
- Refer to `.ai/AGENTS.md` for task detail format.

**Steps**
1. Identify the input from user request:
   - **Single task**: Task ID like `1.1`, `2.3`
   - **Section**: Section number like `4` or section name like `"Testing"`
2. If no change is specified and multiple changes exist, ask which change.
3. Generate the appropriate detail file:
   - Single task: `tasks/<id>-<task-name>.md`
   - Section: `tasks/section-<num>-<name>.md`
4. Fill in the details with actual implementation information.
5. For single tasks, `tasks.md` will automatically get a link to the detail file.

**Single Task Mode** - `/task-detail 1.1`

Creates `tasks/1.1-task-name.md`:
```yaml
---
id: "1.1"
title: "Task Title"
priority: high
depends: ["1.0"]
status: pending
created_at: "2025-12-05T00:00:00Z"
---

## Description
What this task accomplishes.

## Implementation Details
\`\`\`typescript
// Actual implementation code here
\`\`\`

## Files to Modify
1. `path/to/file.ts` - Add function X
2. `path/to/other.ts` - Update import

## Test Strategy
- [ ] Unit test for function X
- [ ] Integration test for workflow
```

**Section Mode** - `/task-detail 4` or `/task-detail "Testing"`

Creates `tasks/section-4-testing.md`:
```markdown
# Detail: Testing (Section 4)

## Context
[Purpose - what this section accomplishes, testing/implementation/deployment]

## Prerequisites
[Setup steps, environment, dependencies needed]

## Steps

### 4.1: TC-1 Single Register
- **Action**: Run `./run_test single_reg`
- **Expected**: Uses broadcast (size=1 optimization)
- **Verify**: Output contains "5c: single register"

### 4.2: TC-2 Same Instruction
- **Action**: Run `./run_test suffix_compat`
- **Expected**: Both registers in same group
- **Verify**: saveCount > 0
```

**When to Use Each Mode**
- **Single task**: Complex implementation requiring detailed code, file changes, and test strategy
- **Section**: Group of related tasks (like test cases) that share context and prerequisites

**Required Sections**
| Mode | Required Sections |
|------|-------------------|
| Single Task | Description, Implementation Details, Files to Modify |
| Section | Context, Prerequisites, Steps (with ### entries) |

**Reference**
- `task-magic task show <id>` - View task with details
- `task-magic task list` - List all tasks in current change
- Section files validated in `--strict` mode
