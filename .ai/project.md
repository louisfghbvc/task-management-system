# Project Context

## Purpose

Task Magic is a file-based AI task management system that enables spec-driven development for AI coding assistants. It provides a unified workflow for planning features, managing development tasks, and maintaining historical context.

## Tech Stack

- TypeScript (CLI tool)
- Node.js (runtime)
- Markdown (all specs, changes, and documentation)

## Project Conventions

### Code Style

- Use TypeScript with strict mode
- Prefer functional patterns over classes where appropriate
- Use kebab-case for file names, camelCase for variables/functions

### Architecture Patterns

- **Change-centric workflow**: All work organized as "changes" with embedded tasks
- **Spec-driven development**: Requirements defined before implementation
- **File-based persistence**: All state in Markdown files within `.ai/`

### Testing Strategy

- Test CLI commands with integration tests
- Validate spec format with built-in validators
- Manual workflow testing for Cursor commands

### Git Workflow

- Feature branches for changes
- Conventional commits: `type(scope): message`
- Archive changes after merge

## Domain Context

### Key Concepts

- **Change**: A proposal for modifying the system (contains proposal.md, tasks.md, specs/)
- **Spec**: A formal requirement with scenarios describing expected behavior
- **Task**: A checkable item within a change's tasks.md
- **Memory**: Archive of completed changes for historical context

### Workflow Stages

1. **Propose** - Create change with proposal, tasks, and spec deltas
2. **Implement** - Work through tasks, mark complete
3. **Archive** - Move to memory, apply spec deltas

## Important Constraints

- All content must stay within `.ai/` directory
- Tasks must belong to a change (no standalone tasks)
- Specs must use ADDED/MODIFIED/REMOVED format
- Each requirement must have at least one scenario

## External Dependencies

- Node.js >= 18
- npm for package management

