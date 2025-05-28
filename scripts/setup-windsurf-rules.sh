#!/bin/bash

# Setup Windsurf Rules for New Projects
# Usage: ./setup-windsurf-rules.sh /path/to/new-project

PROJECT_PATH=$1
SOURCE_RULES="/users/sinclair/projects/mestory/.windsurfrules"

if [ -z "$PROJECT_PATH" ]; then
    echo "❌ Usage: $0 /path/to/new-project"
    exit 1
fi

if [ ! -d "$PROJECT_PATH" ]; then
    echo "❌ Project directory does not exist: $PROJECT_PATH"
    exit 1
fi

echo "🔧 Setting up Windsurf rules for project: $PROJECT_PATH"

# Copy the entire .windsurfrules file
cp "$SOURCE_RULES" "$PROJECT_PATH/.windsurfrules"

echo "✅ Windsurf rules copied successfully!"
echo "📋 Rules include:"
echo "   - DEV_WORKFLOW: Task management guidelines"
echo "   - CODE_SEARCH: search_code alternatives with ripgrep"
echo "   - WINDSURF_RULES: Rule formatting guidelines"
echo "   - SELF_IMPROVE: Continuous improvement process"

echo ""
echo "🎯 Next steps:"
echo "   1. Open the project in Windsurf IDE"
echo "   2. Customize .windsurfrules for your specific project needs"
echo "   3. Add project-specific sections as needed"

# Make the script executable
chmod +x "$PROJECT_PATH/setup-windsurf-rules.sh" 2>/dev/null || true
