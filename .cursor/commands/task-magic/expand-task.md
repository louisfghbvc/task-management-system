# Expand Task

## Overview

Analyze task complexity and recommend expansion into smaller sub-tasks when a task is too large or ambiguous. This command focuses on analysis and recommendation only—actual sub-task creation is handled separately.

**Key Principles**:

- Assess complexity before execution
- Recommend logical breakdown
- Identify dependencies between sub-tasks
- PLAN MODE ONLY: No code generation during analysis

**Usage**:

```
/expand-task <task-id>
```

**Parameters**:

- `<task-id>` – (Required) Task ID to analyze (e.g., `5`)

**Development Flow Position**:

```
create-tasks → review complexity → **expand-task** → create-tasks (for sub-tasks) → execute-task
```

## Complexity Assessment Criteria

A task should be expanded if it meets several of:
- Estimated effort > 2-3 developer days
- Multiple distinct components or modules
- High uncertainty or ambiguous requirements
- Multiple logical outcomes
- Numerous acceptance criteria (>5)
- Blocks multiple other tasks
