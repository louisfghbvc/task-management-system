## ADDED Requirements

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

