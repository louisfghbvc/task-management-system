## MODIFIED Requirements

### Requirement: Change Validation

The system SHALL validate changes using `task-magic validate [change]`.

**Default mode validation:**
- proposal.md exists and has `# Change:` header
- tasks.md exists and has checkboxes
- spec deltas have ADDED/MODIFIED/REMOVED sections
- **Detail links in tasks.md point to existing files in `tasks/` directory**

**Strict mode (`--strict`) additional validation:**
- proposal.md has `## Why` and `## What Changes` sections
- Each requirement has at least one scenario
- **Task detail files have required sections: `## Description`, `## Implementation Details`, `## Files to Modify`**
- **Task detail file status matches corresponding task in tasks.md**

#### Scenario: Validate broken detail link (default mode)
- **GIVEN** a change with tasks.md containing `→ [📝 details](tasks/1.1-foo.md)`
- **WHEN** `tasks/1.1-foo.md` does not exist
- **THEN** validation returns warning: "Broken detail link: tasks/1.1-foo.md"

#### Scenario: Validate detail file structure (strict mode)
- **GIVEN** a change with `tasks/1.1-foo.md` that is missing `## Implementation Details`
- **WHEN** running `task-magic validate <change> --strict`
- **THEN** validation returns warning: "Detail file missing section: ## Implementation Details"

#### Scenario: Validate status consistency (strict mode)
- **GIVEN** tasks.md has `- [x] 1.1 Task done` (completed)
- **AND** `tasks/1.1-foo.md` frontmatter has `status: pending`
- **WHEN** running `task-magic validate <change> --strict`
- **THEN** validation returns warning: "Status mismatch for task 1.1: tasks.md=done, detail=pending"

#### Scenario: Pass validation with valid detail files
- **GIVEN** a change with properly linked and structured detail files
- **WHEN** running `task-magic validate <change> --strict`
- **THEN** validation passes with no errors or warnings related to detail files

#### Scenario: Validate dryrun.md missing Context section (strict mode)
- **GIVEN** a change with `dryrun.md` that is missing `## Context` section
- **WHEN** running `task-magic validate <change> --strict`
- **THEN** validation returns warning: "dryrun.md missing section: ## Context"

#### Scenario: Validate dryrun.md missing Steps section (strict mode)
- **GIVEN** a change with `dryrun.md` that is missing `## Steps` section
- **WHEN** running `task-magic validate <change> --strict`
- **THEN** validation returns warning: "dryrun.md missing section: ## Steps"

#### Scenario: Validate dryrun.md missing task steps (strict mode)
- **GIVEN** a change with `dryrun.md` that has `## Steps` but no `###` task entries
- **WHEN** running `task-magic validate <change> --strict`
- **THEN** validation returns warning: "dryrun.md has no task steps defined (missing ### entries)"

#### Scenario: Skip dryrun validation if file does not exist
- **GIVEN** a change without `dryrun.md` file
- **WHEN** running `task-magic validate <change> --strict`
- **THEN** validation does not produce any dryrun-related errors or warnings

