# Task Magic Instructions

This project uses Task Magic for spec-driven development.

**Always open `.ai/AGENTS.md`** when the request:
- Mentions planning or proposals (words like proposal, spec, change, plan)
- Introduces new capabilities, breaking changes, architecture shifts
- Sounds ambiguous and you need guidance before coding

Use `.ai/AGENTS.md` to learn:
- How to create and apply change proposals
- Spec format and conventions
- Task format and workflow
- CLI command reference

## Quick Reference

```bash
# CLI commands
task-magic list                  # List active changes
task-magic list --specs          # List specifications  
task-magic show <item>           # Display details
task-magic validate <change>     # Validate change
task-magic archive <id> --yes    # Archive completed change
task-magic sync                  # Update CHANGES.md
```

## Cursor Commands

- `/proposal` - Create a new change proposal
- `/apply` - Implement an approved change
- `/archive` - Archive a completed change
- `/quick-fix` - Create a minimal change for simple fixes
