# Scripts Directory

This directory contains utility scripts for the portfolio project.

## Cleanup Scripts

### NPM Scripts (package.json)

The following cleanup scripts are available in `package.json`:

- **`npm run clean`** - Clean build artifacts and cache
- **`npm run clean:build`** - Remove build directories (.next, out, build, dist)
- **`npm run clean:cache`** - Remove cache directories and TypeScript build info
- **`npm run clean:modules`** - Remove node_modules and package-lock.json
- **`npm run clean:all`** - Full cleanup including system files
- **`npm run reinstall`** - Clean modules and reinstall dependencies
- **`npm run fresh`** - Complete fresh start (clean all + reinstall)

### Shell Scripts

#### Unix/macOS/Linux

**`./scripts/cleanup.sh`** - Comprehensive cleanup script with options:

```bash
# Make executable (first time only)
chmod +x scripts/cleanup.sh

# Usage
./scripts/cleanup.sh [option]

# Options:
./scripts/cleanup.sh        # Default cleanup
./scripts/cleanup.sh full   # Full cleanup including node_modules
./scripts/cleanup.sh reinstall  # Clean modules and reinstall
./scripts/cleanup.sh fresh  # Complete fresh start
./scripts/cleanup.sh help   # Show help
```

#### Windows

**`scripts\cleanup.bat`** - Windows batch file version:

```cmd
# Usage
scripts\cleanup.bat [option]

# Options:
scripts\cleanup.bat        # Default cleanup
scripts\cleanup.bat full   # Full cleanup including node_modules
scripts\cleanup.bat reinstall  # Clean modules and reinstall
scripts\cleanup.bat fresh  # Complete fresh start
scripts\cleanup.bat help   # Show help
```

## What Gets Cleaned

### Build Artifacts
- `.next/` - Next.js build directory
- `out/` - Static export directory
- `build/` - Build output directory
- `dist/` - Distribution directory

### Cache Directories
- `.cache/` - General cache
- `.parcel-cache/` - Parcel bundler cache
- `.turbo/` - Turborepo cache
- `.swc/` - SWC compiler cache
- `.eslintcache` - ESLint cache

### TypeScript Files
- `tsconfig.tsbuildinfo` - TypeScript build info
- `next-env.d.ts` - Next.js TypeScript definitions

### Dependencies (full cleanup)
- `node_modules/` - Installed packages
- `package-lock.json` - Lock file

### System Files
- `.DS_Store` - macOS system files
- `*.log` - Log files
- `npm-debug.log*` - NPM debug logs
- `yarn-debug.log*` - Yarn debug logs
- `yarn-error.log*` - Yarn error logs

## When to Use Each Option

- **`clean`** - Regular maintenance, after builds, before commits
- **`full`** - When you want to free up disk space
- **`reinstall`** - When dependencies are corrupted or outdated
- **`fresh`** - Complete reset, useful for troubleshooting

## Examples

### Quick cleanup after development
```bash
npm run clean
```

### Free up disk space
```bash
npm run clean:all
```

### Fix dependency issues
```bash
npm run reinstall
```

### Complete project reset
```bash
npm run fresh
```

### Using shell scripts directly
```bash
# Unix/macOS/Linux
./scripts/cleanup.sh full

# Windows
scripts\cleanup.bat fresh
```

## Safety Features

- Scripts check if files/directories exist before removing
- Colored output for better visibility
- Error handling and status messages
- Safe removal with confirmation (where applicable)

## Troubleshooting

If you encounter permission issues:

```bash
# Make script executable
chmod +x scripts/cleanup.sh

# Run with sudo if needed (be careful!)
sudo ./scripts/cleanup.sh
```

For Windows, run Command Prompt as Administrator if needed.
