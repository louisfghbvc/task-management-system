# Change: Add Task Details System

## Why
The current tasks.md format is too simple - it lacks priority, dependencies, and implementation details that were valuable in the original Task Magic system.

## What Changes
- Enhanced `tasks.md` format with priority tags and links to detail files
- Optional `tasks/` folder for detailed task files with YAML frontmatter
- New CLI subcommands: `task-magic task show`, `task-magic task detail`
- New Cursor command: `/task-detail` to create implementation details

## Impact
- Affected specs: task-system
- Affected code: cli/src/commands/, .cursor/commands/, .ai/AGENTS.md

