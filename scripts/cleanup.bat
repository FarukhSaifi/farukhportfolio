@echo off
setlocal enabledelayedexpansion

REM Comprehensive cleanup script for the portfolio project (Windows)
REM Usage: scripts\cleanup.bat [option]

echo 🧹 Starting cleanup process...

if "%1"=="" set "option=clean"
if "%1"=="help" set "option=help"
if "%1"=="-h" set "option=help"
if "%1"=="--help" set "option=help"
if "%1"=="clean" set "option=clean"
if "%1"=="full" set "option=full"
if "%1"=="reinstall" set "option=reinstall"
if "%1"=="fresh" set "option=fresh"

if "%option%"=="help" goto :show_help
if "%option%"=="clean" goto :cleanup
if "%option%"=="full" goto :full_cleanup
if "%option%"=="reinstall" goto :reinstall
if "%option%"=="fresh" goto :fresh_start

echo [ERROR] Unknown option: %1
goto :show_help

:cleanup
echo [INFO] Cleaning build artifacts...
if exist ".next" (
    rmdir /s /q ".next"
    echo [SUCCESS] Removed: .next
)
if exist "out" (
    rmdir /s /q "out"
    echo [SUCCESS] Removed: out
)
if exist "build" (
    rmdir /s /q "build"
    echo [SUCCESS] Removed: build
)
if exist "dist" (
    rmdir /s /q "dist"
    echo [SUCCESS] Removed: dist
)

echo [INFO] Cleaning cache directories...
if exist ".cache" (
    rmdir /s /q ".cache"
    echo [SUCCESS] Removed: .cache
)
if exist ".parcel-cache" (
    rmdir /s /q ".parcel-cache"
    echo [SUCCESS] Removed: .parcel-cache
)
if exist ".turbo" (
    rmdir /s /q ".turbo"
    echo [SUCCESS] Removed: .turbo
)
if exist ".swc" (
    rmdir /s /q ".swc"
    echo [SUCCESS] Removed: .swc
)
if exist ".eslintcache" (
    rmdir /s /q ".eslintcache"
    echo [SUCCESS] Removed: .eslintcache
)

echo [INFO] Cleaning TypeScript build info...
if exist "tsconfig.tsbuildinfo" (
    del "tsconfig.tsbuildinfo"
    echo [SUCCESS] Removed: tsconfig.tsbuildinfo
)
if exist "next-env.d.ts" (
    del "next-env.d.ts"
    echo [SUCCESS] Removed: next-env.d.ts
)

echo [INFO] Cleaning log files...
del /q *.log 2>nul
del /q npm-debug.log* 2>nul
del /q yarn-debug.log* 2>nul
del /q yarn-error.log* 2>nul

echo [SUCCESS] Cleanup completed successfully!
goto :end

:full_cleanup
echo [INFO] Performing full cleanup (including node_modules)...
call :cleanup

echo [INFO] Removing node_modules and package-lock.json...
if exist "node_modules" (
    rmdir /s /q "node_modules"
    echo [SUCCESS] Removed: node_modules
)
if exist "package-lock.json" (
    del "package-lock.json"
    echo [SUCCESS] Removed: package-lock.json
)

echo [SUCCESS] Full cleanup completed successfully!
goto :end

:reinstall
echo [INFO] Reinstalling dependencies...
call :full_cleanup

if exist "package.json" (
    npm install
    echo [SUCCESS] Dependencies reinstalled successfully!
) else (
    echo [ERROR] package.json not found!
    exit /b 1
)
goto :end

:fresh_start
echo [INFO] Starting fresh installation...
call :full_cleanup
call :reinstall
echo [SUCCESS] Fresh start completed successfully!
goto :end

:show_help
echo Usage: %0 [option]
echo.
echo Options:
echo   clean       - Clean build artifacts and cache (default)
echo   full        - Full cleanup including node_modules
echo   reinstall   - Clean modules and reinstall dependencies
echo   fresh       - Full cleanup and fresh install
echo   help        - Show this help message
echo.
echo Examples:
echo   %0           # Default cleanup
echo   %0 full      # Full cleanup
echo   %0 fresh     # Fresh start
goto :end

:end
echo.
pause
