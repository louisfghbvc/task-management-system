import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

interface InitOptions {
  force?: boolean;
  local?: boolean;
  globalPath?: string;
}

export function initCommand(program: Command) {
  program
    .command('init')
    .description('Initialize .ai/ directory structure')
    .option('--force', 'Overwrite existing files')
    .option('--local', 'Create independent .ai/ directory (no symlink)')
    .option('--global-path <path>', 'Custom path for shared .ai/ directory')
    .action((options: InitOptions) => {
      initAiDirectory(options);
    });
}

function initAiDirectory(options: InitOptions): void {
  const cwd = process.cwd();
  const aiDir = path.join(cwd, '.ai');
  const cursorCommandsDir = path.join(cwd, '.cursor', 'commands');
  
  // Determine global path
  const homeDir = options.globalPath || process.env.HOME || os.homedir();
  const globalAiDir = path.join(homeDir, '.ai');
  
  const isLocal = options.local || false;
  const force = options.force || false;

  console.log(chalk.cyan('🎯 Task Magic Init'));
  console.log(chalk.dim(`   Mode: ${isLocal ? 'local' : 'shared'}`));
  if (!isLocal) {
    console.log(chalk.dim(`   Shared path: ${globalAiDir}`));
  }
  console.log('');

  // Check if .ai/ exists and is not a symlink
  if (fs.existsSync(aiDir)) {
    const stats = fs.lstatSync(aiDir);
    if (stats.isSymbolicLink()) {
      const target = fs.readlinkSync(aiDir);
      if (!isLocal && target === globalAiDir) {
        console.log(chalk.yellow('.ai/ symlink already points to shared directory.'));
        if (!force) {
          console.log(chalk.dim('Use --force to reinitialize.'));
        }
      } else if (!isLocal && target !== globalAiDir) {
        console.log(chalk.yellow(`.ai/ symlink points to ${target}, updating to ${globalAiDir}`));
        fs.unlinkSync(aiDir);
      } else if (isLocal) {
        console.log(chalk.yellow('.ai/ is a symlink. Removing to create local directory.'));
        if (!force) {
          console.log(chalk.red('Use --force to replace symlink with local directory.'));
          return;
        }
        fs.unlinkSync(aiDir);
      }
    } else if (!stats.isSymbolicLink() && !isLocal) {
      // .ai/ is a regular directory but we want shared mode
      console.log(chalk.yellow('.ai/ exists as a regular directory.'));
      if (!force) {
        console.log(chalk.red('Use --force to replace with symlink to shared directory.'));
        console.log(chalk.dim('Or use --local to keep independent .ai/'));
        return;
      }
      // Backup existing .ai/ before removing
      const backupPath = path.join(cwd, '.ai.backup.' + Date.now());
      console.log(chalk.yellow(`Backing up existing .ai/ to ${backupPath}`));
      fs.renameSync(aiDir, backupPath);
    } else if (!stats.isSymbolicLink() && isLocal && !force) {
      console.log(chalk.yellow('.ai/ directory already exists. Use --force to reinitialize.'));
      return;
    }
  }

  if (isLocal) {
    // Local mode: create .ai/ directly in project
    setupLocalAiDirectory(cwd, force);
  } else {
    // Shared mode: setup global ~/.ai/ and create symlink
    setupGlobalAiDirectory(globalAiDir, force);
    createAiSymlink(cwd, globalAiDir);
  }

  // Generate Cursor commands (always local, not symlinked)
  generateCursorCommands(cursorCommandsDir, force);

  // Generate Cursor rules
  const cursorRulesDir = path.join(cwd, '.cursor', 'rules');
  generateCursorRules(cursorRulesDir, force);

  console.log(chalk.bold.green('\n✓ Task Magic initialized successfully!'));
  console.log(chalk.dim('\nNext steps:'));
  if (isLocal) {
    console.log(chalk.dim('  1. Edit .ai/project.md to describe your project'));
  } else {
    console.log(chalk.dim(`  1. Edit ${globalAiDir}/project.md to describe your project`));
    console.log(chalk.dim('     (shared across all projects)'));
  }
  console.log(chalk.dim('  2. Create your first change: task-magic list'));
  console.log(chalk.dim('  3. See all commands: task-magic --help'));
}

function setupGlobalAiDirectory(globalAiDir: string, force: boolean): void {
  if (fs.existsSync(globalAiDir) && !force) {
    console.log(chalk.dim(`Using existing shared directory: ${globalAiDir}`));
    return;
  }

  console.log(chalk.cyan(`Setting up shared directory: ${globalAiDir}`));

  // Create directory structure
  const dirs = [
    '',
    'specs',
    'changes',
    'memory',
    'memory/changes',
  ];

  for (const dir of dirs) {
    const dirPath = path.join(globalAiDir, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(chalk.green(`✓ Created ${dir || '.ai'}/`));
    }
  }

  // Create files
  const files: { name: string; template: string; subdir?: string }[] = [
    { name: 'project.md', template: PROJECT_TEMPLATE },
    { name: 'AGENTS.md', template: AGENTS_TEMPLATE },
    { name: 'CHANGES.md', template: CHANGES_TEMPLATE },
    { name: 'CHANGES_LOG.md', template: CHANGES_LOG_TEMPLATE, subdir: 'memory' },
  ];

  for (const file of files) {
    const filePath = file.subdir 
      ? path.join(globalAiDir, file.subdir, file.name)
      : path.join(globalAiDir, file.name);
    
    if (!fs.existsSync(filePath) || force) {
      fs.writeFileSync(filePath, file.template);
      const displayPath = file.subdir ? `${file.subdir}/${file.name}` : file.name;
      console.log(chalk.green(`✓ Created ${displayPath}`));
    }
  }
}

function setupLocalAiDirectory(cwd: string, force: boolean): void {
  const aiDir = path.join(cwd, '.ai');

  console.log(chalk.cyan('Setting up local .ai/ directory'));

  // Create directory structure
  const dirs = [
    '.ai',
    '.ai/specs',
    '.ai/changes',
    '.ai/memory',
    '.ai/memory/changes',
  ];

  for (const dir of dirs) {
    const dirPath = path.join(cwd, dir);
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(chalk.green(`✓ Created ${dir}/`));
    }
  }

  // Create files
  const files: { name: string; template: string; subdir?: string }[] = [
    { name: 'project.md', template: PROJECT_TEMPLATE },
    { name: 'AGENTS.md', template: AGENTS_TEMPLATE },
    { name: 'CHANGES.md', template: CHANGES_TEMPLATE },
    { name: 'CHANGES_LOG.md', template: CHANGES_LOG_TEMPLATE, subdir: 'memory' },
  ];

  for (const file of files) {
    const filePath = file.subdir 
      ? path.join(aiDir, file.subdir, file.name)
      : path.join(aiDir, file.name);
    
    if (!fs.existsSync(filePath) || force) {
      fs.writeFileSync(filePath, file.template);
      const displayPath = file.subdir ? `.ai/${file.subdir}/${file.name}` : `.ai/${file.name}`;
      console.log(chalk.green(`✓ Created ${displayPath}`));
    }
  }
}

function createAiSymlink(cwd: string, globalAiDir: string): void {
  const aiDir = path.join(cwd, '.ai');

  if (fs.existsSync(aiDir)) {
    const stats = fs.lstatSync(aiDir);
    if (stats.isSymbolicLink()) {
      const target = fs.readlinkSync(aiDir);
      if (target === globalAiDir) {
        console.log(chalk.dim('.ai/ symlink already exists'));
        return;
      }
      fs.unlinkSync(aiDir);
    }
  }

  fs.symlinkSync(globalAiDir, aiDir);
  console.log(chalk.green(`✓ Created symlink .ai/ → ${globalAiDir}`));
}

function generateCursorCommands(cursorCommandsDir: string, force: boolean): void {
  console.log(chalk.cyan('\nGenerating Cursor commands...'));

  // Create .cursor/commands/ directory
  if (!fs.existsSync(cursorCommandsDir)) {
    fs.mkdirSync(cursorCommandsDir, { recursive: true });
    console.log(chalk.green('✓ Created .cursor/commands/'));
  }

  const commands: { name: string; template: string }[] = [
    { name: 'proposal.md', template: PROPOSAL_COMMAND },
    { name: 'execute.md', template: EXECUTE_COMMAND },
    { name: 'archive.md', template: ARCHIVE_COMMAND },
    { name: 'quick-fix.md', template: QUICK_FIX_COMMAND },
    { name: 'task-detail.md', template: TASK_DETAIL_COMMAND },
    { name: 'task-dryrun.md', template: TASK_DRYRUN_COMMAND },
  ];

  for (const cmd of commands) {
    const filePath = path.join(cursorCommandsDir, cmd.name);
    if (!fs.existsSync(filePath) || force) {
      fs.writeFileSync(filePath, cmd.template);
      console.log(chalk.green(`✓ Generated ${cmd.name}`));
    } else {
      console.log(chalk.dim(`⊘ ${cmd.name} exists (use --force to overwrite)`));
    }
  }
}

function generateCursorRules(cursorRulesDir: string, force: boolean): void {
  console.log(chalk.cyan('\nGenerating Cursor rules...'));

  // Create .cursor/rules/ directory
  if (!fs.existsSync(cursorRulesDir)) {
    fs.mkdirSync(cursorRulesDir, { recursive: true });
    console.log(chalk.green('✓ Created .cursor/rules/'));
  }

  const rulePath = path.join(cursorRulesDir, 'task-magic.mdc');
  if (!fs.existsSync(rulePath) || force) {
    fs.writeFileSync(rulePath, CURSOR_RULE_TEMPLATE);
    console.log(chalk.green('✓ Generated task-magic.mdc'));
  } else {
    console.log(chalk.dim('⊘ task-magic.mdc exists (use --force to overwrite)'));
  }
}

// ============================================================================
// Templates
// ============================================================================

const PROJECT_TEMPLATE = `# Project Context

## Purpose
[Describe your project's purpose and goals]

## Tech Stack
- [List your primary technologies]

## Project Conventions

### Code Style
[Describe your code style preferences]

### Architecture Patterns
[Document your architectural decisions]

### Testing Strategy
[Explain your testing approach]

### Git Workflow
[Describe your branching strategy]

## Domain Context
[Add domain-specific knowledge]

## Important Constraints
[List any constraints]

## External Dependencies
[Document key external services]
`;

const AGENTS_TEMPLATE = `# Task Magic Instructions

Instructions for AI coding assistants using Task Magic for spec-driven development.

## TL;DR Quick Checklist

- Search existing work: \`task-magic list --specs\`, \`task-magic list\`
- Decide scope: new capability vs modify existing capability
- Pick a unique \`change-id\`: kebab-case, verb-led (\`add-\`, \`update-\`, \`remove-\`, \`refactor-\`)
- Scaffold: \`proposal.md\`, \`tasks.md\`, \`design.md\` (only if needed), and delta specs per affected capability
- Write deltas: use \`## ADDED|MODIFIED|REMOVED|RENAMED Requirements\`; include at least one \`#### Scenario:\` per requirement
- Validate: \`task-magic validate [change-id] --strict\` and fix issues
- Request approval: Do not start implementation until proposal is approved

## Three-Stage Workflow

### Stage 1: Creating Changes

Create proposal when you need to:
- Add features or functionality
- Make breaking changes (API, schema)
- Change architecture or patterns
- Optimize performance (changes behavior)
- Update security patterns

Triggers (examples):
- "Help me create a change proposal"
- "Help me plan a change"
- "I want to create a spec proposal"

Skip proposal for:
- Bug fixes (restore intended behavior)
- Typos, formatting, comments
- Dependency updates (non-breaking)
- Configuration changes
- Tests for existing behavior

**Workflow**
1. Review \`.ai/project.md\`, run \`task-magic list\` and \`task-magic list --specs\` to understand current context.
2. Choose a unique verb-led \`change-id\` and scaffold \`proposal.md\`, \`tasks.md\`, optional \`design.md\`, and spec deltas under \`.ai/changes/<id>/\`.
3. Draft spec deltas using \`## ADDED|MODIFIED|REMOVED Requirements\` with at least one \`#### Scenario:\` per requirement.
4. Run \`task-magic validate <id> --strict\` and resolve any issues before sharing the proposal.

### Stage 2: Implementing Changes

Track these steps as TODOs and complete them one by one.
1. **Read proposal.md** - Understand what's being built
2. **Read design.md** (if exists) - Review technical decisions
3. **Read tasks.md** - Get implementation checklist
4. **Implement tasks sequentially** - Complete in order
5. **Confirm completion** - Ensure every item in \`tasks.md\` is finished before updating statuses
6. **Update checklist** - After all work is done, set every task to \`- [x]\` so the list reflects reality
7. **Approval gate** - Do not start implementation until the proposal is reviewed and approved

### Stage 3: Archiving Changes

After deployment, archive the change:
- Run \`task-magic archive <change-id> --yes\`
- This moves \`changes/[name]/\` → \`memory/changes/YYYY-MM-DD-[name]/\`
- Updates \`specs/\` with the spec deltas
- Appends entry to \`memory/CHANGES_LOG.md\`

Use \`--skip-specs\` for tooling-only changes that don't modify specs.

## Before Any Task

**Context Checklist:**
- [ ] Read relevant specs in \`specs/[capability]/spec.md\`
- [ ] Check pending changes in \`changes/\` for conflicts
- [ ] Read \`.ai/project.md\` for conventions
- [ ] Run \`task-magic list\` to see active changes
- [ ] Run \`task-magic list --specs\` to see existing capabilities

**Before Creating Specs:**
- Always check if capability already exists
- Prefer modifying existing specs over creating duplicates
- Use \`task-magic show [spec]\` to review current state
- If request is ambiguous, ask 1–2 clarifying questions before scaffolding

## CLI Commands

\`\`\`bash
# Essential commands (supports numeric indexes!)
task-magic list                  # List changes with [1], [2]... indexes
task-magic list --specs          # List specifications
task-magic show 1                # Show change by index
task-magic show <change-id>      # Show change by name
task-magic validate 1            # Validate by index
task-magic archive 1 --yes       # Archive by index

# Task commands
task-magic task list             # List tasks in a change
task-magic task show <id>        # Show task with details
task-magic task detail <id>      # Create task detail file

# Project management
task-magic init                  # Initialize .ai/ structure
task-magic sync                  # Sync CHANGES.md with changes/

# Output options
task-magic show [change] --json --deltas-only
task-magic validate [change] --strict
\`\`\`

### Command Flags

- \`--json\` - Machine-readable output
- \`--type change|spec\` - Disambiguate items
- \`--strict\` - Comprehensive validation
- \`--skip-specs\` - Archive without spec updates
- \`--yes\`/\`-y\` - Skip confirmation prompts

## Directory Structure

\`\`\`
.ai/
├── project.md              # Project conventions
├── AGENTS.md               # This file - AI instructions
├── CHANGES.md              # Master view of active changes
├── specs/                  # Current truth - what IS built
│   └── [capability]/
│       ├── spec.md         # Requirements and scenarios
│       └── design.md       # Technical patterns (optional)
├── changes/                # Proposals - what SHOULD change
│   └── [change-name]/
│       ├── proposal.md     # Why, what, impact
│       ├── tasks.md        # Implementation checklist
│       ├── tasks/          # Detailed task files (optional)
│       │   └── 1.1-task-name.md
│       ├── design.md       # Technical decisions (optional)
│       └── specs/          # Delta changes
│           └── [capability]/
│               └── spec.md # ADDED/MODIFIED/REMOVED
└── memory/                 # Historical archive
    ├── changes/            # Completed changes
    │   └── YYYY-MM-DD-[name]/
    └── CHANGES_LOG.md      # Chronological log
\`\`\`

## Creating Change Proposals

### Decision Tree

\`\`\`
New request?
├─ Bug fix restoring spec behavior? → Fix directly
├─ Typo/format/comment? → Fix directly
├─ New feature/capability? → Create proposal
├─ Breaking change? → Create proposal
├─ Architecture change? → Create proposal
└─ Unclear? → Create proposal (safer)
\`\`\`

### Proposal Structure

1. **Create directory:** \`changes/[change-id]/\` (kebab-case, verb-led, unique)

2. **Write proposal.md:**
\`\`\`markdown
# Change: [Brief description of change]

## Why
[1-2 sentences on problem/opportunity]

## What Changes
- [Bullet list of changes]
- [Mark breaking changes with **BREAKING**]

## Impact
- Affected specs: [list capabilities]
- Affected code: [key files/systems]
\`\`\`

3. **Create spec deltas:** \`specs/[capability]/spec.md\`
\`\`\`markdown
## ADDED Requirements
### Requirement: New Feature
The system SHALL provide...

#### Scenario: Success case
- **WHEN** user performs action
- **THEN** expected result

## MODIFIED Requirements
### Requirement: Existing Feature
[Complete modified requirement]

## REMOVED Requirements
### Requirement: Old Feature
**Reason**: [Why removing]
**Migration**: [How to handle]
\`\`\`

4. **Create tasks.md:**
\`\`\`markdown
## 1. Category Name
- [ ] 1.1 First task
- [ ] 1.2 Second task

## 2. Another Category
- [ ] 2.1 Task description
- [ ] 2.2 Another task
\`\`\`

5. **Create design.md when needed:**
Create \`design.md\` if any of the following apply:
- Cross-cutting change (multiple services/modules) or new architectural pattern
- New external dependency or significant data model changes
- Security, performance, or migration complexity
- Ambiguity that benefits from technical decisions before coding

## Spec File Format

### Critical: Scenario Formatting

**CORRECT** (use #### headers):
\`\`\`markdown
#### Scenario: User login success
- **WHEN** valid credentials provided
- **THEN** return JWT token
\`\`\`

**WRONG** (don't use bullets or bold):
\`\`\`markdown
- **Scenario: User login**  ❌
**Scenario**: User login     ❌
### Scenario: User login      ❌
\`\`\`

Every requirement MUST have at least one scenario.

### Requirement Wording

- Use SHALL/MUST for normative requirements
- Avoid should/may unless intentionally non-normative

### Delta Operations

- \`## ADDED Requirements\` - New capabilities
- \`## MODIFIED Requirements\` - Changed behavior
- \`## REMOVED Requirements\` - Deprecated features
- \`## RENAMED Requirements\` - Name changes

### When to use ADDED vs MODIFIED

- **ADDED**: Introduces a new capability that can stand alone
- **MODIFIED**: Changes behavior of an existing requirement. Always paste the full, updated requirement content (header + all scenarios)
- **RENAMED**: Use when only the name changes

Common pitfall: Using MODIFIED to add a new concern without including the previous text. This causes loss of detail at archive time.

## Task Format

Tasks live in \`tasks.md\` within each change folder.

### Format
\`\`\`markdown
## 1. Category Name
- [ ] 1.1 Task description
- [ ] 1.2 Another task
- [x] 1.3 Completed task

## 2. Implementation
- [ ] 2.1 Create component
- [ ] 2.2 Add tests
\`\`\`

### Status Icons
- \`[ ]\` - Pending
- \`[-]\` - In progress (optional, for tracking)
- \`[x]\` - Completed

### Best Practices

- Group related tasks under numbered categories
- Use decimal numbering (1.1, 1.2, 2.1, etc.)
- Keep tasks small and verifiable
- Include testing tasks explicitly

### Enhanced Task Format

Add priority tags and detail links:

\`\`\`markdown
## 1. Setup [HIGH]
- [ ] 1.1 Create database schema → [📝 details](tasks/1.1-create-database-schema.md)
- [ ] 1.2 Implement API endpoint

## 2. Frontend [MEDIUM]
- [ ] 2.1 Create form component
  - depends: 1.2
\`\`\`

Priority levels: \`[CRITICAL]\`, \`[HIGH]\`, \`[MEDIUM]\`, \`[LOW]\`

### Task Detail Files

For complex tasks, create detailed implementation files in \`tasks/\`:

\`\`\`markdown
---
id: "1.1"
title: "Create database schema"
priority: high
depends: []
status: pending
created_at: "2025-12-05T00:00:00Z"
---

## Description
Create the user table with required fields.

## Implementation Details
...code here...

## Files to Modify
1. \`migrations/001_users.sql\` - Add migration file
2. \`src/models/user.ts\` - Add type definition

## Test Strategy
- [ ] Run migration on test database
- [ ] Verify table schema matches spec
\`\`\`

Create detail files with: \`task-magic task detail <id>\`

## Memory Archive

### CHANGES_LOG.md Format

When archiving, append an entry:

\`\`\`markdown
- **2025-01-15 change-id**: Brief description (Status: Completed)
  > Tasks: 5/5 complete
  > Specs updated: capability-name
\`\`\`

### Archive Structure

\`\`\`
memory/
├── changes/
│   └── 2025-01-15-change-id/
│       ├── proposal.md
│       ├── tasks.md
│       ├── design.md (if existed)
│       └── specs/
└── CHANGES_LOG.md
\`\`\`

## Troubleshooting

### Common Errors

**"Change must have at least one delta"**
- Check \`changes/[name]/specs/\` exists with .md files
- Verify files have operation prefixes (## ADDED Requirements)

**"Requirement must have at least one scenario"**
- Check scenarios use \`#### Scenario:\` format (4 hashtags)
- Don't use bullet points or bold for scenario headers

### Validation Tips

\`\`\`bash
# Always use strict mode for comprehensive checks
task-magic validate [change] --strict

# Debug delta parsing
task-magic show [change] --json --deltas-only
\`\`\`

## Best Practices

### Simplicity First
- Default to <100 lines of new code
- Single-file implementations until proven insufficient
- Avoid frameworks without clear justification
- Choose boring, proven patterns

### Complexity Triggers
Only add complexity with:
- Performance data showing current solution too slow
- Concrete scale requirements
- Multiple proven use cases requiring abstraction

### Change ID Naming
- Use kebab-case, short and descriptive: \`add-two-factor-auth\`
- Prefer verb-led prefixes: \`add-\`, \`update-\`, \`remove-\`, \`refactor-\`
- Ensure uniqueness

### Capability Naming
- Use verb-noun: \`user-auth\`, \`payment-capture\`
- Single purpose per capability
- 10-minute understandability rule

## Quick Reference

### Stage Indicators
- \`changes/\` - Proposed, not yet built
- \`specs/\` - Built and deployed
- \`memory/\` - Completed changes

### File Purposes
- \`proposal.md\` - Why and what
- \`tasks.md\` - Implementation steps
- \`design.md\` - Technical decisions
- \`spec.md\` - Requirements and behavior

### CLI Essentials
\`\`\`bash
task-magic list              # What's in progress?
task-magic show [item]       # View details
task-magic validate --strict # Is it correct?
task-magic archive <id> --yes  # Mark complete
\`\`\`

Remember: Specs are truth. Changes are proposals. Keep them in sync.
`;

const CHANGES_TEMPLATE = `# Active Changes

No active changes yet.

<!-- 
Format:
- [ ] **change-id**: Brief description
  > X/Y tasks complete
-->
`;

const CHANGES_LOG_TEMPLATE = `# Changes Log

Chronological record of archived changes.

<!-- Entries are appended automatically by task-magic archive -->
`;

const CURSOR_RULE_TEMPLATE = `---
description: Task Magic Instructions for spec-driven development
globs: ["**/*"]
alwaysApply: true
---
# Task Magic Instructions

This project uses Task Magic for spec-driven development.

**Always open \`.ai/AGENTS.md\`** when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts
- Sounds ambiguous and you need guidance before coding

Use \`.ai/AGENTS.md\` to learn:
- How to create and execute change proposals
- Spec format and conventions
- Task format and workflow
- CLI command reference

## Quick Reference

\`\`\`bash
# CLI commands (supports numeric indexes!)
task-magic list                  # List changes with [1], [2]... indexes
task-magic list --specs          # List specifications  
task-magic show 1                # Show change by index
task-magic show <change-id>      # Show change by name
task-magic validate 1            # Validate by index
task-magic archive 1 --yes       # Archive by index
task-magic sync                  # Update CHANGES.md
\`\`\`

## Cursor Commands

- \`/proposal\` - Create a new change proposal
- \`/execute\` - Implement an approved change
- \`/archive\` - Archive a completed change
- \`/quick-fix\` - Create a minimal change for simple fixes
- \`/task-detail\` - Add implementation details to a task
- \`/task-dryrun\` - Generate dry-run preview for a group of tasks
`;

// ============================================================================
// Cursor Command Templates
// ============================================================================

const PROPOSAL_COMMAND = `---
name: /proposal
id: proposal
category: Task Magic
description: Scaffold a new change proposal and validate strictly.
---
**Guardrails**
- Favor straightforward, minimal implementations first and add complexity only when requested.
- Keep changes tightly scoped to the requested outcome.
- Refer to \`.ai/AGENTS.md\` for conventions and clarifications.
- Identify vague or ambiguous details and ask follow-up questions before editing files.
- Do not write any code during the proposal stage. Only create design documents.

**Steps**
1. Review \`.ai/project.md\`, run \`task-magic list\` and \`task-magic list --specs\` to understand context.
2. Choose a unique verb-led \`change-id\` and scaffold \`proposal.md\`, \`tasks.md\`, and \`design.md\` (when needed) under \`.ai/changes/<id>/\`.
3. Map the change into concrete requirements, breaking multi-scope efforts into distinct spec deltas.
4. Capture architectural reasoning in \`design.md\` when the solution spans multiple systems.
5. Draft spec deltas in \`.ai/changes/<id>/specs/<capability>/spec.md\` using \`## ADDED|MODIFIED|REMOVED Requirements\` with at least one \`#### Scenario:\` per requirement.
6. Draft \`tasks.md\` as an ordered list of small, verifiable work items.
7. Validate with \`task-magic validate <id> --strict\` and resolve every issue before sharing.

**Reference**
- Use \`task-magic show <id> --json --deltas-only\` to inspect details when validation fails.
- Search existing requirements with \`rg -n "Requirement:|Scenario:" .ai/specs\` before writing new ones.
`;

const EXECUTE_COMMAND = `---
name: /execute
id: execute
category: Task Magic
description: Implement an approved change and keep tasks in sync.
---
**Guardrails**
- Favor straightforward, minimal implementations first and add complexity only when requested.
- Keep changes tightly scoped to the requested outcome.
- Refer to \`.ai/AGENTS.md\` for conventions and clarifications.

**Steps**
Track these steps as TODOs and complete them one by one.
1. Run \`task-magic list\` to see active changes with numeric indexes.
2. Use \`task-magic show 1\` (or the appropriate index/change-id) to read proposal.md, design.md, and tasks.md.
3. Work through tasks sequentially, keeping edits minimal and focused.
4. Confirm completion before updating statuses—make sure every item in \`tasks.md\` is finished.
5. Update the checklist after all work is done so each task is marked \`- [x]\`.
6. Run \`task-magic sync\` to update CHANGES.md with current progress.

**Tip**: You can use numeric indexes instead of full change-ids:
- \`task-magic show 1\` instead of \`task-magic show my-long-change-id\`
- \`task-magic validate 1\` instead of \`task-magic validate my-long-change-id\`

**Reference**
- Use \`task-magic show <id> --json --deltas-only\` for additional context while implementing.
`;

const ARCHIVE_COMMAND = `---
name: /archive
id: archive
category: Task Magic
description: Archive a deployed change and update specs.
---
**Guardrails**
- Favor straightforward, minimal implementations first and add complexity only when requested.
- Keep changes tightly scoped to the requested outcome.
- Refer to \`.ai/AGENTS.md\` for conventions and clarifications.

**Steps**
1. Run \`task-magic list\` to see active changes with numeric indexes.
2. Determine which change to archive:
   - If this prompt includes a specific change ID or index, use that value.
   - Otherwise, confirm with user which change to archive.
3. Run \`task-magic archive 1 --yes\` (using index) or \`task-magic archive <change-id> --yes\`.
4. Review the command output to confirm specs were updated and change archived.
5. Validate with \`task-magic validate --strict\` if anything looks off.

**Tip**: You can use numeric indexes:
- \`task-magic archive 1 --yes\` instead of \`task-magic archive my-long-change-id --yes\`

**Reference**
- Use \`task-magic list\` to see changes with indexes.
- Inspect refreshed specs with \`task-magic list --specs\`.
`;

const QUICK_FIX_COMMAND = `---
name: /quick-fix
id: quick-fix
category: Task Magic
description: Create a minimal change for simple fixes.
---
**Guardrails**
- Use this for simple, focused changes that don't need extensive planning.
- Keep the proposal brief (1-2 sentences for "Why").
- Still create proper spec deltas if behavior changes.

**Steps**
1. Review \`.ai/project.md\` briefly for context.
2. Create a minimal change folder: \`.ai/changes/<id>/\`
   - \`proposal.md\` with brief Why/What/Impact
   - \`tasks.md\` with 1-3 tasks maximum
   - Skip \`design.md\` unless truly needed
3. If behavior changes, add spec deltas in \`.ai/changes/<id>/specs/\`
4. Validate with \`task-magic validate <id>\` (strict not required for quick fixes).
5. Implement immediately after validation passes.

**Example Quick Proposal**
\`\`\`markdown
# Change: Fix login timeout

## Why
Users are getting logged out too quickly (5 min → 30 min).

## What Changes
- Update session timeout from 5 to 30 minutes

## Impact
- Affected specs: user-auth
- Affected code: config/session.ts
\`\`\`

**Example Quick Tasks**
\`\`\`markdown
## 1. Fix
- [ ] 1.1 Update session timeout value in config
- [ ] 1.2 Verify with manual test
\`\`\`
`;

const TASK_DETAIL_COMMAND = `---
name: /task-detail
id: task-detail
category: Task Magic
description: Create or view detailed implementation for a task.
---
**Guardrails**
- Use this to add implementation code, file paths, and test strategies to a task.
- This creates a separate detail file in \`tasks/\` folder.
- Refer to \`.ai/AGENTS.md\` for task detail format.

**Steps**
1. Identify the task ID (e.g., \`1.1\`, \`2.3\`) from user request or context.
2. If no change is specified and multiple changes exist, ask which change.
3. Run \`task-magic task detail <task-id>\` to create the detail file template.
4. Fill in the Implementation Details section with actual code:
   - Add copy-paste ready code blocks with language tags
   - List all files that need to be modified
   - Include test strategy
5. The task in \`tasks.md\` will automatically get a link to the detail file.

**Task Detail File Format**
\`\`\`yaml
---
id: "1.1"
title: "Task Title"
priority: high
depends: ["1.0"]
status: pending
created_at: "2025-12-05T00:00:00Z"
---

## Description
What this task accomplishes.

## Implementation Details
\`\`\`typescript
// Actual implementation code here
\`\`\`

## Files to Modify
1. \`path/to/file.ts\` - Add function X
2. \`path/to/other.ts\` - Update import

## Test Strategy
- [ ] Unit test for function X
- [ ] Integration test for workflow
\`\`\`

**Reference**
- \`task-magic task show <id>\` - View task with details
- \`task-magic task list\` - List all tasks in current change
`;

const TASK_DRYRUN_COMMAND = `---
name: /task-dryrun
id: task-dryrun
category: Task Magic
description: Generate a dry-run preview for a group of tasks without creating individual detail files.
---
**Guardrails**
- Use this when you want to preview how tasks will be executed without creating separate files.
- Ideal for small, repetitive tasks (like test cases) that don't need individual detail files.
- Generates inline expansion in \`tasks.md\` OR a single \`dryrun.md\` file.
- Refer to \`.ai/AGENTS.md\` for task format conventions.

**Steps**
1. Identify the change directory from user request or by running \`task-magic list\`.
2. Read \`proposal.md\`, \`design.md\` (if exists), and \`tasks.md\` to understand context.
3. Ask user which task group to dry-run (e.g., "Section 4" or "tasks 4.1-4.8") if not specified.
4. Choose output mode based on task complexity:
   - **Inline mode** (default): Expand tasks directly in \`tasks.md\` with indented details
   - **File mode**: Create a single \`dryrun.md\` with all task previews
5. Generate dry-run content with: Setup, Input, Command, Expected output, Verification steps.

**Inline Mode Format** (directly in tasks.md)
\`\`\`markdown
## 4. Testing [MEDIUM]
- [ ] 4.1 TC-1: Single register (guaranteed broadcast)
  - **Setup**: \\\`cd build && source setup.sh\\\`
  - **Input**: RegA: instr=0x12, data=0x5678
  - **Command**: \\\`JET_DEBUG=1 ./run_test single_reg 2>&1 | grep "DEBUG:5c"\\\`
  - **Expected**: Uses broadcast directly (size=1 optimization)
  - **Verify**: Output shows "5c: single register, using broadcast"

- [ ] 4.2 TC-2: Same instruction, suffix compatible
  - **Input**: RegA 32-bit=0x12345678, RegB 16-bit=0x5678
  - **Command**: \\\`./run_test suffix_compat\\\`
  - **Expected**: Both in same 5c group, saveCount > 0
  - **Verify**: ShiftData shows clusterBroadcast=true
\`\`\`

**File Mode Format** (creates dryrun.md in change folder)
\`\`\`markdown
# Dry Run: [Change Name]

## Environment Setup
\\\`\\\`\\\`bash
cd /path/to/build
source setup.sh
export JET_DEBUG=1
\\\`\\\`\\\`

## Task Group: Testing (4.x)

### 4.1 TC-1: Single Register
| Step | Action |
|------|--------|
| 1 | Prepare input: RegA with instr=0x12, data=0x5678 |
| 2 | Run: \\\`./run_test single_reg\\\` |
| 3 | Verify: Output contains "5c: single register" |
| 4 | Check: ShiftData.clusterBroadcast == true |
\`\`\`

**When to Use Each Mode**
- **Inline mode**: Quick reference, few tasks, tasks won't change much
- **File mode**: Complex setup, shared environment, detailed verification steps

**Inline Detail Fields**
- **Setup**: One-time environment setup (optional, omit if obvious)
- **Input**: Test data or preconditions
- **Command**: Exact command to run
- **Expected**: What success looks like
- **Verify**: How to confirm the result

**Reference**
- This is lighter than \`/task-detail\` which creates one file per task
- Use when you have many small tasks (like test cases) that don't warrant individual files
- Combine with \`design.md\` for implementation context
`;
