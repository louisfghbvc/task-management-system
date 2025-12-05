# task-system Specification

# Delta for Task System


### Requirement: Enhanced Task Format
The system SHALL support an enhanced tasks.md format with priority tags and optional detail file links.

#### Scenario: Priority tags in categories
- **WHEN** a category has a priority tag like `## 1. Setup [HIGH]`
- **THEN** the system recognizes HIGH, MEDIUM, LOW priority levels

#### Scenario: Task with detail link
- **WHEN** a task has format `- [ ] 1.1 Description → [📝 details](tasks/1.1-name.md)`
- **THEN** the system can locate and parse the linked detail file

### Requirement: Task Detail Files
The system SHALL support optional task detail files in a `tasks/` subdirectory within each change.

#### Scenario: Task detail file format
- **WHEN** a task detail file exists at `tasks/{id}-{name}.md`
- **THEN** it contains YAML frontmatter with id, title, priority, depends, status
- **AND** it contains Description, Implementation Details, Files to Modify, Test Strategy sections

#### Scenario: Creating task detail
- **WHEN** user runs `task-magic task detail <id>`
- **THEN** the system creates a task detail file with template content
- **AND** updates tasks.md to include a link to the detail file

### Requirement: Task CLI Subcommands
The system SHALL provide task-specific CLI subcommands.

#### Scenario: Show task details
- **WHEN** user runs `task-magic task show <id>`
- **THEN** the system displays the task from tasks.md
- **AND** if a detail file exists, displays its content

#### Scenario: Create task detail
- **WHEN** user runs `task-magic task detail <id>`
- **THEN** the system creates `tasks/{id}-{slug}.md` with template
- **AND** adds link to the task in tasks.md

### Requirement: Change-Centric Workflow
The system SHALL organize all development work as "changes" where each change contains its own proposal, tasks, and spec deltas.

#### Scenario: Creating a new feature
- **WHEN** a developer wants to add a new feature
- **THEN** they create a change folder in `.ai/changes/<change-id>/`
- **AND** the folder contains `proposal.md`, `tasks.md`, and optionally `design.md` and `specs/`

#### Scenario: Quick fix without full proposal
- **WHEN** a developer needs to make a simple fix
- **THEN** they can create a minimal change with just `proposal.md` and `tasks.md`
- **AND** the proposal can be brief (1-2 sentences for "Why")

### Requirement: Unified Directory Structure
The system SHALL store all project management content in the `.ai/` directory.

#### Scenario: Directory layout
- **WHEN** the system is initialized
- **THEN** the following structure exists:
  ```
  .ai/
  ├── project.md
  ├── AGENTS.md
  ├── CHANGES.md
  ├── specs/
  ├── changes/
  └── memory/
  ```

#### Scenario: No external directories
- **WHEN** content is created or modified
- **THEN** it is stored only within `.ai/`
- **AND** no `openspec/` or other external directories are used

### Requirement: Tasks Embedded in Changes
The system SHALL embed task lists within each change's `tasks.md` file rather than maintaining a global task directory.

#### Scenario: Task format
- **WHEN** tasks are defined for a change
- **THEN** they follow the format:
  ```markdown
  ## 1. Category Name
  - [ ] 1.1 Task description
  - [ ] 1.2 Another task
  ```
- **AND** checkbox state indicates completion (`[ ]` pending, `[x]` done)

#### Scenario: Task completion tracking
- **WHEN** a task is completed
- **THEN** its checkbox is marked `[x]`
- **AND** no separate task files are created

### Requirement: CLI Tool
The system SHALL provide a `task-magic` CLI tool for project management operations.

#### Scenario: List active changes
- **WHEN** user runs `task-magic list`
- **THEN** all active changes in `.ai/changes/` are displayed
- **AND** each shows change-id and proposal title

#### Scenario: List specifications
- **WHEN** user runs `task-magic list --specs`
- **THEN** all specs in `.ai/specs/` are displayed

#### Scenario: Show change details
- **WHEN** user runs `task-magic show <change-id>`
- **THEN** the change's proposal, tasks status, and affected specs are displayed

#### Scenario: Validate change
- **WHEN** user runs `task-magic validate <change-id>`
- **THEN** the change is checked for:
  - Required files exist (proposal.md, tasks.md)
  - Spec deltas have proper format (ADDED/MODIFIED/REMOVED)
  - Each requirement has at least one scenario

#### Scenario: Archive change
- **WHEN** user runs `task-magic archive <change-id> --yes`
- **THEN** the change folder moves to `.ai/memory/changes/YYYY-MM-DD-<change-id>/`
- **AND** spec deltas are applied to `.ai/specs/`
- **AND** an entry is added to `.ai/memory/CHANGES_LOG.md`

#### Scenario: Initialize project
- **WHEN** user runs `task-magic init`
- **THEN** the `.ai/` directory structure is created
- **AND** template files are generated

### Requirement: CHANGES.md Master View
The system SHALL maintain a `CHANGES.md` file as a quick reference to all active changes.

#### Scenario: Master view format
- **WHEN** changes exist in `.ai/changes/`
- **THEN** `CHANGES.md` contains:
  ```markdown
  # Active Changes
  
  - [ ] **add-feature**: Add new feature X
    > 3/5 tasks complete
  - [-] **fix-bug**: Fix critical bug Y
    > In progress, 1/2 tasks complete
  ```

#### Scenario: Sync with changes folder
- **WHEN** user runs `task-magic sync`
- **THEN** `CHANGES.md` is updated to reflect current state of `.ai/changes/`

### Requirement: Memory Archive
The system SHALL archive completed changes to `.ai/memory/` for historical reference.

#### Scenario: Archive structure
- **WHEN** a change is archived
- **THEN** it is stored in `.ai/memory/changes/YYYY-MM-DD-<change-id>/`
- **AND** the full change folder (proposal, tasks, specs) is preserved

#### Scenario: Changes log
- **WHEN** a change is archived
- **THEN** an entry is appended to `.ai/memory/CHANGES_LOG.md`:
  ```markdown
  - **2025-01-15 add-feature**: Add new feature X (Completed)
    > Tasks: 5/5 complete
    > Specs updated: feature-x
  ```

### Requirement: Single AGENTS.md Instructions
The system SHALL provide AI instructions in a single `.ai/AGENTS.md` file.

#### Scenario: AGENTS.md content
- **WHEN** an AI assistant needs guidance
- **THEN** `.ai/AGENTS.md` contains:
  - Three-stage workflow (Propose → Implement → Archive)
  - Spec file format (Requirements, Scenarios)
  - Task format (checkboxes, numbering)
  - CLI command reference
  - Best practices

#### Scenario: No scattered rule files
- **WHEN** AI instructions are needed
- **THEN** they come from `.ai/AGENTS.md` only
- **AND** no `.cursor/rules/.task-magic/*.mdc` files are used

### Requirement: Change-Level Timestamps
The system SHALL support optional YAML frontmatter in proposal.md for tracking change lifecycle timestamps.

#### Scenario: Proposal with timestamps
- **WHEN** user creates a proposal using `/proposal` command
- **THEN** the proposal.md includes YAML frontmatter with `created_at` set to current UTC time
- **AND** `started_at` and `completed_at` are set to `null`

#### Scenario: Archive updates completed_at
- **WHEN** user runs `task-magic archive <change-id> --yes`
- **AND** proposal.md has YAML frontmatter
- **THEN** the system updates `completed_at` to current UTC time before archiving

#### Scenario: Backward compatibility
- **WHEN** proposal.md does not have YAML frontmatter
- **THEN** all commands (validate, archive, show) work normally
- **AND** no errors are thrown

#### Scenario: Frontmatter format
- **WHEN** proposal.md has frontmatter
- **THEN** it follows this format:
```yaml
---
created_at: "2025-12-05T15:30:00Z"
started_at: null
completed_at: null
---
```