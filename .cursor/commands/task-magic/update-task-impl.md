# Update Task Implementation

## Overview

Add detailed, copy-paste-ready implementation code to task files. This command transforms text-only task descriptions into executable implementation guides with real code snippets, file modifications, and build commands.

**Key Principles**:

- Code stays in task .md files (not source tree)
- Implementation details are reviewable before application
- Maintains separation between planning and execution
- Updates implementation_status field

**Usage**:

```
/update-task-impl <task-id>
```

**Parameters**:

- `<task-id>` – (Required) Task ID (e.g., `7` or `7.1` for sub-task)

**Development Flow Position**:

```
create-tasks → **update-task-impl** → review implementation → execute-task → archive-task
```

## Output Guideline

**Input Requirements**:

- Requires `<task-id>` parameter—stop and ask if missing
- Read task file from `.ai/tasks/task{id}_*.md`
- Parse YAML frontmatter and body sections

**Implementation Generation**:

- Add `### Implementation Details` section with:
  - Complete, compilable code blocks
  - Proper language tags (cpp/python/bash)
  - Required includes and declarations
  - Minimal but complete snippets
- Add `### Files to Modify` section listing:
  - Exact file paths
  - What changes are needed (declarations, implementations, call-site changes)

**Status Updates**:

- Set `implementation_status: detailed` in YAML
- Set `implementation_detailed_at` with real UTC timestamp
- Update `.ai/TASKS.md` with [📝] icon

**Safety**:

- DO NOT modify source files during this command
- All changes stay in task .md file
- Source modifications require separate explicit approval
