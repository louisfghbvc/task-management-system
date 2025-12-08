# Tasks: Refactor task-detail to Support Section-Level Details

## 1. Update Cursor Command [HIGH]
- [x] 1.1 Update `.cursor/commands/task-detail.md` to support section mode
- [x] 1.2 Add section detail file format documentation
- [x] 1.3 Delete `.cursor/commands/task-dryrun.md`

## 2. Update init.ts Templates [HIGH]
- [x] 2.1 Update `TASK_DETAIL_COMMAND` template for section support
- [x] 2.2 Remove `TASK_DRYRUN_COMMAND` template
- [x] 2.3 Remove task-dryrun from commands array in `generateCursorCommands()`
- [x] 2.4 Update `CURSOR_RULE_TEMPLATE` to remove `/task-dryrun`

## 3. Update Validation [MEDIUM]
- [x] 3.1 Rename `validateDryrunFile()` to `validateSectionDetailFile()`
- [x] 3.2 Change validation to look for `tasks/section-*.md` instead of `dryrun.md`
- [x] 3.3 Keep same structure validation (Context, Prerequisites, Steps)

## 4. Update Documentation [MEDIUM]
- [x] 4.1 Update README.md - remove dryrun references, add section detail
- [x] 4.2 Update Project Structure section
- [x] 4.3 Update Cursor Commands table

## 5. Testing [LOW]
- [x] 5.1 Verify section detail validation works
- [x] 5.2 Build and test CLI

