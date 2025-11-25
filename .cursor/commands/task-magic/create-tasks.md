# Create Tasks

## Overview

Generate structured task sequences from Product Requirements Documents (PRDs). This command analyzes feature plans in `.ai/plans/features/` and breaks them down into logical, dependency-aware development tasks stored in `.ai/tasks/`.

**Key Principles**:

- Break down PRDs into actionable, sequenced tasks
- Track dependencies and priorities
- Maintain single source of truth in `.ai/tasks/`
- Keep `.ai/TASKS.md` synchronized

**Usage**:

```
/create-tasks <prd-file>
```

**Parameters**:

- `<prd-file>` – (Required) Path to PRD in `.ai/plans/features/` (e.g., `user-auth-plan.md`)

**Development Flow Position**:

```
PRD creation → **create-tasks** → update-task-impl → execute-task → archive-task
```

## Output Guideline

**Input Requirements**:

- Requires `<prd-file>` parameter—stop and ask if missing
- Read the specified PRD from `.ai/plans/features/`
- Scan `.ai/tasks/` and `.ai/memory/tasks/` to determine next task ID

**Task Generation Process**:

- Analyze PRD sections: Functional Requirements, User Stories, Milestones
- Identify logical task units (2-4 hours each ideally)
- Establish dependencies between tasks
- Assign priorities based on PRD
- Create task files in `.ai/tasks/` using format `task{id}_descriptive_name.md`
- Update `.ai/TASKS.md` with new tasks

**Task File Format**:

Each generated task includes YAML frontmatter with:
- `id`: Sequential integer
- `title`: Descriptive title
- `status`: pending
- `priority`: critical/high/medium/low
- `dependencies`: Array of task IDs
- `created_at`: ISO timestamp

**Scope Boundaries**:

- Only create task planning files—no code implementation
- No modifying source files
- Focus on task structure and dependencies

## Implementation Steps

1. **Validate PRD path**: Ensure file exists in `.ai/plans/features/`
2. **Determine next ID**: Scan `.ai/tasks/` and `.ai/memory/tasks/` for highest existing ID
3. **Analyze PRD**: Extract functional requirements and user stories
4. **Generate task sequence**: Break down into logical units with dependencies
5. **Create task files**: Write `task{id}_*.md` files in `.ai/tasks/`
6. **Update TASKS.md**: Add entries with checkboxes and metadata
7. **Summarize**: Show user the created tasks and their dependency graph
