## MODIFIED Requirements

### Requirement: Project Initialization
The system SHALL initialize a project for Task Magic usage with the following behavior:

1. **Shared Mode** (default behavior):
   - Create `~/.ai/` directory with full structure if not exists
   - Create symlink: `<project>/.ai/` → `~/.ai/`
   - Generate `.cursor/commands/` with 5 command files from embedded templates
   - All projects share the same specs, changes, tasks, and memory

2. **Local Mode** (with `--local` flag):
   - Create independent `.ai/` directory in project (original behavior)
   - Generate `.cursor/commands/` from embedded templates
   - No symlinks, project has isolated tasks and changes

3. **Cursor Commands Generation**:
   - Commands are generated from templates embedded in CLI
   - Generated directly into `.cursor/commands/` (not symlinked)
   - Use `--force` to regenerate/update existing commands

4. **File Protection**:
   - If `.ai/` exists as a regular directory, prompt before replacing with symlink
   - If `.cursor/commands/` exists, skip unless `--force` is specified
   - Never delete existing data without `--force`

#### Scenario: First project initialization (shared mode)
- **WHEN** user runs `task-magic init` for the first time
- **AND** `~/.ai/` does not exist
- **THEN** create full `~/.ai/` directory structure with AGENTS.md, project.md, etc.
- **AND** create symlink `.ai/` → `~/.ai/`
- **AND** generate `.cursor/commands/` with 5 command files

#### Scenario: Additional project initialization (shared mode)
- **WHEN** user runs `task-magic init` in another project
- **AND** `~/.ai/` already exists
- **THEN** do NOT modify `~/.ai/` contents
- **AND** create symlink `.ai/` → `~/.ai/`
- **AND** generate `.cursor/commands/` with 5 command files

#### Scenario: Local mode initialization
- **WHEN** user runs `task-magic init --local`
- **THEN** create independent `.ai/` directory in project
- **AND** generate `.cursor/commands/` from embedded templates
- **AND** do not create symlinks or modify `~/.ai/`

#### Scenario: Update cursor commands
- **WHEN** user runs `task-magic init --force`
- **AND** `.cursor/commands/` already exists
- **THEN** regenerate all 5 command files from embedded templates
- **AND** overwrite existing files

#### Scenario: Cross-project task sharing
- **WHEN** user creates a change in project A
- **AND** project B uses symlink to same `~/.ai/`
- **THEN** the change is visible in project B via `task-magic list`

## ADDED Requirements

### Requirement: Embedded Cursor Command Templates
The system SHALL embed Cursor command templates in the CLI for generation during init.

The following commands SHALL be embedded:
- `proposal.md` - Create change proposals
- `execute.md` - Implement approved changes
- `archive.md` - Archive completed changes
- `quick-fix.md` - Quick fixes without full proposals
- `task-detail.md` - Add task implementation details

#### Scenario: Commands generated from CLI
- **WHEN** `task-magic init` runs
- **THEN** `.cursor/commands/` directory is created
- **AND** 5 command files are written from embedded templates
- **AND** no external file copying or symlinking is required

### Requirement: Global Path Configuration
The system SHALL support custom global path via `--global-path <path>` option.

#### Scenario: Custom global path
- **WHEN** user runs `task-magic init --global-path /custom/path`
- **THEN** use `/custom/path/.ai/` instead of `~/.ai/`
- **AND** create symlink pointing to custom path
