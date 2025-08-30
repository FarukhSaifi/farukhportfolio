#!/bin/bash

# Comprehensive cleanup script for the portfolio project
# Usage: ./scripts/cleanup.sh [option]

set -e

echo "🧹 Starting cleanup process..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if directory exists and remove it
safe_remove() {
    if [ -d "$1" ]; then
        rm -rf "$1"
        print_success "Removed: $1"
    else
        print_warning "Directory not found: $1"
    fi
}

# Function to check if file exists and remove it
safe_remove_file() {
    if [ -f "$1" ]; then
        rm -f "$1"
        print_success "Removed: $1"
    else
        print_warning "File not found: $1"
    fi
}

# Main cleanup function
cleanup() {
    print_status "Cleaning build artifacts..."
    safe_remove ".next"
    safe_remove "out"
    safe_remove "build"
    safe_remove "dist"
    
    print_status "Cleaning cache directories..."
    safe_remove ".cache"
    safe_remove ".parcel-cache"
    safe_remove ".turbo"
    safe_remove ".swc"
    safe_remove ".eslintcache"
    
    print_status "Cleaning TypeScript build info..."
    safe_remove_file "tsconfig.tsbuildinfo"
    safe_remove_file "next-env.d.ts"
    
    print_status "Cleaning log files..."
    rm -f *.log
    rm -f npm-debug.log*
    rm -f yarn-debug.log*
    rm -f yarn-error.log*
    
    print_status "Cleaning macOS system files..."
    find . -name ".DS_Store" -delete 2>/dev/null || true
    
    print_status "Cleaning temporary files..."
    find . -name "*.tmp" -delete 2>/dev/null || true
    find . -name "*.temp" -delete 2>/dev/null || true
    
    print_success "Cleanup completed successfully!"
}

# Full cleanup including node_modules
full_cleanup() {
    print_status "Performing full cleanup (including node_modules)..."
    cleanup
    
    print_status "Removing node_modules and package-lock.json..."
    safe_remove "node_modules"
    safe_remove_file "package-lock.json"
    
    print_success "Full cleanup completed successfully!"
}

# Reinstall function
reinstall() {
    print_status "Reinstalling dependencies..."
    if [ -f "package.json" ]; then
        npm install
        print_success "Dependencies reinstalled successfully!"
    else
        print_error "package.json not found!"
        exit 1
    fi
}

# Fresh start function
fresh_start() {
    print_status "Starting fresh installation..."
    full_cleanup
    reinstall
    print_success "Fresh start completed successfully!"
}

# Help function
show_help() {
    echo "Usage: $0 [option]"
    echo ""
    echo "Options:"
    echo "  clean       - Clean build artifacts and cache (default)"
    echo "  full        - Full cleanup including node_modules"
    echo "  reinstall   - Clean modules and reinstall dependencies"
    echo "  fresh       - Full cleanup and fresh install"
    echo "  help        - Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0           # Default cleanup"
    echo "  $0 full      # Full cleanup"
    echo "  $0 fresh     # Fresh start"
}

# Main script logic
case "${1:-clean}" in
    "clean")
        cleanup
        ;;
    "full")
        full_cleanup
        ;;
    "reinstall")
        full_cleanup
        reinstall
        ;;
    "fresh")
        fresh_start
        ;;
    "help"|"-h"|"--help")
        show_help
        ;;
    *)
        print_error "Unknown option: $1"
        show_help
        exit 1
        ;;
esac
