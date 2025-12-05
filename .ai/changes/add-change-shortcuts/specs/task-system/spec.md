## ADDED Requirements

### Requirement: Numeric Index Selection
The system SHALL support selecting changes by numeric index for faster access.

#### Scenario: List shows numeric index
- **WHEN** user runs `task-magic list`
- **THEN** each change is prefixed with a numeric index like `[1]`, `[2]`
- **AND** indexes are assigned in the order changes are listed

#### Scenario: Show by index
- **WHEN** user runs `task-magic show 1`
- **THEN** the system resolves `1` to the first change in the list
- **AND** displays that change's details

#### Scenario: Validate by index
- **WHEN** user runs `task-magic validate 2`
- **THEN** the system validates the second change in the list

#### Scenario: Archive by index
- **WHEN** user runs `task-magic archive 1 --yes`
- **THEN** the system archives the first change in the list

#### Scenario: Invalid index
- **WHEN** user provides an index that doesn't exist (e.g., `5` when only 2 changes exist)
- **THEN** the system displays an error: "Invalid index: 5. Available: 1-2"

### Requirement: Interactive Change Selection
The system SHALL prompt for change selection when no change is specified and multiple changes exist.

#### Scenario: Interactive selection on show
- **WHEN** user runs `task-magic show` without specifying a change
- **AND** multiple changes exist
- **THEN** the system displays a numbered list of changes
- **AND** prompts "Enter number: "
- **AND** accepts user input to select a change

#### Scenario: Interactive selection on validate
- **WHEN** user runs `task-magic validate` without specifying a change
- **AND** multiple changes exist
- **THEN** the system prompts for selection

#### Scenario: Auto-select single change
- **WHEN** user runs a command without specifying a change
- **AND** only one change exists
- **THEN** the system automatically selects that change
- **AND** displays "Auto-selected: <change-id>"

#### Scenario: No changes available
- **WHEN** user runs a command without specifying a change
- **AND** no changes exist
- **THEN** the system displays "No active changes found"

### Requirement: Cursor Command Numeric Index Documentation
The Cursor command templates SHALL document numeric index support.

#### Scenario: Execute command knows about indexes
- **WHEN** user invokes `/execute` Cursor command
- **THEN** the command instructions mention using `task-magic list` to see indexes
- **AND** mention that `task-magic show 1` style commands work

#### Scenario: Archive command knows about indexes
- **WHEN** user invokes `/archive` Cursor command
- **THEN** the command instructions mention `task-magic archive 1 --yes` syntax

