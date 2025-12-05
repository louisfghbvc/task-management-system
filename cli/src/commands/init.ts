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

## Quick Start

\`\`\`bash
task-magic list                  # List active changes
task-magic list --specs          # List specifications
task-magic show <item>           # Display details
task-magic validate <change>     # Validate change
task-magic archive <id> --yes    # Archive completed change
\`\`\`

## Workflow

1. **Propose** - Create change with proposal.md, tasks.md, and spec deltas
2. **Implement** - Work through tasks, mark complete
3. **Archive** - Run \`task-magic archive <id>\` to finalize

## Directory Structure

\`\`\`
.ai/
├── project.md              # Project conventions
├── AGENTS.md               # AI instructions
├── CHANGES.md              # Active changes view
├── specs/                  # Built specifications
├── changes/                # Active proposals
│   └── [change-name]/
│       ├── proposal.md
│       ├── tasks.md
│       └── specs/
└── memory/                 # Archive
    └── changes/
\`\`\`

See the full AGENTS.md for complete instructions.
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
