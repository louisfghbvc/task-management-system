# Change: Add Task Detail and Dryrun File Validation

## Why

Currently `task-magic validate` checks proposal.md, tasks.md, and spec deltas, but ignores:
1. The `tasks/` directory containing task detail files
2. The `dryrun.md` file if it exists

This can lead to:
- Broken links in tasks.md pointing to non-existent detail files
- Detail files missing required sections (Description, Implementation Details, etc.)
- Status inconsistencies between tasks.md and detail file frontmatter
- Incomplete dryrun.md files missing setup or task steps

## What Changes

### Task Detail Validation
- **Default mode**: Check that detail links in tasks.md point to existing files
- **Strict mode**: Additionally check structure (required sections) and status consistency

### Dryrun File Validation (Strict mode only)
- If `dryrun.md` exists, validate it has:
  - `## Environment Setup` section
  - At least one task group with steps

## Impact

- Affected specs: task-system
- Affected code: `cli/src/commands/validate.ts`

