import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

export function initCommand(program: Command) {
  program
    .command('init')
    .description('Initialize .ai/ directory structure')
    .option('--force', 'Overwrite existing files')
    .action((options) => {
      initAiDirectory(options.force);
    });
}

function initAiDirectory(force?: boolean): void {
  const cwd = process.cwd();
  const aiDir = path.join(cwd, '.ai');
  
  // Check if already initialized
  if (fs.existsSync(aiDir) && !force) {
    console.log(chalk.yellow('.ai directory already exists. Use --force to reinitialize.'));
    return;
  }
  
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
  
  // Create project.md
  const projectPath = path.join(aiDir, 'project.md');
  if (!fs.existsSync(projectPath) || force) {
    fs.writeFileSync(projectPath, PROJECT_TEMPLATE);
    console.log(chalk.green('✓ Created project.md'));
  }
  
  // Create AGENTS.md
  const agentsPath = path.join(aiDir, 'AGENTS.md');
  if (!fs.existsSync(agentsPath) || force) {
    fs.writeFileSync(agentsPath, AGENTS_TEMPLATE);
    console.log(chalk.green('✓ Created AGENTS.md'));
  }
  
  // Create CHANGES.md
  const changesPath = path.join(aiDir, 'CHANGES.md');
  if (!fs.existsSync(changesPath) || force) {
    fs.writeFileSync(changesPath, CHANGES_TEMPLATE);
    console.log(chalk.green('✓ Created CHANGES.md'));
  }
  
  // Create CHANGES_LOG.md
  const logPath = path.join(aiDir, 'memory', 'CHANGES_LOG.md');
  if (!fs.existsSync(logPath) || force) {
    fs.writeFileSync(logPath, CHANGES_LOG_TEMPLATE);
    console.log(chalk.green('✓ Created memory/CHANGES_LOG.md'));
  }
  
  console.log(chalk.bold.green('\n✓ Task Magic initialized successfully!'));
  console.log(chalk.dim('\nNext steps:'));
  console.log(chalk.dim('  1. Edit .ai/project.md to describe your project'));
  console.log(chalk.dim('  2. Create your first change: task-magic list'));
  console.log(chalk.dim('  3. See all commands: task-magic --help'));
}

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

