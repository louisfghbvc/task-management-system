---
name: /task-dryrun
id: task-dryrun
category: Task Magic
description: Generate a dry-run preview for a group of tasks without creating individual detail files.
---
**Guardrails**
- Use this when you want to preview how tasks will be executed without creating separate files.
- Ideal for small, repetitive tasks (like test cases) that don't need individual detail files.
- Generates inline expansion in `tasks.md` OR a single `dryrun.md` file.
- Refer to `.ai/AGENTS.md` for task format conventions.

**Steps**
1. Identify the change directory from user request or by running `task-magic list`.
2. Read `proposal.md`, `design.md` (if exists), and `tasks.md` to understand context.
3. Ask user which task group to dry-run (e.g., "Section 4" or "tasks 4.1-4.8") if not specified.
4. Choose output mode based on task complexity:
   - **Inline mode** (default): Expand tasks directly in `tasks.md` with indented details
   - **File mode**: Create a single `dryrun.md` with all task previews
5. Generate dry-run content with: Setup, Input, Command, Expected output, Verification steps.

**Inline Mode Format** (directly in tasks.md)
```markdown
## 4. Testing [MEDIUM]
- [ ] 4.1 TC-1: Single register (guaranteed broadcast)
  - **Setup**: `cd build && source setup.sh`
  - **Input**: RegA: instr=0x12, data=0x5678
  - **Command**: `JET_DEBUG=1 ./run_test single_reg 2>&1 | grep "DEBUG:5c"`
  - **Expected**: Uses broadcast directly (size=1 optimization)
  - **Verify**: Output shows "5c: single register, using broadcast"

- [ ] 4.2 TC-2: Same instruction, suffix compatible
  - **Input**: RegA 32-bit=0x12345678, RegB 16-bit=0x5678
  - **Command**: `./run_test suffix_compat`
  - **Expected**: Both in same 5c group, saveCount > 0
  - **Verify**: ShiftData shows clusterBroadcast=true
```

**File Mode Format** (creates dryrun.md in change folder)
```markdown
# Dry Run: [Change Name]

## Environment Setup
\`\`\`bash
cd /path/to/build
source setup.sh
export JET_DEBUG=1
\`\`\`

## Task Group: Testing (4.x)

### 4.1 TC-1: Single Register
| Step | Action |
|------|--------|
| 1 | Prepare input: RegA with instr=0x12, data=0x5678 |
| 2 | Run: `./run_test single_reg` |
| 3 | Verify: Output contains "5c: single register" |
| 4 | Check: ShiftData.clusterBroadcast == true |

### 4.2 TC-2: Same Instruction, Suffix Compatible
| Step | Action |
|------|--------|
| 1 | Prepare: RegA 32-bit, RegB 16-bit with suffix-compatible data |
| 2 | Run: `./run_test suffix_compat` |
| 3 | Verify: Both registers in same 5c group |
| 4 | Check: saveCount > 0 |
```

**When to Use Each Mode**
- **Inline mode**: Quick reference, few tasks, tasks won't change much
- **File mode**: Complex setup, shared environment, detailed verification steps, tasks may be reused

**Inline Detail Fields**
- **Setup**: One-time environment setup (optional, omit if obvious)
- **Input**: Test data or preconditions
- **Command**: Exact command to run
- **Expected**: What success looks like
- **Verify**: How to confirm the result

**Reference**
- This is lighter than `/task-detail` which creates one file per task
- Use when you have many small tasks (like test cases) that don't warrant individual files
- Combine with `design.md` for implementation context
- Use `proposal.md`'s test cases section as source material for inputs/expected outputs
