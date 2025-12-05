# Tasks: Refactor Task Magic v2

## 1. Directory Structure Setup
- [x] 1.1 Create `.ai/specs/` directory
- [x] 1.2 Create `.ai/changes/` directory  
- [x] 1.3 Create `.ai/memory/changes/` directory
- [x] 1.4 Create `.ai/project.md` from `openspec/project.md`
- [x] 1.5 Create `.ai/CHANGES.md` master view file

## 2. AGENTS.md Creation
- [x] 2.1 Draft `.ai/AGENTS.md` merging OpenSpec methodology + Task Magic task format
- [x] 2.2 Include spec file format (ADDED/MODIFIED/REMOVED sections)
- [x] 2.3 Include tasks.md format (checkboxes, numbering)
- [x] 2.4 Include memory/archive process
- [x] 2.5 Include CLI command reference

## 3. CLI Tool Development (`task-magic`)
- [x] 3.1 Initialize npm package with TypeScript
- [x] 3.2 Implement `task-magic init` command
- [x] 3.3 Implement `task-magic list` command (list changes)
- [x] 3.4 Implement `task-magic list --specs` command
- [x] 3.5 Implement `task-magic show <item>` command
- [x] 3.6 Implement `task-magic validate <change>` command
- [x] 3.7 Implement `task-magic archive <change-id>` command
- [x] 3.8 Implement `task-magic sync` command (sync CHANGES.md)
- [x] 3.9 Add `--json` output support for all commands
- [x] 3.10 Add `--strict` flag for validate
- [x] 3.11 Write CLI help documentation

## 4. Cursor Commands Update
- [x] 4.1 Update `/proposal` command for `.ai/changes/` path
- [x] 4.2 Update `/apply` command for new structure
- [x] 4.3 Update `/archive` command to use `task-magic archive`
- [x] 4.4 Remove old task-magic commands or update them
- [x] 4.5 Create `/quick-fix` command for simple changes

## 5. Migration & Cleanup
- [x] 5.1 Migrate any existing `openspec/specs/` content to `.ai/specs/`
- [x] 5.2 Migrate any existing `openspec/changes/` to `.ai/changes/`
- [x] 5.3 Delete `openspec/` directory
- [x] 5.4 Delete `.ai/plans/` directory
- [x] 5.5 Delete `.ai/tasks/` directory (if exists)
- [x] 5.6 Delete `.ai/TASKS.md` (replaced by CHANGES.md)
- [x] 5.7 Delete `.cursor/rules/.task-magic/` directory
- [x] 5.8 Update root `AGENTS.md` to reference `.ai/AGENTS.md`
- [x] 5.9 Update `README.md` with new workflow

## 6. Documentation & Testing
- [x] 6.1 Test full workflow: create change → implement → archive
- [x] 6.2 Test CLI commands work correctly
- [x] 6.3 Test Cursor slash commands work
- [x] 6.4 Update README with new commands and structure
- [ ] 6.5 Create example change to demonstrate workflow

## 7. NPM Publishing (Optional - Future)
- [ ] 7.1 Setup npm account/org
- [ ] 7.2 Configure package.json for publishing
- [ ] 7.3 Add LICENSE file
- [ ] 7.4 Publish to npm as `task-magic` or `@yourorg/task-magic`
