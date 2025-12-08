## MODIFIED Requirements

### Requirement: Task Detail Command

The system SHALL provide a `/task-detail` Cursor command to create detailed implementation files.

**Single Task Mode:**
- Input: Task ID (e.g., `1.1`)
- Output: `tasks/<id>-<task-name>.md` with frontmatter, Description, Implementation Details, Files to Modify, Test Strategy

**Section Mode:**
- Input: Section number (e.g., `4`) or section name (e.g., `"Testing"`)
- Output: `tasks/section-<num>-<name>.md` with Context, Prerequisites, Steps (### entries for each task)

#### Scenario: Create single task detail
- **GIVEN** a change with tasks.md containing `- [ ] 1.1 Create database`
- **WHEN** user runs `/task-detail 1.1`
- **THEN** system creates `tasks/1.1-create-database.md` with standard detail format

#### Scenario: Create section detail
- **GIVEN** a change with tasks.md containing `## 4. Testing [MEDIUM]` with tasks 4.1-4.5
- **WHEN** user runs `/task-detail 4`
- **THEN** system creates `tasks/section-4-testing.md` with Context, Prerequisites, and Steps sections

#### Scenario: Section detail format
- **GIVEN** section detail file `tasks/section-4-testing.md`
- **THEN** file contains `# Detail: [Section Name]`, `## Context`, `## Prerequisites`, `## Steps` with `### <task-id>: <title>` entries

### Requirement: Change Validation

The system SHALL validate changes using `task-magic validate [change]`.

**Default mode validation:**
- proposal.md exists and has `# Change:` header
- tasks.md exists and has checkboxes
- spec deltas have ADDED/MODIFIED/REMOVED sections
- Detail links in tasks.md point to existing files in `tasks/` directory

**Strict mode (`--strict`) additional validation:**
- proposal.md has `## Why` and `## What Changes` sections
- Each requirement has at least one scenario
- Task detail files have required sections: `## Description`, `## Implementation Details`, `## Files to Modify`
- Task detail file status matches corresponding task in tasks.md
- Section detail files (if exist) have required sections: `## Context`, `## Prerequisites`, `## Steps` with `###` entries

#### Scenario: Validate section detail file structure (strict mode)
- **GIVEN** a change with `tasks/section-4-testing.md` that is missing `## Context`
- **WHEN** running `task-magic validate <change> --strict`
- **THEN** validation returns warning: "Section detail file missing section: ## Context"

#### Scenario: Skip section detail validation if no section files exist
- **GIVEN** a change without any `tasks/section-*.md` files
- **WHEN** running `task-magic validate <change> --strict`
- **THEN** validation does not produce any section-detail-related errors

