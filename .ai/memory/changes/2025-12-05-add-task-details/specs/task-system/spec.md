# Delta for Task System

## ADDED Requirements

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

