# Change: Refactor task-detail to Support Section-Level Details

## Why

Currently we have two separate commands:
- `/task-detail` - Creates detail file for a single task
- `/task-dryrun` - Creates preview for a group of tasks

This is redundant. Users want one unified command that can handle both single tasks and entire sections, with all outputs in the `tasks/` directory.

## What Changes

### Enhanced `/task-detail` Command
- **Single task mode** (existing): `/task-detail 1.1` → `tasks/1.1-task-name.md`
- **Section mode** (new): `/task-detail 4` → `tasks/section-4-testing.md`

### Remove `/task-dryrun` Command
- Delete `.cursor/commands/task-dryrun.md`
- Remove `TASK_DRYRUN_COMMAND` from `init.ts`
- Update validation to check section detail files instead of `dryrun.md`

### Update Validation
- Change dryrun.md validation to section detail file validation
- Same structure requirements (Context, Prerequisites, Steps)

## Impact

- Affected specs: task-system
- Affected code:
  - `.cursor/commands/task-detail.md`
  - `.cursor/commands/task-dryrun.md` (delete)
  - `cli/src/commands/init.ts`
  - `cli/src/commands/validate.ts`
  - `README.md`

