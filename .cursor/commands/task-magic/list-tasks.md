# List Tasks

## Overview

Display current task status from `.ai/TASKS.md` with optional filtering by status, priority, or feature. Provides quick overview of active work.

**Key Principles**:

- Read-only command
- Shows tasks from `.ai/tasks/` directory
- Supports filtering and sorting
- Includes implementation status icons

**Usage**:

```
/list-tasks [--status STATUS] [--priority PRIORITY] [--feature FEATURE]
```

**Parameters**:

- `--status` – (Optional) Filter by: pending | in_progress | completed | failed
- `--priority` – (Optional) Filter by: critical | high | medium | low
- `--feature` – (Optional) Filter by feature name

**Icons**:
- [📝] detailed
- [⚡] code_ready
- [🔧] partially_implemented
- [✅] fully_implemented
