# Execute Task

## Overview

Execute a specific task from `.ai/tasks/`, implementing the code changes in the actual source tree. This is the ACT MODE operation that applies planned work to the codebase.

**Key Principles**:

- Execute based on task description and implementation details
- Update task status during execution
- Track progress in `.ai/TASKS.md`
- Full code generation and system operations allowed

**Usage**:

```
/execute-task <task-id>
```

**Parameters**:

- `<task-id>` – (Required) Task ID to execute (e.g., `7`)

**Development Flow Position**:

```
create-tasks → update-task-impl → **execute-task** → review → archive-task
```

## Execution Process

1. Validate task is ready (dependencies met)
2. Set status to `in_progress`, update `started_at`
3. Read `### Implementation Details` if exists
4. Apply code changes to source files
5. Run build/test commands if specified
6. Update task status to `completed` on success
7. Update `.ai/TASKS.md` with checkmark
