---
name: /task-detail
id: task-detail
category: Task Magic
description: Create or view detailed implementation for a task.
---
**Guardrails**
- Use this to add implementation code, file paths, and test strategies to a task.
- This creates a separate detail file in `tasks/` folder.
- Refer to `.ai/AGENTS.md` for task detail format.

**Steps**
1. Identify the task ID (e.g., `1.1`, `2.3`) from user request or context.
2. If no change is specified and multiple changes exist, ask which change.
3. Run `task-magic task detail <task-id>` to create the detail file template.
4. Fill in the Implementation Details section with actual code:
   - Add copy-paste ready code blocks with language tags
   - List all files that need to be modified
   - Include test strategy
5. The task in `tasks.md` will automatically get a link to the detail file.

**Task Detail File Format**
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
```typescript
// Actual implementation code here
```

## Files to Modify
1. `path/to/file.ts` - Add function X
2. `path/to/other.ts` - Update import

## Test Strategy
- [ ] Unit test for function X
- [ ] Integration test for workflow
```

**Reference**
- `task-magic task show <id>` - View task with details
- `task-magic task list` - List all tasks in current change
