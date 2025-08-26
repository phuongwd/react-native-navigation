#!/bin/bash

# React Native Navigation - Python Setup for git-clang-format
# This script creates a Python wrapper for the pre-commit hook

# Create a local bin directory if it doesn't exist
mkdir -p ./tmp-bin

# Create a Python wrapper script
cat > ./tmp-bin/python << 'EOF'
#!/bin/bash
# Wrapper to redirect python to python3
exec python3 "$@"
EOF

# Make it executable
chmod +x ./tmp-bin/python

echo "✅ Python wrapper created at ./tmp-bin/python"
echo ""
echo "To use it temporarily in this terminal session:"
echo "  export PATH=\"\$PWD/tmp-bin:\$PATH\""
echo ""
echo "To make it permanent for this project, add to your .envrc or .env file:"
echo "  export PATH=\"\$PWD/tmp-bin:\$PATH\""