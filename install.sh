#!/bin/bash
# Task Magic Installation Script

set -e

echo "🚀 Installing Task Magic..."
echo ""

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

# Check Node.js
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is required but not installed.${NC}"
    echo "   Please install Node.js >= 18: https://nodejs.org/"
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo -e "${YELLOW}⚠️  Node.js version $NODE_VERSION detected. Version 18+ recommended.${NC}"
fi

# Check npm
if ! command -v npm &> /dev/null; then
    echo -e "${RED}❌ npm is required but not installed.${NC}"
    exit 1
fi

echo "📦 Installing CLI dependencies..."
cd "$SCRIPT_DIR/cli"
npm install --silent

echo "🔨 Building CLI..."
npm run build --silent

echo "🔗 Linking CLI globally..."
npm link --silent 2>/dev/null || {
    echo -e "${YELLOW}⚠️  npm link failed (may need sudo). Trying with sudo...${NC}"
    sudo npm link --silent
}

# Verify installation
if command -v task-magic &> /dev/null; then
    echo -e "${GREEN}✅ task-magic CLI installed successfully!${NC}"
    echo ""
    task-magic --version
else
    echo -e "${RED}❌ Installation failed. Please check errors above.${NC}"
    exit 1
fi

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo -e "${GREEN}🎉 Task Magic installed successfully!${NC}"
echo ""
echo "Quick Start:"
echo "  task-magic --help          # Show all commands"
echo "  task-magic init            # Initialize a new project"
echo "  task-magic list            # List active changes"
echo ""
echo "Cursor Commands:"
echo "  /proposal                  # Create a change proposal"
echo "  /apply                     # Implement a change"
echo "  /archive                   # Archive completed change"
echo ""
echo "Documentation:"
echo "  .ai/AGENTS.md              # AI instructions"
echo "  README.md                  # Full documentation"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

