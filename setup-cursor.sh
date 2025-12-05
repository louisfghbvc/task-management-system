#!/bin/bash
# Task Magic - Cursor IDE Setup Script
# Run this in your target project directory to set up Task Magic

set -e

echo "🎯 Task Magic - Cursor Setup"
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

# Get source directory (where this script lives)
SOURCE_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
TARGET_DIR="${1:-.}"

# Resolve target directory
TARGET_DIR="$(cd "$TARGET_DIR" && pwd)"

echo -e "${CYAN}Source:${NC} $SOURCE_DIR"
echo -e "${CYAN}Target:${NC} $TARGET_DIR"
echo ""

# Confirm
read -p "Set up Task Magic in $TARGET_DIR? [y/N] " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Aborted."
    exit 0
fi

echo ""
echo "📁 Creating directory structure..."

# Create .ai structure
mkdir -p "$TARGET_DIR/.ai/specs"
mkdir -p "$TARGET_DIR/.ai/changes"
mkdir -p "$TARGET_DIR/.ai/memory/changes"

# Create .cursor/commands structure
mkdir -p "$TARGET_DIR/.cursor/commands"

echo "📝 Copying configuration files..."

# Copy AGENTS.md
if [ ! -f "$TARGET_DIR/.ai/AGENTS.md" ]; then
    cp "$SOURCE_DIR/.ai/AGENTS.md" "$TARGET_DIR/.ai/AGENTS.md"
    echo -e "  ${GREEN}✓${NC} .ai/AGENTS.md"
else
    echo -e "  ${YELLOW}⊘${NC} .ai/AGENTS.md (exists, skipped)"
fi

# Copy or create project.md
if [ ! -f "$TARGET_DIR/.ai/project.md" ]; then
    cat > "$TARGET_DIR/.ai/project.md" << 'EOF'
# Project Context

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

## Domain Context
[Add domain-specific knowledge]
EOF
    echo -e "  ${GREEN}✓${NC} .ai/project.md"
else
    echo -e "  ${YELLOW}⊘${NC} .ai/project.md (exists, skipped)"
fi

# Create CHANGES.md
if [ ! -f "$TARGET_DIR/.ai/CHANGES.md" ]; then
    echo "# Active Changes" > "$TARGET_DIR/.ai/CHANGES.md"
    echo "" >> "$TARGET_DIR/.ai/CHANGES.md"
    echo "No active changes." >> "$TARGET_DIR/.ai/CHANGES.md"
    echo -e "  ${GREEN}✓${NC} .ai/CHANGES.md"
else
    echo -e "  ${YELLOW}⊘${NC} .ai/CHANGES.md (exists, skipped)"
fi

# Create CHANGES_LOG.md
if [ ! -f "$TARGET_DIR/.ai/memory/CHANGES_LOG.md" ]; then
    echo "# Changes Log" > "$TARGET_DIR/.ai/memory/CHANGES_LOG.md"
    echo -e "  ${GREEN}✓${NC} .ai/memory/CHANGES_LOG.md"
else
    echo -e "  ${YELLOW}⊘${NC} .ai/memory/CHANGES_LOG.md (exists, skipped)"
fi

# Copy Cursor commands
echo ""
echo "⌨️  Copying Cursor commands..."

for cmd in proposal apply archive quick-fix task-detail; do
    if [ -f "$SOURCE_DIR/.cursor/commands/$cmd.md" ]; then
        cp "$SOURCE_DIR/.cursor/commands/$cmd.md" "$TARGET_DIR/.cursor/commands/"
        echo -e "  ${GREEN}✓${NC} /$cmd"
    fi
done

# Create root AGENTS.md
if [ ! -f "$TARGET_DIR/AGENTS.md" ]; then
    cat > "$TARGET_DIR/AGENTS.md" << 'EOF'
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
- `/task-detail` - Add implementation details to a task
EOF
    echo -e "  ${GREEN}✓${NC} AGENTS.md (root)"
else
    echo -e "  ${YELLOW}⊘${NC} AGENTS.md (exists, skipped)"
fi

# Update .gitignore
echo ""
echo "📄 Updating .gitignore..."
GITIGNORE="$TARGET_DIR/.gitignore"

# Items to add to gitignore
IGNORE_ITEMS=(
    "node_modules/"
    "*.log"
    ".DS_Store"
)

for item in "${IGNORE_ITEMS[@]}"; do
    if [ -f "$GITIGNORE" ] && grep -qF "$item" "$GITIGNORE"; then
        : # Already exists
    else
        echo "$item" >> "$GITIGNORE"
    fi
done
echo -e "  ${GREEN}✓${NC} .gitignore updated"

# Check if task-magic CLI is installed
echo ""
if command -v task-magic &> /dev/null; then
    echo -e "${GREEN}✓ task-magic CLI is installed${NC}"
    task-magic --version
else
    echo -e "${YELLOW}⚠️  task-magic CLI not found${NC}"
    echo "   Run this to install:"
    echo "   cd $SOURCE_DIR && ./install.sh"
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}🎉 Task Magic setup complete!${NC}"
echo ""
echo "Files created in $TARGET_DIR:"
echo "  .ai/AGENTS.md              # AI instructions"
echo "  .ai/project.md             # Project context (edit this!)"
echo "  .ai/CHANGES.md             # Active changes view"
echo "  .cursor/commands/*.md      # Cursor slash commands"
echo "  AGENTS.md                  # Root instructions"
echo ""
echo "Next steps:"
echo "  1. Edit .ai/project.md with your project details"
echo "  2. Restart Cursor to load the new commands"
echo "  3. Use /proposal to create your first change"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

