# Archive Task

## Overview

Move completed or failed tasks from `.ai/tasks/` to `.ai/memory/tasks/` and log them in the memory system. This maintains a clean active task list while preserving historical context.

**Key Principles**:

- Archive when task is completed or permanently failed
- Preserve full task details in memory
- Log to `.ai/memory/TASKS_LOG.md` for chronological record
- Update `.ai/TASKS.md` to remove archived entries

**Usage**:

```
/archive-task <task-id>
```

**Parameters**:

- `<task-id>` – (Required) Task ID to archive (e.g., `3` or `7.2`)

**Development Flow Position**:

```
create-tasks → execute-task → complete → **archive-task** → memory
```

## Archival Process

1. Move task file from `.ai/tasks/` to `.ai/memory/tasks/`
2. Append entry to `.ai/memory/TASKS_LOG.md`
3. Remove task entry from `.ai/TASKS.md`
4. Verify task status is `completed` or `failed`
